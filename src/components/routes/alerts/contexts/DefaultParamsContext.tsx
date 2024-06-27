import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Params = Record<string, boolean | number | string | string[]>;

export type SearchFormat<T extends Params> = {
  [P in keyof T]: T[P] extends Array<string>
    ? 'string[]'
    : T[P] extends number
    ? 'number'
    : T[P] extends boolean
    ? 'boolean'
    : 'string';
};

type ContextProps<T extends Params> = {
  /**
   * Default search params as a formatted URLSearchParams
   */
  defaultParams: URLSearchParams;

  /**
   * Default search params as a formatted object
   */
  defaultObj: T;

  /**
   * Is there a search params stored in the local storage
   */
  hasStorageParams: boolean;

  /**
   * Change the default search params in the local storage
   */
  onDefaultChange: (value: string | URLSearchParams | string[][] | Record<string, string>) => void;

  /**
   * Clear the default search params from the local storage
   */
  onDefaultClear: () => void;

  getDefaultParams: (props?: {
    keys?: (keyof T)[];
    strip?: [keyof T, string?][];
    transforms?: ((value: URLSearchParams) => URLSearchParams)[];
  }) => URLSearchParams;

  getDefaultObj: (props?: {
    keys?: (keyof T)[];
    strip?: [keyof T, string?][];
    transforms?: ((value: Partial<T>) => Partial<T>)[];
  }) => Partial<T>;
};

type Props<T extends Params> = {
  children: React.ReactNode;

  /**
   * Default search parameters including null values.
   */
  defaultValue: string | URLSearchParams | string[][] | Record<string, string>;

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

const createCurrentContext = once(<T extends Params>() => createContext<ContextProps<T>>(null));
export const useDefaultParams = <T extends Params>(): ContextProps<T> => useContext(createCurrentContext<T>());

export const DefaultParamsProvider = <T extends Params>({
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

  const [storageParams, setStorageParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(!storageKey ? null : localStorage.getItem(storageKey));
  });
  const [hasStorageParams, setHasStorageParams] = useState<boolean>(() => {
    return !!storageKey && !!localStorage.getItem(storageKey);
  });

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
  const defaultParams = useMemo<ContextProps<T>['defaultParams']>(
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
  const defaultObj = useMemo<ContextProps<T>['defaultObj']>(
    () =>
      Object.entries(format).reduce((current, [k, t]) => {
        const value = defaultParams.has(k) && defaultParams.get(k);
        if ([undefined, null].includes(value)) return current;
        else if (t === 'string[]') return { ...current, [k]: Array.from(defaultParams.getAll(k)) };
        else if (t === 'boolean') return { ...current, [k]: Boolean(value) };
        else if (t === 'number') return { ...current, [k]: Number(value) };
        else if (t === 'string') return { ...current, [k]: String(value) };
        else return current;
      }, {}) as T,
    [defaultParams, format]
  );

  const getDefaultParams = useCallback<ContextProps<T>['getDefaultParams']>(
    (props = { keys: [], strip: [], transforms: [] }) => {
      const { keys = [], strip = [], transforms = [] } = props;
      let q = new URLSearchParams(defaultParams);

      transforms.forEach(transform => {
        q = transform(q);
      });

      q.forEach(([v, k]) => {
        if (strip.some(([k2, v2 = null]) => (k === k2 && v2 ? `${v}`.startsWith(v2) : true))) q.delete(k, v);
        else if (!keys.includes(k)) q.delete(k, v);
      });

      q.sort();

      return q;
    },
    [defaultParams]
  );

  const getDefaultObj = useCallback<ContextProps<T>['getDefaultObj']>(
    (props = { keys: [], strip: [], transforms: [] }) => {
      const { keys = [], strip = [], transforms = [] } = props;
      let q = Object.assign({}, defaultObj) as Partial<T>;

      transforms.forEach(transform => {
        q = transform(q);
      });

      q = Object.entries(q).reduce((current, [k, v]) => {
        if (keys.includes(k)) {
          if (Array.isArray(v)) {
            return {
              ...current,
              [k]: v.filter(f => !strip.some(([k2, v2 = null]) => (k === k2 && v2 ? `${f}`.startsWith(v2) : true)))
            };
          } else if (!strip.some(([k2, v2 = null]) => (k === k2 && v2 ? `${v}`.startsWith(v2) : true))) {
            return { ...current, [k]: v as unknown };
          }
        }
      }, {});

      return q;
    },
    [defaultObj]
  );

  /**
   * Change the default search parameters and save them to the local storage
   */
  const onDefaultChange = useCallback<ContextProps<T>['onDefaultChange']>(
    value => {
      const input = new URLSearchParams(value);

      input.forEach((v, k) => {
        if (ignored.includes(k) || (defaultParams.has(k) && defaultParams.get(k) === v)) input.delete(k, v);
      });

      localStorage.setItem(storageKey, input.toString());
      setStorageParams(input);
      setHasStorageParams(true);
    },
    [defaultParams, ignored, storageKey]
  );

  /**
   * Clear the default search parameters from the local storage
   */
  const onDefaultClear = useCallback<ContextProps<T>['onDefaultClear']>(() => {
    localStorage.removeItem(storageKey);
    setStorageParams(new URLSearchParams());
    setHasStorageParams(false);
  }, [storageKey]);

  /**
   * Initialize the stored search parameters
   */
  useEffect(() => {
    setStorageParams(new URLSearchParams(!storageKey ? null : localStorage.getItem(storageKey)));
    setHasStorageParams(!!storageKey && !!localStorage.getItem(storageKey));
  }, [storageKey]);

  return (
    <DefaultParamsContext.Provider
      value={{
        defaultParams,
        defaultObj,
        hasStorageParams,
        getDefaultParams,
        getDefaultObj,
        onDefaultChange,
        onDefaultClear
      }}
    >
      {!defaultParams ? null : children}
    </DefaultParamsContext.Provider>
  );
};
