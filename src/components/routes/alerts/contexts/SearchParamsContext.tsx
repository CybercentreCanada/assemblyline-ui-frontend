import type { SearchParams } from 'components/routes/alerts/utils/SearchParser2';
import { SearchParser } from 'components/routes/alerts/utils/SearchParser2';
import type { Params } from 'components/routes/alerts/utils/SearchSchema';
import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDefaultParams } from './DefaultParamsContext';

type ContextProps<T extends Params> = {
  search: SearchParams<T>;
  setSearchParams: (value: URLSearchParams | ((params: URLSearchParams) => URLSearchParams)) => void;
  setSearchObj: (value: T | ((params: T) => T)) => void;
};

type Props<T extends Params> = {
  children: React.ReactNode;

  /**
   * Default search parameters including null values.
   */
  defaultValue?: T;

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

  /**
   * Using the DefaultSearchParamsProvider
   */
  usingDefaultContext?: boolean;
};

const createSearchParamsContext = once(<T extends Params>() => createContext<ContextProps<T>>(null));
export const useSearchParams = <T extends Params>(): ContextProps<T> => useContext(createSearchParamsContext<T>());

export const SearchParamsProvider = <T extends Params>({
  children,
  defaultValue = null,
  hidden = [],
  enforced = [],
  usingDefaultContext = false,
  prefixes = {
    not: 'NOT',
    ignore: '!'
  }
}: Props<T>) => {
  const SearchParamsContext = createSearchParamsContext<T>();
  const navigate = useNavigate();
  const location = useLocation();
  const { defaults = null } = useDefaultParams<T>() || {};

  const [hiddenParams, setHiddenParams] = useState<URLSearchParams>(new URLSearchParams());

  const searchRef = useRef<URLSearchParams>();
  const prevSearch = useRef<string>(null);
  const prevHidden = useRef<string>(null);

  const locationParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const parser = useMemo<SearchParser<T>>(
    () =>
      new SearchParser<T>(usingDefaultContext && defaults ? defaults.toObject() : defaultValue, { enforced, prefixes }),
    [defaultValue, defaults, enforced, prefixes, usingDefaultContext]
  );

  const search = useMemo<ContextProps<T>['search']>(
    () => parser.fromMergeParams(locationParams, hiddenParams, key => !hidden.includes(key)),
    [hidden, hiddenParams, locationParams, parser]
  );

  const setSearchParams = useCallback<ContextProps<T>['setSearchParams']>(
    input => {
      const values = typeof input === 'function' ? input(searchRef.current) : input;

      const [nextSearch, nextHidden] = parser
        .fromDeltaParams(values)
        .toFiltered(key => !enforced.includes(key))
        .toSplitParams(key => !hidden.includes(key));

      if (prevHidden.current === nextHidden.toString() && prevSearch.current === nextSearch.toString()) return;
      prevHidden.current = nextHidden.toString();
      prevSearch.current = nextSearch.toString();

      setHiddenParams(nextHidden);
      navigate(`${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
    },
    [enforced, hidden, navigate, parser]
  );

  const setSearchObj = useCallback<ContextProps<T>['setSearchObj']>(
    input => {
      const searchObj = parser.fromParams(searchRef.current).toObject();
      const result = typeof input === 'function' ? input(searchObj) : input;
      setSearchParams(parser.fromObject(result).toParams());
    },
    [parser, setSearchParams]
  );

  useEffect(() => {
    searchRef.current = search.toParams();
  }, [search]);

  return (
    <SearchParamsContext.Provider value={{ search, setSearchParams, setSearchObj }}>
      {!search ? null : children}
    </SearchParamsContext.Provider>
  );
};
