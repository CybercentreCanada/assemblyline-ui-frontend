import useClipboard from 'commons/components/hooks/useClipboard';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback } from 'react';
import {
  ActionProps,
  formatTextString,
  isAction,
  isBody,
  isHexString,
  isSearchType,
  parseHexToString,
  parseStringToHexString,
  ReducerProps,
  SearchType,
  Store
} from '..';

export type LocationState = {
  location: {
    loaded: boolean;
    scroll: number;
    cursor: number;
    selectStart: number;
    selectEnd: number;
    searchType: SearchType;
    searchValue: string;
    searchIndex: number;
  };
};

export type LocationRef = {};

export type LocationPayload = {};

export type LocationQuery = {
  scroll?: string;
  cursor?: string;
  selectStart?: string;
  selectEnd?: string;
  searchType?: SearchType;
  searchValue?: string;
  searchIndex?: string;
};

export const useLocationReducer = () => {
  const { copy } = useClipboard();

  const initialState = React.useMemo<LocationState>(
    () => ({
      location: {
        loaded: false,
        scroll: null,
        cursor: null,
        selectStart: null,
        selectEnd: null,
        searchType: null,
        searchValue: null,
        searchIndex: null
      }
    }),
    []
  );

  const initialRef = React.useMemo<LocationRef>(() => ({}), []);

  const query = React.useRef<SimpleSearchQuery>(new SimpleSearchQuery(window.location.search, ''));

  const getScrollIndex = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('scroll')) return { ...store };
    else return { ...store, location: { ...store.location, scroll: parseInt(location.scroll) } };
  }, []);

  const getCursorIndex = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('cursor')) return { ...store };
    else return { ...store, location: { ...store.location, cursor: parseInt(location.cursor) } };
  }, []);

  const getSelectIndexes = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('selectStart') || !location.hasOwnProperty('selectEnd')) return { ...store };
    const selectStart = parseInt(location.selectStart);
    const selectEnd = parseInt(location.selectEnd);
    return { ...store, location: { ...store.location, selectStart, selectEnd } };
  }, []);

  const getSearchType = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('searchType')) return { ...store };
    else if (location.searchType !== 'cursor' && location.searchType !== 'hex' && location.searchType !== 'text')
      return { ...store };
    else return { ...store, location: { ...store.location, searchType: location.searchType } };
  }, []);

  const getSearchValue = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('searchValue')) return { ...store };
    else if (store.location.searchType === null) return { ...store };
    else if (store.location.searchType === 'hex' && isHexString(location.searchValue))
      return { ...store, location: { ...store.location, searchValue: location.searchValue } };
    else if (store.location.searchType === 'text' && isHexString(location.searchValue))
      return {
        ...store,
        location: { ...store.location, searchValue: parseHexToString(location.searchValue.replace(/\s/g, '')) }
      };
    else return { ...store };
  }, []);

  const getSearchIndex = useCallback((store: Store,   location: LocationQuery): Store => {
    if (!location.hasOwnProperty('searchIndex')) return { ...store };
    else if (store.location.searchType === null || store.location.searchValue === null) return { ...store };
    else
      return {
        ...store,
        location: { ...store.location, searchIndex: parseInt(location.searchIndex) }
      };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchQuery = useCallback((store: Store,   location: LocationQuery): Store => {
    let searchType = location.hasOwnProperty('searchType') ? (location.searchType as SearchType) : null;
    searchType =
      searchType === 'cursor'
        ? 'cursor'
        : searchType === 'hex'
        ? 'hex'
        : searchType === 'text'
        ? 'text'
        : store.search.type;
    let searchValue = location.hasOwnProperty('searchValue') ? location.searchValue : null;
    searchValue =
      searchType === 'hex'
        ? searchValue
        : searchType === 'text'
        ? parseStringToHexString(searchValue)
        : store.search.inputValue;

    const searchIndex = location.hasOwnProperty('searchIndex') ? parseInt(location.searchIndex) : null;
    return { ...store, location: { ...store.location, searchType, searchValue, searchIndex } };
  }, []);

  const locationShare = useCallback(
    (store: Store,   { type, payload }: ActionProps): Store => {
      query.current.deleteAll();

      if (store.scroll.index !== null) {
        if (isBody.table(store)) query.current.set('scroll', store.scroll.index);
        else if (isBody.window(store)) query.current.set('scroll', store.cellsRendered.visibleStartIndex);
      }
      if (store.cursor.index !== null) query.current.set('cursor', store.cursor.index);
      if (store.select.startIndex >= 0) query.current.set('selectStart', store.select.startIndex);
      if (store.select.endIndex >= 0) query.current.set('selectEnd', store.select.endIndex);
      if (store.search.inputValue !== null && store.search.inputValue !== '') {
        query.current.set('searchType', store.search.type);
        if (isSearchType.hex(store)) {
          query.current.set('searchValue', store.search.inputValue.replace(/\s/g, ''));
        } else if (isSearchType.text(store)) {
          query.current.set('searchValue', formatTextString(store.search.inputValue).replace(/\s/g, ''));
        }
        if (store.search.selectedIndex !== null) query.current.set('searchIndex', store.search.selectedIndex);
      }

      copy(`${window.location.origin}${window.location.pathname}?${query.current.toString()}${window.location.hash}`);

      return { ...store };
    },
    [copy]
  );

  const locationInit = useCallback(
    (store: Store,   { type, payload }: ActionProps): Store => {
      query.current = new SimpleSearchQuery(window.location.search, '');
      const params: LocationQuery = query.current.getParams();
      store = getScrollIndex(store,  params);
      store = getCursorIndex(store,  params);
      store = getSelectIndexes(store,  params);
      store = getSearchType(store,  params);
      store = getSearchValue(store,  params);
      store = getSearchIndex(store,  params);
      store = { ...store, location: { ...store.location, loaded: true } };
      return { ...store };
    },
    [getCursorIndex, getScrollIndex, getSearchIndex, getSearchType, getSearchValue, getSelectIndexes]
  );

  const locationLoaded = useCallback((store: Store,   { type, payload }: ActionProps): Store => {
    return { ...store, location: { ...store.location, loaded: true } };
  }, []);

  const reducer = useCallback(
    ({   store, action }: ReducerProps): Store => {
      if (isAction.appLocationInit(action)) return locationInit( store, action);
      else if (isAction.locationLoaded(action)) return locationLoaded( store, action);
      else if (isAction.locationShare(action)) return locationShare( store, action);
      else return { ...store };
    },
    [locationInit, locationLoaded, locationShare]
  );

  return { initialState, initialRef, reducer };
};
