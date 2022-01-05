import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { HexProps, useCopy, useCursor } from '..';

export type HexParams = {
  cursor?: string;
};

export type LocationContextProps = {
  onLocationShare?: () => void;
};

export const LocationContext = React.createContext<LocationContextProps>(null);

export const WrappedLocationProvider = ({ children }: HexProps) => {
  const { nextCursorIndex, onCursorIndexChange } = useCursor();
  const { onCopyText } = useCopy();

  const query = useRef<SimpleSearchQuery>(null);

  useEffect(() => {
    query.current = new SimpleSearchQuery(window.location.search, '');
    const params: HexParams = query.current.getParams();
    if (params.hasOwnProperty('cursor')) onCursorIndexChange(parseInt(params.cursor));
  }, [onCursorIndexChange]);

  const onLocationShare = useCallback(() => {
    query.current.deleteAll();
    if (nextCursorIndex.current !== null) query.current.set('cursor', nextCursorIndex.current);
    onCopyText(
      `${window.location.origin}${window.location.pathname}?${query.current.toString()}${window.location.hash}`
    );
  }, [nextCursorIndex, onCopyText]);

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
