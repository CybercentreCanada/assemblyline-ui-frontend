import { PARAM_BLUEPRINTS } from 'components/core/SearchParams/lib/search_params.blueprint';
import { SearchParamEngine } from 'components/core/SearchParams/lib/search_params.engine';
import type { ParamBlueprints, SearchParamValues } from 'components/core/SearchParams/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams/lib/search_params.snapshot';
import { shallowEqual } from 'components/visual/Inputs/lib/inputs.utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
        return snapshotRef.current;
      },

      refresh,
      from
    };
  };

  type SearchParamsContextProps = {
    search: SearchParamSnapshot<Blueprints>;
    setSearchParams: (
      input: URLSearchParams | ((params: URLSearchParams) => URLSearchParams),
      replace?: NavigateOptions['replace']
    ) => void;
    setSearchObject: (
      input: SearchParamValues<Blueprints> | ((params: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>),
      replace?: NavigateOptions['replace']
    ) => void;
    changeDefaults: (value: URLSearchParams) => void;
    clearDefaults: () => void;
  };

  type SearchParamsProviderProps = {
    children: React.ReactNode;
    storageKey?: string;
  };

  const SearchParamsContext = createContext<SearchParamsContextProps>(null);

  const SearchParamsProvider = React.memo(({ children, storageKey = null }: SearchParamsProviderProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [defaultParams, setDefaultParams] = useState<URLSearchParams>(
      !storageKey ? null : new URLSearchParams(localStorage.getItem(storageKey) || '')
    );

    const storeRef = useRef<ReturnType<typeof createStore> | null>(null);

    const engine = useMemo(
      () => new SearchParamEngine(blueprints(PARAM_BLUEPRINTS)).setDefaultValues(!storageKey ? null : defaultParams),
      [defaultParams, storageKey]
    );

    if (!storeRef.current) {
      storeRef.current = createStore(engine);
      storeRef.current.refresh(location);
    }

    const setSearchParams = useCallback<SearchParamsContextProps['setSearchParams']>(
      (input, replace = false) => {
        const values = typeof input === 'function' ? input(storeRef.current.snapshot.toParams()) : input;
        const snapshot = storeRef.current.from(values);
        navigate({ search: snapshot.toLocationSearch() }, { replace, state: snapshot.toLocationState() });
      },
      [navigate]
    );

    const setSearchObject = useCallback<SearchParamsContextProps['setSearchObject']>(
      (input, replace = false) => {
        const values = typeof input === 'function' ? input(storeRef.current.snapshot.toObject()) : input;
        const snapshot = storeRef.current.from(values);
        navigate({ search: snapshot.toLocationSearch() }, { replace, state: snapshot.toLocationState() });
      },
      [navigate]
    );

    const changeDefaults = useCallback<SearchParamsContextProps['changeDefaults']>(
      value => {
        const search = engine.delta(value).omit(engine.getIgnoredKeys()).toParams();
        localStorage.setItem(storageKey, search.toString());
        setDefaultParams(search);
      },
      [engine, storageKey]
    );

    const clearDefaults = useCallback<SearchParamsContextProps['clearDefaults']>(() => {
      localStorage.removeItem(storageKey);
      setDefaultParams(new URLSearchParams());
    }, [storageKey]);

    useEffect(() => {
      storeRef.current.refresh(location);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine.fromLocation(location).omit(engine.getIgnoredKeys()).toString()]);

    useEffect(() => {
      setDefaultParams(new URLSearchParams(localStorage.getItem(storageKey) || ''));
    }, [storageKey]);

    return (
      <SearchParamsContext.Provider
        value={{ search: storeRef.current.snapshot, setSearchParams, setSearchObject, changeDefaults, clearDefaults }}
      >
        {children}
      </SearchParamsContext.Provider>
    );
  });

  const useSearchParams = (): SearchParamsContextProps => {
    const store = useContext(SearchParamsContext);

    if (!store)
      return {
        search: null,
        setSearchParams: () => null,
        setSearchObject: () => null,
        changeDefaults: () => null,
        clearDefaults: () => null
      };
    else return store;
  };

  return { SearchParamsProvider, useSearchParams };
};
