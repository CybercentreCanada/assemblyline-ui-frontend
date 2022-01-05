import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { HexProps, useCopy, useCursor, useLayout, useScroll, useSearch, useSelect } from '..';

export type HexParams = {
  scroll?: string;
  cursor?: string;
  selectStart?: string;
  selectEnd?: string;
  searchValue?: string;
  searchIndex?: string;
};

export type LocationContextProps = {
  onLocationShare?: () => void;
};

export const LocationContext = React.createContext<LocationContextProps>(null);

export const WrappedLocationProvider = ({ children }: HexProps) => {
  const { nextLayoutColumns } = useLayout();
  const { nextCursorIndex, onCursorIndexChange } = useCursor();
  const { nextScrollIndex, onScrollChange } = useScroll();
  const { nextSelectIndexes, onSelectChange } = useSelect();
  const { nextSearchValue, nextSearchIndex, onSearchValueChange, onSearchIndexChange } = useSearch();
  const { onCopyText } = useCopy();

  const query = useRef<SimpleSearchQuery>(null);

  useEffect(() => {
    query.current = new SimpleSearchQuery(window.location.search, '');
    const params: HexParams = query.current.getParams();
    if (params.hasOwnProperty('scroll')) onScrollChange('setScroll', parseInt(params.scroll));
    if (params.hasOwnProperty('cursor')) onCursorIndexChange(parseInt(params.cursor));
    if (params.hasOwnProperty('selectStart') && params.hasOwnProperty('selectEnd'))
      onSelectChange(parseInt(params.selectStart), parseInt(params.selectEnd));
    if (params.hasOwnProperty('searchValue')) onSearchValueChange(params.searchValue);
    if (params.hasOwnProperty('searchIndex')) onSearchIndexChange(parseInt(params.searchIndex) + 1);
  }, [onCursorIndexChange, onScrollChange, onSearchIndexChange, onSearchValueChange, onSelectChange]);

  const onLocationShare = useCallback(() => {
    query.current.deleteAll();
    if (nextScrollIndex.current !== null)
      query.current.set('scroll', nextScrollIndex.current * nextLayoutColumns.current);
    if (nextCursorIndex.current !== null) query.current.set('cursor', nextCursorIndex.current);
    if (nextSelectIndexes.current.start >= 0) query.current.set('selectStart', nextSelectIndexes.current.start);
    if (nextSelectIndexes.current.end >= 0) query.current.set('selectEnd', nextSelectIndexes.current.end);
    if (nextSearchValue.current !== null) query.current.set('searchValue', nextSearchValue.current);
    if (nextSearchIndex.current !== null) query.current.set('searchIndex', nextSearchIndex.current);
    onCopyText(
      `${window.location.origin}${window.location.pathname}?${query.current.toString()}${window.location.hash}`
    );
  }, [
    nextCursorIndex,
    nextLayoutColumns,
    nextScrollIndex,
    nextSearchIndex,
    nextSearchValue,
    nextSelectIndexes,
    onCopyText
  ]);

  return (
    <LocationContext.Provider
      value={{
        onLocationShare
      }}
    >
      {useMemo(() => children, [children])}
    </LocationContext.Provider>
  );
};

export const LocationProvider = React.memo(WrappedLocationProvider);
export const useLocation = (): LocationContextProps => useContext(LocationContext) as LocationContextProps;
