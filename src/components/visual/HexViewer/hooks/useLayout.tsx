import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useStore } from '..';

export type LayoutContextProps = {
  nextLayoutRows?: React.MutableRefObject<number>;
  nextLayoutColumns?: React.MutableRefObject<number>;
  nextLayoutAutoRows?: React.MutableRefObject<boolean>;
  nextLayoutAutoColumns?: React.MutableRefObject<boolean>;
  isContainerFocused?: React.MutableRefObject<boolean>;

  layoutRef?: React.MutableRefObject<HTMLDivElement>;
  containerRefs?: React.MutableRefObject<HTMLDivElement>[];
  hexesContainerRefs?: React.MutableRefObject<HTMLDivElement>;
  textsContainerRefs?: React.MutableRefObject<HTMLDivElement>;

  onLayoutInit?: () => void;
  onLayoutResize?: () => void;
  onLayoutColumnsChange?: (columns: number) => void;
  onLayoutRowsChange?: (rows: number) => void;
  onLayoutAutoColumnsChange?: (auto: boolean) => void;
  onLayoutAutoRowsChange?: (auto: boolean) => void;
  onContainerMouseDown: (event: MouseEvent) => void;
};

export const LayoutContext = React.createContext<LayoutContextProps>(null);

export const WrappedLayoutProvider = ({ children }: HexProps) => {
  const { setLayoutRows, setLayoutColumns, setLayoutAutoColumns, setLayoutAutoRows } = useStore();
  const { nextHexOffsetSize, onHexOffsetSizeChange } = useHex();

  const nextLayoutColumns = useRef<number>(16);
  const nextLayoutRows = useRef<number>(50);
  const nextLayoutAutoColumns = useRef<boolean>(true);
  const nextLayoutAutoRows = useRef<boolean>(true);
  const isContainerFocused = useRef<boolean>(false);

  const hexesContainerRefs = useRef<HTMLDivElement>(null);
  const textsContainerRefs = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const containerRefs = useMemo(() => [hexesContainerRefs, textsContainerRefs], []);

  const handleOffsetResize = useCallback(() => {
    const size = layoutRef.current.getBoundingClientRect().width > 425 ? 8 : 4;
    nextHexOffsetSize.current = size;
    onHexOffsetSizeChange(size);
  }, [nextHexOffsetSize, onHexOffsetSizeChange]);

  const handleRowResize = useCallback(() => {
    const viewportOffset = layoutRef.current.getBoundingClientRect();
    const newYSize = Math.floor(Math.abs(window.innerHeight - viewportOffset.top) / 22.875);
    const rows = newYSize > 5 ? newYSize - 3 : 3;
    nextLayoutRows.current = rows;
    setLayoutRows(rows);
  }, [setLayoutRows]);

  const handleColumnResize = useCallback(() => {
    const width = layoutRef.current.getBoundingClientRect().width;
    let columns = 16;
    if (width > 4750) columns = 128;
    else if (width > 4160) columns = 112;
    else if (width > 3590) columns = 96;
    else if (width > 3015) columns = 80;
    else if (width > 2450) columns = 64;
    else if (width > 1870) columns = 48;
    else if (width > 1290) columns = 32;
    else if (width > 1000) columns = 24;
    else if (width > 860) columns = 20;
    else if (width > 715) columns = 16;
    else if (width > 575) columns = 12;
    else if (width > 425) columns = 8;
    else if (width > 285) columns = 4;
    else if (width > 215) columns = 2;
    else columns = 1;
    nextLayoutColumns.current = columns;
    setLayoutColumns(columns);
  }, [setLayoutColumns]);

  const onLayoutInit = useCallback(() => {
    setLayoutRows(nextLayoutRows.current);
    setLayoutColumns(nextLayoutColumns.current);
    setLayoutAutoColumns(nextLayoutAutoColumns.current);
    setLayoutAutoRows(nextLayoutAutoRows.current);
  }, [setLayoutAutoColumns, setLayoutAutoRows, setLayoutColumns, setLayoutRows]);

  const onLayoutResize = useCallback(() => {
    if (layoutRef.current === null || layoutRef.current === undefined) return;
    nextLayoutAutoRows.current && handleRowResize();
    nextLayoutAutoColumns.current && handleColumnResize();
    handleOffsetResize();
  }, [handleColumnResize, handleOffsetResize, handleRowResize]);

  const onLayoutColumnsChange = useCallback(
    (columns: number) => {
      if (isNaN(columns) || columns <= 0) return;
      nextLayoutColumns.current = columns;
      setLayoutColumns(columns);
    },
    [setLayoutColumns]
  );

  const onLayoutRowsChange = useCallback(
    (rows: number) => {
      if (isNaN(rows) || rows <= 0) return;
      nextLayoutRows.current = rows;
      setLayoutRows(rows);
    },
    [setLayoutRows]
  );

  const onLayoutAutoColumnsChange = useCallback(
    (auto: boolean) => {
      nextLayoutAutoColumns.current = auto;
      setLayoutAutoColumns(auto);
      nextLayoutAutoColumns.current && handleColumnResize();
    },
    [handleColumnResize, setLayoutAutoColumns]
  );

  const onLayoutAutoRowsChange = useCallback(
    (auto: boolean) => {
      nextLayoutAutoRows.current = auto;
      setLayoutAutoRows(auto);
      nextLayoutAutoRows.current && handleRowResize();
    },
    [handleRowResize, setLayoutAutoRows]
  );

  const onContainerMouseDown = useCallback(
    event =>
      (isContainerFocused.current =
        containerRefs[0].current.contains(event.target) || containerRefs[1].current.contains(event.target)),
    [containerRefs]
  );

  return (
    <LayoutContext.Provider
      value={{
        nextLayoutRows,
        nextLayoutColumns,
        nextLayoutAutoRows,
        nextLayoutAutoColumns,
        isContainerFocused,
        layoutRef,
        containerRefs,
        hexesContainerRefs,
        textsContainerRefs,
        onLayoutInit,
        onLayoutResize,
        onLayoutColumnsChange,
        onLayoutRowsChange,
        onLayoutAutoColumnsChange,
        onLayoutAutoRowsChange,
        onContainerMouseDown
      }}
    >
      {useMemo(() => children, [children])}
    </LayoutContext.Provider>
  );
};

export const LayoutProvider = React.memo(WrappedLayoutProvider);
export const useLayout = (): LayoutContextProps => useContext(LayoutContext) as LayoutContextProps;
