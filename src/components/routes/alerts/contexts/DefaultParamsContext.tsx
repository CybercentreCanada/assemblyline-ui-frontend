import type { Params, SearchFormat, SearchParams } from 'components/routes/alerts/utils/SearchParser';
import { SearchParser } from 'components/routes/alerts/utils/SearchParser';
import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ContextProps<T extends Params> = {
  /**
   * Default search params as a formatted URLSearchParams
   */
  defaults: SearchParams<T>;

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

type Props<T extends Params> = {
  children: React.ReactNode;

  /**
   * Default search parameters including null values.
   */
  defaultValue: T;

  /**
   * Format of the search parameters
   */
  format: SearchFormat<T>;

  /**
   * key of where the search parameters will be stored in the Local Storage
   */
  storageKey: string;

  /**
   * Enforced search parameters will always be its default value
   */
  enforced?: (keyof T)[];

  /**
   * Ignored search parameters will not be stored in the local storage
   */
  ignored?: (keyof T)[];

  /**
   * modifiers for the multiple search parameters
   */
  prefixes?: {
    /**
     * negated search parameters
     */
    not: string;

    /**
     * ignored search parameters
     */
    ignore: string;
  };
};

const createCurrentContext = once(<T extends Params>() => createContext<ContextProps<T>>(null));
export const useDefaultParams = <T extends Params>(): ContextProps<T> => useContext(createCurrentContext<T>());

export const DefaultParamsProvider = <T extends Params>({
  children,
  defaultValue = null,
  format = null,
  storageKey = null,
  enforced = [],
  ignored = [],
  prefixes = {
    not: 'NOT',
    ignore: '!'
  }
}: Props<T>) => {
  const DefaultParamsContext = createCurrentContext<T>();

  const [storageParams, setStorageParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(!storageKey ? null : localStorage.getItem(storageKey));
  });
  const [fromStorage, seFromStorage] = useState<boolean>(() => {
    return !!storageKey && !!localStorage.getItem(storageKey);
  });

  const parser = useMemo<SearchParser<T>>(
    () => new SearchParser<T>(format, { enforced, prefixes }).setDefaultObject(defaultValue),
    [defaultValue, enforced, format, prefixes]
  );

  const defaults = useMemo<ContextProps<T>['defaults']>(
    () => parser.fromParams(storageParams),
    [parser, storageParams]
  );

  const onDefaultChange = useCallback<ContextProps<T>['onDefaultChange']>(
    value => {
      const params = parser.fromDeltaParams(value).toFiltered(k => !ignored.includes(k));
      localStorage.setItem(storageKey, params.toString());
      setStorageParams(params.toParams());
      seFromStorage(true);
    },
    [ignored, parser, storageKey]
  );

  const onDefaultClear = useCallback<ContextProps<T>['onDefaultClear']>(() => {
    localStorage.removeItem(storageKey);
    setStorageParams(new URLSearchParams());
    seFromStorage(false);
  }, [storageKey]);

  useEffect(() => {
    setStorageParams(new URLSearchParams(!storageKey ? null : localStorage.getItem(storageKey)));
    seFromStorage(!!storageKey && !!localStorage.getItem(storageKey));
  }, [storageKey]);

  return (
    <DefaultParamsContext.Provider
      value={{
        defaults,
        fromStorage,
        onDefaultChange,
        onDefaultClear
      }}
    >
      {!defaults ? null : children}
    </DefaultParamsContext.Provider>
  );
};
