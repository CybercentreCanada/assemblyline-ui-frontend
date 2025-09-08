import { PARAM_BLUEPRINTS } from 'components/core/SearchParams2/lib/search_params.blueprint';
import { SearchParamEngine } from 'components/core/SearchParams2/lib/search_params.engine';
import type { ParamBlueprints, SearchParamValues } from 'components/core/SearchParams2/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams2/lib/search_params.snapshot';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { Location, NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

export const createSearchParams = <Blueprints extends Record<string, ParamBlueprints>>(
  blueprints: (p: typeof PARAM_BLUEPRINTS) => Blueprints
) => {
  const createStore = (engine: SearchParamEngine<Blueprints>) => {
    const snapshotRef = { current: null as SearchParamSnapshot<Blueprints> | null };

    const refresh = (location: Location) => {
      snapshotRef.current = engine.fromLocation(location, snapshotRef.current);
    };

    const setParams = (value: URLSearchParams) => {
      snapshotRef.current = engine.fromParams(value, snapshotRef.current);
      return snapshotRef.current;
    };

    const setObject = (value: SearchParamValues<Blueprints>) => {
      snapshotRef.current = engine.fromObject(value, snapshotRef.current);
      return snapshotRef.current;
    };

    return {
      get snapshot() {
        return snapshotRef.current;
      },
      refresh,
      setParams,
      setObject
    };
  };

  const SearchParamsContext = createContext<ReturnType<typeof createStore> | null>(null);

  const SearchParamsProvider = React.memo(({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const engine = useMemo(() => new SearchParamEngine(blueprints(PARAM_BLUEPRINTS)), []);

    const storeRef = useRef<ReturnType<typeof createStore> | null>(null);
    if (!storeRef.current) {
      storeRef.current = createStore(engine);
      storeRef.current.refresh(location);
    }

    useEffect(() => {
      storeRef.current?.refresh(location);
    }, [location]);

    return <SearchParamsContext.Provider value={storeRef.current}>{children}</SearchParamsContext.Provider>;
  });

  const useSearchParams = () => {
    const navigate = useNavigate();
    const store = useContext(SearchParamsContext);

    if (!store) throw new Error('SearchParamsContext not found');

    const setParams = useCallback(
      (
        input: URLSearchParams | ((params: URLSearchParams) => URLSearchParams),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(store.snapshot.toParams()) : input;
        const snapshot = store.setParams(values);
        navigate({ search: snapshot.getSearch() }, { replace, state: snapshot.getState() });
      },
      [navigate, store]
    );

    const setObject = useCallback(
      (
        input:
          | SearchParamValues<Blueprints>
          | ((params: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(store.snapshot.toObject()) : input;
        const snapshot = store.setObject(values);
        navigate({ search: snapshot.getSearch() }, { replace, state: snapshot.getState() });
      },
      [navigate, store]
    );

    return { snapshot: store.snapshot, setParams, setObject };
  };

  return { SearchParamsProvider, useSearchParams };
};
