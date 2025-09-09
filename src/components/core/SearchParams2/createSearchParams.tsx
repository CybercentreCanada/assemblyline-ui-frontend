import { PARAM_BLUEPRINTS } from 'components/core/SearchParams2/lib/search_params.blueprint';
import { SearchParamEngine } from 'components/core/SearchParams2/lib/search_params.engine';
import type { ParamBlueprints, SearchParamValues } from 'components/core/SearchParams2/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams2/lib/search_params.snapshot';
import { shallowEqual } from 'components/visual/Inputs/lib/inputs.utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { Location, NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

export const createSearchParams = <Blueprints extends Record<string, ParamBlueprints>>(
  blueprints: (p: typeof PARAM_BLUEPRINTS) => Blueprints
) => {
  const createStore = (engine: SearchParamEngine<Blueprints>) => {
    const snapshotRef = { current: null as SearchParamSnapshot<Blueprints> | null };

    const refresh = (location: Location) => {
      const next = engine.fromLocation(location, snapshotRef.current);
      if (!shallowEqual(snapshotRef.current?.values ?? {}, next?.values ?? {})) {
        snapshotRef.current = next;
      }
    };

    const from = (value: URLSearchParams | SearchParamValues<Blueprints>): SearchParamSnapshot<Blueprints> => {
      snapshotRef.current = engine.full(value);
      return snapshotRef.current;
    };

    return {
      get snapshot(): SearchParamSnapshot<Blueprints> {
        if (!snapshotRef.current) {
          throw new Error('Snapshot has not been initialized');
        }
        return snapshotRef.current;
      },
      refresh,
      from
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine.fromLocation(location).omit(engine.getIgnoredKeys()).toString()]);

    return <SearchParamsContext.Provider value={storeRef.current}>{children}</SearchParamsContext.Provider>;
  });

  const useSearchParams = () => {
    const navigate = useNavigate();
    const store = useContext(SearchParamsContext);

    if (!store) {
      throw new Error('SearchParamsContext not found');
    }

    const setSearchParams = useCallback(
      (
        input: URLSearchParams | ((params: URLSearchParams) => URLSearchParams),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(store.snapshot.toParams()) : input;
        const snapshot = store.from(values);
        navigate({ search: snapshot.toLocationSearch() }, { replace, state: snapshot.toLocationState() });
      },
      [navigate, store]
    );

    const setSearchObject = useCallback(
      (
        input:
          | SearchParamValues<Blueprints>
          | ((params: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(store.snapshot.toObject()) : input;
        const snapshot = store.from(values);
        navigate({ search: snapshot.toLocationSearch() }, { replace, state: snapshot.toLocationState() });
      },
      [navigate, store]
    );

    return { search: store.snapshot, setSearchParams, setSearchObject };
  };

  return { SearchParamsProvider, useSearchParams };
};
