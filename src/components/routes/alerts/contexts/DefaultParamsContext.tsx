import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Format = Record<string, 'boolean' | 'number' | 'string' | 'string[]'>;

type SearchObj<T extends Format> = {
  [P in keyof T]: T[P] extends 'string[]'
    ? string[]
    : T[P] extends 'number'
    ? number
    : T[P] extends 'boolean'
    ? boolean
    : string;
};

type ContextProps<T extends Format> = {
  /**
   * Default search params as a formatted URLSearchParams
   */
  defaultParams: URLSearchParams;

  /**
   * Default search params as a formatted object
   */
  defaultObj: SearchObj<T>;

  /**
   * Change the default search params in the local storage
   */
  onDefaultChange: (value: string | URLSearchParams | string[][] | Record<string, string>) => void;

  /**
   * Clear the default search params from the local storage
   */
  onDefaultClear: () => void;
};

type Props<T extends Format> = {
  children: React.ReactNode;

  /**
   * Default search parameters including null values.
   */
  defaultValue: string | URLSearchParams | string[][] | Record<string, string>;

  /**
   * Format of the search parameters
   */
  format: T;

  /**
   * key of where the search parameters will be stored in the Local Storage
   */
  storageKey: string;

  /**
   * Enforced search parameters will always be its default value
   */
  enforced?: (keyof T | string)[];

  /**
   * Ignored search parameters will not be stored in the local storage
   */
  ignored?: (keyof T | string)[];

  /**
   * modifiers for the multiple search parameters
   */
  selectors?: {
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

const createCurrentContext = once(<T extends Format>() => createContext<ContextProps<T>>(null));
export const useDefaultParams = <T extends Format>(): ContextProps<T> => useContext(createCurrentContext<T>());

export const DefaultParamsProvider = <T extends Format>({
  children,
  defaultValue = null,
  format = null,
  storageKey = null,
  enforced = [],
  ignored = [],
  selectors = {
    not: 'NOT',
    ignore: '!'
  }
}: Props<T>) => {
  const DefaultParamsContext = createCurrentContext<T>();

  const [storageParams, setStorageParams] = useState<URLSearchParams>(new URLSearchParams());

  const searchParams = useMemo<URLSearchParams>(() => new URLSearchParams(defaultValue), [defaultValue]);

  /**
   * Parse a multiple search param by ensuring only one value is present regardless of the wrapped selector
   */
  const parseMultipleParams = useCallback(
    (params: URLSearchParams, key: string, initialValue: string[][]) =>
      params.getAll(key).reduceRight((p, v) => {
        if ([undefined, null, ''].includes(v) || (v.startsWith(`${selectors.ignore}(`) && v.endsWith(')'))) return p;
        let value = v;
        if (v.startsWith(`${selectors.not}(`) && v.endsWith(')'))
          value = v.substring(selectors.not.length + 1, v.length - 1);
        return p.some(([k2, v2]) => key === k2 && value === v2) ? p : [...p, [key, v]];
      }, initialValue),
    [selectors]
  );

  /**
   * Default search values as a formatted URLSearchParams
   */
  const defaultParams = useMemo<URLSearchParams>(
    () =>
      new URLSearchParams(
        Object.entries(format).reduce((current: string[][], [k, t]) => {
          if (t === 'string[]') {
            let next = enforced.includes(k) ? [] : parseMultipleParams(storageParams, k, []);
            next = parseMultipleParams(searchParams, k, next);
            return [...current, ...next];
          } else {
            if (!enforced.includes(k) && storageParams.has(k)) return [...current, [k, storageParams.get(k)]];
            else if (searchParams.has(k)) return [...current, [k, searchParams.get(k)]];
          }
          return current;
        }, [])
      ),
    [enforced, format, parseMultipleParams, searchParams, storageParams]
  );

  /**
   * Default search values as a formatted object
   */
  const defaultObj = useMemo<SearchObj<T>>(
    () =>
      Object.entries(format).reduce((current, [k, t]) => {
        const value = defaultParams.has(k) && defaultParams.get(k);
        if ([undefined, null].includes(value)) return current;
        else if (t === 'string[]') return { ...current, [k]: Array.from(defaultParams.getAll(k)) };
        else if (t === 'boolean') return { ...current, [k]: Boolean(value) };
        else if (t === 'number') return { ...current, [k]: Number(value) };
        else if (t === 'string') return { ...current, [k]: String(value) };
        else return current;
      }, {}) as SearchObj<T>,
    [defaultParams, format]
  );

  /**
   * Change the default search parameters and save them to the local storage
   */
  const onDefaultChange = useCallback(
    (value: string | URLSearchParams | string[][] | Record<string, string>) => {
      const input = new URLSearchParams(value);

      input.forEach((v, k) => {
        if (ignored.includes(k) || (defaultParams.has(k) && defaultParams.get(k) === v)) input.delete(k, v);
      });

      localStorage.setItem(storageKey, input.toString());
      setStorageParams(input);
    },
    [defaultParams, ignored, storageKey]
  );

  /**
   * Clear the default search parameters from the local storage
   */
  const onDefaultClear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setStorageParams(new URLSearchParams());
  }, [storageKey]);

  /**
   * Initialize the stored search parameters
   */
  useEffect(() => {
    setStorageParams(new URLSearchParams(!storageKey ? null : localStorage.getItem(storageKey)));
  }, [storageKey]);

  return (
    <DefaultParamsContext.Provider
      value={{
        defaultParams,
        defaultObj,
        onDefaultChange,
        onDefaultClear
      }}
    >
      {!defaultParams ? null : children}
    </DefaultParamsContext.Provider>
  );
};
