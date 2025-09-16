import { SearchParamEngine } from 'components/core/SearchParams/lib/search_params.engine';
import type { SearchParamBlueprints, SearchParamValues } from 'components/core/SearchParams/lib/search_params.model';
import { SearchParamSnapshot } from 'components/core/SearchParams/lib/search_params.snapshot';
import { shallowEqual } from 'components/visual/Inputs/lib/inputs.utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import type { NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

export const createSearchParamsStore = () => {
  // -------------------------
  // Store
  // -------------------------
  const useSearchParamsStore = <Blueprints extends SearchParamBlueprints>(
    params: Blueprints,
    storageKey: string = null
  ) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [defaults, setDefaults] = useState<URLSearchParams | null>(() =>
      !storageKey ? null : new URLSearchParams(localStorage.getItem(storageKey) || '')
    );

    const engine = useMemo(() => new SearchParamEngine(params).setDefaultValues(defaults ?? null), [params, defaults]);

    const locationKey = useMemo<string>(
      () => engine.fromLocation(location).omit(engine.getIgnoredKeys()).toString(),
      [engine, location]
    );

    const snapshotRef = useRef<SearchParamSnapshot<Blueprints>>(engine.fromLocation(location));
    const subscribers = useRef<Set<() => void>>(new Set());
    const notify = useRef<boolean>(false);

    const get = useMemo(() => () => snapshotRef.current, []);

    const set = useCallback((next: SearchParamSnapshot<Blueprints>) => {
      if (!shallowEqual(snapshotRef.current.values, next.values)) {
        snapshotRef.current = next;

        if (!notify.current) {
          notify.current = true;
          queueMicrotask(() => {
            notify.current = false;
            subscribers.current.forEach(cb => cb());
          });
        }
      }
    }, []);

    const subscribe = useMemo(
      () => (callback: () => void) => {
        subscribers.current.add(callback);
        return () => subscribers.current.delete(callback);
      },
      []
    );

    const setSearchParams = useCallback(
      (
        input: URLSearchParams | ((params: URLSearchParams) => URLSearchParams),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(snapshotRef.current.toParams()) : input;
        set(engine.full(values));
        navigate(
          {
            pathname: window.location.pathname,
            search: snapshotRef.current.toLocationSearch(),
            hash: window.location.hash
          },
          { replace, state: snapshotRef.current.toLocationState() }
        );
      },
      [engine, navigate, set]
    );

    const setSearchObject = useCallback(
      (
        input:
          | SearchParamValues<Blueprints>
          | ((params: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>),
        replace: NavigateOptions['replace'] = false
      ) => {
        const values = typeof input === 'function' ? input(snapshotRef.current.toObject()) : input;
        set(engine.full(values));
        navigate(
          {
            pathname: window.location.pathname,
            search: snapshotRef.current.toLocationSearch(),
            hash: window.location.hash
          },
          { replace, state: snapshotRef.current.toLocationState() }
        );
      },
      [engine, navigate, set]
    );

    const setDefaultParams = useCallback(
      (value: SearchParamValues<Blueprints>) => {
        if (!storageKey) return;
        const search = engine.delta(value).omit(engine.getEphemeralKeys()).toParams();
        localStorage.setItem(storageKey, search.toString());
        setDefaults(prev => {
          if (prev?.toString() === search.toString()) return prev;
          return search;
        });
      },
      [engine, storageKey]
    );

    const clearDefaultParams = useCallback(() => {
      if (!storageKey) return;
      localStorage.removeItem(storageKey);
      setDefaults(prev => (prev?.toString() === '' ? prev : new URLSearchParams()));
    }, [storageKey]);

    useEffect(() => {
      const next = engine.fromLocation(location, snapshotRef.current);
      set(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationKey]);

    useEffect(() => {
      setDefaults(!storageKey ? null : new URLSearchParams(localStorage.getItem(storageKey) || ''));
    }, [storageKey]);

    return {
      get,
      set,
      subscribe,
      setSearchParams,
      setSearchObject,
      setDefaultParams,
      clearDefaultParams
    };
  };

  // -------------------------
  // Context
  // -------------------------
  type SearchParamsContextProps<Blueprints extends SearchParamBlueprints = SearchParamBlueprints> = ReturnType<
    typeof useSearchParamsStore<Blueprints>
  > | null;

  const SearchParamsContext = createContext<SearchParamsContextProps>(null);

  // -------------------------
  // Provider
  // -------------------------
  type SearchParamsProviderProps<Blueprints extends SearchParamBlueprints> = {
    children: React.ReactNode;
    params: Blueprints;
    storageKey?: string;
  };

  const SearchParamsProvider = React.memo(
    <Blueprints extends SearchParamBlueprints>({
      children,
      params,
      storageKey
    }: SearchParamsProviderProps<Blueprints>) => (
      <SearchParamsContext.Provider value={useSearchParamsStore(params, storageKey)}>
        {children}
      </SearchParamsContext.Provider>
    )
  );

  // -------------------------
  // Hook
  // -------------------------
  type UseSearchParams<Blueprints extends SearchParamBlueprints> = {
    search: SearchParamSnapshot<Blueprints>;
    setSearchParams: ReturnType<typeof useSearchParamsStore<Blueprints>>['setSearchParams'];
    setSearchObject: ReturnType<typeof useSearchParamsStore<Blueprints>>['setSearchObject'];
    setDefaultParams: ReturnType<typeof useSearchParamsStore<Blueprints>>['setDefaultParams'];
    clearDefaultParams: ReturnType<typeof useSearchParamsStore<Blueprints>>['clearDefaultParams'];
  };

  const useSearchParams = <Blueprints extends SearchParamBlueprints>() => {
    const ctx = useContext(SearchParamsContext);

    const store = useMemo(
      () =>
        ctx ?? {
          get: () => new SearchParamSnapshot<Blueprints>(),
          subscribe: () => () => null,
          setSearchParams: () => null,
          setSearchObject: () => null,
          setDefaultParams: () => null,
          clearDefaultParams: () => null
        },
      [ctx]
    );

    const search = useSyncExternalStore(store.subscribe, store.get, store.get);

    return {
      search,
      setSearchParams: store.setSearchParams,
      setSearchObject: store.setSearchObject,
      setDefaultParams: store.setDefaultParams,
      clearDefaultParams: store.clearDefaultParams
    } as UseSearchParams<Blueprints>;
  };

  return { SearchParamsProvider, useSearchParams };
};
