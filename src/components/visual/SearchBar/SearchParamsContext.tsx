import { once } from 'lodash';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDefaultParams } from './DefaultParamsContext';
import type { Params } from './SearchParams';
import type { GetParams, SearchParamsResult } from './SearchParser';
import { SearchParser } from './SearchParser';

type ContextProps<P extends Params> = {
  search: SearchParamsResult<P>;
  setSearchParams: (value: URLSearchParams | ((params: URLSearchParams) => URLSearchParams)) => void;
  setSearchObject: (value: P | ((params: P) => P)) => void;
};

type Props<P extends Params> = {
  children: React.ReactNode;

  params: GetParams<P>;

  usingDefaultContext?: boolean;
};

const createSearchParamsContext = once(<P extends Params>() => createContext<ContextProps<P>>(null));
export const useSearchParams = <P extends Params>(): ContextProps<P> => useContext(createSearchParamsContext<P>());

export const SearchParamsProvider = <P extends Params>({
  children,
  params = null,
  usingDefaultContext = false
}: Props<P>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { defaults = null } = useDefaultParams<P>() || {};
  const SearchParamsContext = createSearchParamsContext<P>();

  const [hiddenParams, setHiddenParams] = useState<URLSearchParams>(new URLSearchParams());

  const locationParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const parser = useMemo<SearchParser<P>>(
    () => new SearchParser<P>(params).setDefaults(usingDefaultContext ? defaults?.toObject() : null),
    [defaults, params, usingDefaultContext]
  );

  const hiddenKeys = useMemo<Array<keyof P>>(() => parser.getHiddenKeys(), [parser]);

  const search = useMemo<ContextProps<P>['search']>(
    () => parser.mergeParams(locationParams, hiddenParams, hiddenKeys),
    [hiddenKeys, hiddenParams, locationParams, parser]
  );

  const prevSearch = useRef<string>(null);
  const prevHidden = useRef<string>(null);
  const searchParamsRef = useRef<URLSearchParams>(search.toParams());
  const searchObjectRef = useRef<P>(search.toObject());

  const handleUpdateRef = useCallback((value: SearchParamsResult<P>) => {
    searchParamsRef.current = value.toParams();
    searchObjectRef.current = value.toObject();
  }, []);

  const handleNavigate = useCallback(
    (value: SearchParamsResult<P>) => {
      const nextSearch = value.omit(hiddenKeys).toParams();
      const nextHidden = value.pick(hiddenKeys).toParams();

      if (prevHidden.current !== nextHidden.toString()) {
        setHiddenParams(nextHidden);
      }

      if (prevSearch.current !== nextSearch.toString() && window.location.search.slice(1) !== nextSearch.toString()) {
        navigate(`${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
      }
    },
    [hiddenKeys, navigate]
  );

  const setSearchParams = useCallback<ContextProps<P>['setSearchParams']>(
    input => {
      const values = typeof input === 'function' ? input(searchParamsRef.current) : input;
      handleUpdateRef(parser.fromParams(values));
      handleNavigate(parser.deltaParams(values));
    },
    [handleNavigate, handleUpdateRef, parser]
  );

  const setSearchObject = useCallback<ContextProps<P>['setSearchObject']>(
    input => {
      const values = typeof input === 'function' ? input(searchObjectRef.current) : input;
      handleUpdateRef(parser.fromObject(values));
      handleNavigate(parser.deltaObject(values));
    },
    [handleNavigate, handleUpdateRef, parser]
  );

  useEffect(() => {
    handleUpdateRef(search);
  }, [handleUpdateRef, search]);

  useEffect(() => {
    prevSearch.current = search.toString();
  }, [search]);

  useEffect(() => {
    prevHidden.current = hiddenParams.toString();
  }, [hiddenParams]);

  return (
    <SearchParamsContext.Provider value={{ search, setSearchParams, setSearchObject }}>
      {!search ? null : children}
    </SearchParamsContext.Provider>
  );
};
