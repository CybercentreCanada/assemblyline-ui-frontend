import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

type GetQueryProps = {
  search?: string;
  keys?: string[];
  strip?: string[];
  groupByAsFilter?: boolean;
};

type ContextProps = {
  defaultQuery: string;
  fromStorage: boolean;
  getQuery: (props: GetQueryProps) => string;
  onDefaultQueryChange: (value: string) => void;
  onDefaultQueryClear: () => void;
};

type Props<T extends object> = {
  children: React.ReactNode;
  params: T;
  storageKey: string;
  enforceParams?: (keyof T | string)[];
  ignoreParams?: (keyof T | string)[];
};

const DefaultSearchParamsContext = createContext<ContextProps>(null);

export const useDefaultSearchParams = (): ContextProps => useContext(DefaultSearchParamsContext);

export const DefaultSearchParamsProvider = <T extends object>({
  children,
  params = null,
  storageKey = null,
  enforceParams = [],
  ignoreParams = []
}: Props<T>) => {
  const navigate = useNavigate();

  const [defaults, setDefaults] = useState<string>(null);
  const [fromStorage, setFromStorage] = useState<boolean>(false);

  const baseQuery = useMemo<string>(
    () =>
      !params
        ? ''
        : new URLSearchParams(
            Object.entries(params)
              .filter(([key, value]) => ![null, undefined].includes(value))
              .flatMap(([key, value]) => (Array.isArray(value) ? value.map(v => [key, `${v}`]) : [[key, `${value}`]]))
          ).toString(),
    [params]
  );

  const defaultQuery = useMemo<string>(() => {
    if ([null, undefined].includes(defaults)) return null;

    let entries = [];

    new URLSearchParams(defaults).forEach((v, k) => {
      if (ignoreParams.includes(k) || enforceParams.includes(k) || !(k in params)) return;
      else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
      else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
    });

    new URLSearchParams(baseQuery).forEach((v, k) => {
      if (ignoreParams.includes(k) || !(k in params)) return;
      else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
      else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
    });

    entries.sort();
    return new URLSearchParams(entries).toString();
  }, [baseQuery, defaults, enforceParams, ignoreParams, params]);

  const getQuery = useCallback(
    ({ search = null, keys = [], strip = [], groupByAsFilter = false }: GetQueryProps): string => {
      if ([null, undefined].includes(defaults)) return null;

      let entries = [];

      new URLSearchParams(search).forEach((v, k) => {
        if (enforceParams.includes(k) || !(k in params)) return;
        else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
        else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
      });

      new URLSearchParams(defaults).forEach((v, k) => {
        if (ignoreParams.includes(k) || !(k in params)) return;
        else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
        else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
      });

      entries.sort();
      return new URLSearchParams(entries).toString();
    },
    [defaults, enforceParams, ignoreParams, params]
  );

  const onDefaultQueryChange = useCallback(
    (search: string) => {
      setDefaults(d => {
        let entries = [];

        new URLSearchParams(search).forEach((v, k) => {
          if (ignoreParams.includes(k) || enforceParams.includes(k) || !(k in params)) return;
          else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
          else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
        });

        new URLSearchParams(d).forEach((v, k) => {
          if (ignoreParams.includes(k) || enforceParams.includes(k) || !(k in params)) return;
          else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
          else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
        });

        search = new URLSearchParams(entries).toString();
        localStorage.setItem(storageKey, search);
        return search;
      });
    },
    [enforceParams, ignoreParams, params, storageKey]
  );

  const onDefaultQueryClear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDefaults('');
    setFromStorage(false);
  }, [storageKey]);

  useEffect(() => {
    setFromStorage(!!storageKey && !!localStorage.getItem(storageKey));
    const storageData = !storageKey ? '' : localStorage.getItem(storageKey);

    let entries = [];

    new URLSearchParams(storageData).forEach((v, k) => {
      if (enforceParams.includes(k) || !(k in params)) return;
      else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
      else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
    });

    setDefaults(new URLSearchParams(entries).toString());
  }, [enforceParams, params, storageKey]);

  useEffect(() => {
    let entries = [];

    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (!enforceParams.includes(k) && k in params) entries.push([k, v]);
    });

    new URLSearchParams(defaults).forEach((v, k) => {
      if (ignoreParams.includes(k) || enforceParams.includes(k) || !(k in params)) return;
      else if (Array.isArray(params[k]) && !entries.some(([k2, v2]) => k === k2 && v === v2)) entries.push([k, v]);
      else if (!entries.some(([k2, v2]) => k === k2)) entries.push([k, v]);
    });

    navigate(`${window.location.pathname}?${new URLSearchParams(entries).toString()}${window.location.hash}`);
  }, [defaults, enforceParams, ignoreParams, navigate, params]);

  return (
    <DefaultSearchParamsContext.Provider
      value={{ defaultQuery, fromStorage, getQuery, onDefaultQueryChange, onDefaultQueryClear }}
    >
      {!defaultQuery ? null : children}
    </DefaultSearchParamsContext.Provider>
  );
};
