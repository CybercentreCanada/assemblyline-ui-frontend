import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Params } from './SearchParams';
import type { GetParams, SearchResult } from './SearchParser';
import { SearchParser } from './SearchParser';

type ContextProps<P extends Params> = {
  /**
   * Default search params as a formatted URLSearchParams
   */
  defaults: SearchResult<P>;

  /**
   * Is there a search params stored in the local storage
   */
  fromStorage: boolean;

  /**
   * Change the default search params in the local storage
   */
  onDefaultChange: (value: string | URLSearchParams | string[][] | Record<string, string>) => void;

  /**
   * Clear the default search params from the local storage
   */
  onDefaultClear: () => void;
};

type Props<P extends Params> = {
  children: React.ReactNode;

  /**
   * Default search parameters including null values.
   */
  params: GetParams<P>;

  /**
   * key of where the search parameters will be stored in the Local Storage
   */
  storageKey: string;
};

const createCurrentContext = once(<P extends Params>() => createContext<ContextProps<P>>(null));
export const useDefaultParams = <P extends Params>(): ContextProps<P> => useContext(createCurrentContext<P>());

export const DefaultParamsProvider = <P extends Params>({ children, params = null, storageKey = null }: Props<P>) => {
  const DefaultParamsContext = createCurrentContext<P>();

  const [storageParams, setStorageParams] = useState<URLSearchParams>(
    () => new URLSearchParams(localStorage.getItem(storageKey) || '')
  );
  const [fromStorage, seFromStorage] = useState<boolean>(() => !!localStorage.getItem(storageKey));

  const parser = useMemo<SearchParser<P>>(() => new SearchParser<P>(params), [params]);

  const ignoredKeys = useMemo<Array<keyof P>>(() => parser.getIgnoredKeys(), [parser]);

  const defaults = useMemo<ContextProps<P>['defaults']>(
    () => parser.fullParams(storageParams),
    [parser, storageParams]
  );

  const onDefaultChange = useCallback<ContextProps<P>['onDefaultChange']>(
    value => {
      const search = parser.deltaParams(value).omit(ignoredKeys).toParams();
      localStorage.setItem(storageKey, search.toString());
      setStorageParams(search);
      seFromStorage(true);
    },
    [ignoredKeys, parser, storageKey]
  );

  const onDefaultClear = useCallback<ContextProps<P>['onDefaultClear']>(() => {
    localStorage.removeItem(storageKey);
    setStorageParams(new URLSearchParams());
    seFromStorage(false);
  }, [storageKey]);

  useEffect(() => {
    setStorageParams(new URLSearchParams(localStorage.getItem(storageKey) || ''));
    seFromStorage(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  return (
    <DefaultParamsContext.Provider value={{ defaults, fromStorage, onDefaultChange, onDefaultClear }}>
      {!defaults ? null : children}
    </DefaultParamsContext.Provider>
  );
};
