import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { Params, SearchFormat } from './DefaultParamsContext';
import { useDefaultParams } from './DefaultParamsContext';

type ContextProps<T extends Params> = {
  searchParams: URLSearchParams;
  searchObj: T;
  setSearchParams: (value: URLSearchParams | ((params: URLSearchParams) => URLSearchParams)) => void;
  setSearchObj: (value: T | ((params: T) => T)) => void;
  getSearchParams: (props?: {
    keys?: (keyof T)[];
    strip?: [keyof T, string?][];
    transforms?: ((value: URLSearchParams) => URLSearchParams)[];
  }) => URLSearchParams;
  getSearchObj: (props?: {
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
  defaultValue?: string | URLSearchParams | string[][] | Record<string, string>;

  /**
   *
   */
  format: SearchFormat<T>;

  /**
   * Hidden search parameters will not be shown in the URL
   */
  hidden?: (keyof T)[];

  /**
   * Enforced search parameters will always be its default value
   */
  enforced?: (keyof T)[];

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

  /**
   * Using the DefaultSearchParamsProvider
   */
  usingDefaultSearchParams?: boolean;
};

const createSearchParamsContext = once(<T extends Params>() => createContext<ContextProps<T>>(null));
export const useSearchParams = <T extends Params>(): ContextProps<T> => useContext(createSearchParamsContext<T>());

export const SearchParamsProvider = <T extends Params>({
  children,
  defaultValue = null,
  format = null,
  hidden = [],
  enforced = [],
  usingDefaultSearchParams = false,
  selectors = {
    not: 'NOT',
    ignore: '!'
  }
}: Props<T>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultContext = useDefaultParams();
  const SearchParamsContext = createSearchParamsContext<T>();

  const [hiddenParams, setHiddenParams] = useState<URLSearchParams>(new URLSearchParams());

  const searchParamsRef = useRef<URLSearchParams>();
  const searchObjRef = useRef<T>();
  const prevHidden = useRef<string>(null);
  const prevSearch = useRef<string>(null);

  const locationParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const defaultParams = useMemo<URLSearchParams>(
    () =>
      new URLSearchParams(
        !usingDefaultSearchParams
          ? defaultValue
          : 'defaultParams' in defaultContext
          ? defaultContext?.defaultParams
          : ''
      ),
    [defaultContext, defaultValue, usingDefaultSearchParams]
  );

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

  const searchParams = useMemo<ContextProps<T>['searchParams']>(
    () =>
      new URLSearchParams(
        Object.entries(format).reduce((current: string[][], [k, t]) => {
          if (t === 'string[]') {
            let next = hidden.includes(k)
              ? parseMultipleParams(hiddenParams, k, [])
              : parseMultipleParams(locationParams, k, []);
            next = parseMultipleParams(defaultParams, k, next);
            return [...current, ...next];
          } else {
            if (hidden.includes(k)) {
              if (!enforced.includes(k) && hiddenParams.has(k)) return [...current, [k, hiddenParams.get(k)]];
              else if (defaultParams.has(k)) return [...current, [k, defaultParams.get(k)]];
            } else {
              if (!enforced.includes(k) && locationParams.has(k)) return [...current, [k, locationParams.get(k)]];
              else if (defaultParams.has(k)) return [...current, [k, defaultParams.get(k)]];
            }
            return current;
          }
        }, [])
      ),
    [defaultParams, enforced, format, hidden, hiddenParams, locationParams, parseMultipleParams]
  );

  const searchObj = useMemo<ContextProps<T>['searchObj']>(
    () =>
      Object.entries(format).reduce((current, [k, t]) => {
        const value = searchParams.has(k) && searchParams.get(k);
        if ([undefined, null].includes(value)) return current;
        else if (t === 'string[]') return { ...current, [k]: Array.from(searchParams.getAll(k)) };
        else if (t === 'boolean') return { ...current, [k]: Boolean(value) };
        else if (t === 'number') return { ...current, [k]: Number(value) };
        else if (t === 'string') return { ...current, [k]: String(value) };
        else return current;
      }, {}) as T,
    [format, searchParams]
  );

  const getSearchParams = useCallback<ContextProps<T>['getSearchParams']>(
    (props = { keys: [], strip: [], transforms: [] }) => {
      const { keys = [], strip = [], transforms = [] } = props;
      let q = new URLSearchParams(searchParams);

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
    [searchParams]
  );

  const getSearchObj = useCallback<ContextProps<T>['getSearchObj']>(
    (props = { keys: [], strip: [], transforms: [] }) => {
      const { keys = [], strip = [], transforms = [] } = props;
      let q = Object.assign({}, searchObj) as Partial<T>;

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
    [searchObj]
  );

  const setSearchParams = useCallback<ContextProps<T>['setSearchParams']>(
    input => {
      const values = typeof input === 'function' ? input(searchParamsRef.current) : input;
      const nextHidden = new URLSearchParams();
      const nextSearch = new URLSearchParams();

      Object.entries(format).forEach(([k, t]) => {
        if (t === 'string[]') {
          if (hidden.includes(k)) {
            values.getAll(k).forEach(v => !defaultParams.getAll(k).includes(v) && nextHidden.append(k, v));
          } else {
            values.getAll(k).forEach(v => !defaultParams.getAll(k).includes(v) && nextSearch.append(k, v));
          }
        } else {
          if (!enforced.includes(k) && hidden.includes(k)) {
            if (values.has(k) && values.get(k) !== defaultParams.get(k)) {
              nextHidden.append(k, values.get(k));
            }
          } else if (!enforced.includes(k)) {
            if (values.has(k) && values.get(k) !== defaultParams.get(k)) {
              nextSearch.append(k, values.get(k));
            }
          }
        }
      });

      if (prevHidden.current === nextHidden.toString() && prevSearch.current === nextSearch.toString()) return;
      prevHidden.current = nextHidden.toString();
      prevSearch.current = nextSearch.toString();

      setHiddenParams(nextHidden);
      navigate(`${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
    },
    [defaultParams, enforced, format, hidden, navigate]
  );

  const setSearchObj = useCallback<ContextProps<T>['setSearchObj']>(
    input => {
      const values = typeof input === 'function' ? input(searchObjRef.current) : input;
      const nextHidden = new URLSearchParams();
      const nextSearch = new URLSearchParams();

      Object.entries(format).forEach(([k, t]) => {
        if (t === 'string[]' && k in values && ![undefined, null].includes(values[k])) {
          if (hidden.includes(k)) {
            (values[k] as string[]).forEach(v => !defaultParams.getAll(k).includes(v) && nextHidden.append(k, v));
          } else {
            (values[k] as string[]).forEach(v => !defaultParams.getAll(k).includes(v) && nextSearch.append(k, v));
          }
        } else if (
          k in values &&
          ![undefined, null].includes(values[k]) &&
          values[k].toString() !== defaultParams.get(k)
        ) {
          if (!enforced.includes(k) && hidden.includes(k)) {
            nextHidden.append(k, values[k].toString());
          } else if (!enforced.includes(k)) {
            nextSearch.append(k, values[k].toString());
          }
        }
      });

      if (prevHidden.current === nextHidden.toString() && prevSearch.current === nextSearch.toString()) return;
      prevHidden.current = nextHidden.toString();
      prevSearch.current = nextSearch.toString();

      setHiddenParams(nextHidden);
      navigate(`${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
    },
    [defaultParams, enforced, format, hidden, navigate]
  );

  useEffect(() => {
    searchParamsRef.current = new URLSearchParams(searchParams);
  }, [searchParams]);

  useEffect(() => {
    searchObjRef.current = Object.assign({}, searchObj);
  }, [searchObj]);

  // useEffect(() => {
  //   setSearchParams(searchParams);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [defaultParams, format, hidden, enforced]);

  return (
    <SearchParamsContext.Provider
      value={{ searchParams, searchObj, getSearchParams, getSearchObj, setSearchParams, setSearchObj }}
    >
      {!searchParams ? null : children}
    </SearchParamsContext.Provider>
  );
};
