import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useMode, useStore } from '..';
import { COLUMNS, DEFAULT_LAYOUT, LAYOUT_SIZE } from '../models/Layout';

export type LayoutContextProps = {
  nextLayoutRows?: React.MutableRefObject<number>;
  nextLayoutColumns?: React.MutableRefObject<number>;
  nextLayoutAutoRows?: React.MutableRefObject<boolean>;
  nextLayoutAutoColumns?: React.MutableRefObject<boolean>;
  isContainerFocused?: React.MutableRefObject<boolean>;

  bodyRef?: React.MutableRefObject<HTMLDivElement>;
  layoutRef?: React.MutableRefObject<HTMLDivElement>;
  containerRefs?: React.MutableRefObject<HTMLDivElement>[];
  hexesContainerRefs?: React.MutableRefObject<HTMLDivElement>;
  textsContainerRefs?: React.MutableRefObject<HTMLDivElement>;

  // onLayoutInit?: () => void;
  onLayoutResize?: () => void;
  onLayoutColumnsChange?: (columns: number) => void;
  onLayoutRowsChange?: (rows: number) => void;
  onLayoutAutoColumnsChange?: (auto: boolean) => void;
  onLayoutAutoRowsChange?: (auto: boolean) => void;
  onLayoutColumnsResize?: (width: number) => void
  onContainerMouseDown?: (event: MouseEvent) => void;
};

export const LayoutContext = React.createContext<LayoutContextProps>(null);

export const WrappedLayoutProvider = ({ children }: HexProps) => {
  const { setLayoutRows, setLayoutColumns, setLayoutAutoColumns, setLayoutAutoRows } = useStore();
  const { nextModeWidth } = useMode();
  const { nextHexOffsetSize, onHexOffsetSizeChange } = useHex();

  const nextLayoutColumns = useRef<number>(DEFAULT_LAYOUT.layoutColumns);
  const nextLayoutRows = useRef<number>(DEFAULT_LAYOUT.layoutRows);
  const nextLayoutAutoColumns = useRef<boolean>(DEFAULT_LAYOUT.layoutAutoColumns);
  const nextLayoutAutoRows = useRef<boolean>(DEFAULT_LAYOUT.layoutAutoRows);

  const bodyRef = useRef<HTMLDivElement | HTMLTableElement>(null);

  const isContainerFocused = useRef<boolean>(false);
  const hexesContainerRefs = useRef<HTMLDivElement>(null);
  const textsContainerRefs = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const containerRefs = useMemo(() => [hexesContainerRefs, textsContainerRefs, bodyRef], []);

  const handleOffsetResize = useCallback(() => {
    // const size = layoutRef.current.getBoundingClientRect().width > 425 ? 8 : 4;
    const size = nextModeWidth.current === 'xs' ? 0 : 8;
    nextHexOffsetSize.current = size;
    onHexOffsetSizeChange(size);
  }, [nextHexOffsetSize, nextModeWidth, onHexOffsetSizeChange]);

  const handleRowResize = useCallback(() => {
    const height = bodyRef.current === null ? 0 : bodyRef.current?.getBoundingClientRect().height;
    const rows = Math.floor(height / LAYOUT_SIZE.rowHeight);
    nextLayoutRows.current = rows;
    setLayoutRows(rows);
  }, [setLayoutRows]);

  const handleColumnResize = useCallback(() => {
    const width = bodyRef.current.getBoundingClientRect().width;
    const columns = COLUMNS.find(e => width >= e.width)?.columns;
    nextLayoutColumns.current = columns;
    setLayoutColumns(columns);
  }, [setLayoutColumns]);

  // const onLayoutInit = useCallback(() => {
  //   setLayoutRows(nextLayoutRows.current);
  //   setLayoutColumns(nextLayoutColumns.current);
  //   setLayoutAutoColumns(nextLayoutAutoColumns.current);
  //   setLayoutAutoRows(nextLayoutAutoRows.current);
  // }, [setLayoutAutoColumns, setLayoutAutoRows, setLayoutColumns, setLayoutRows]);

  const onLayoutResize = useCallback(() => {
    if (bodyRef.current === null || bodyRef.current === undefined) return;
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
      if (bodyRef.current === null || bodyRef.current === undefined) return;

      nextLayoutAutoColumns.current = auto;
      setLayoutAutoColumns(auto);
      nextLayoutAutoColumns.current && handleColumnResize();
    },
    [handleColumnResize, setLayoutAutoColumns]
  );

  const onLayoutAutoRowsChange = useCallback(
    (auto: boolean) => {
      if (bodyRef.current === null || bodyRef.current === undefined) return;

      nextLayoutAutoRows.current = auto;
      setLayoutAutoRows(auto);
      nextLayoutAutoRows.current && handleRowResize();
    },
    [handleRowResize, setLayoutAutoRows]
  );

  const onLayoutColumnsResize = useCallback(
    (width: number) => {
      const columns = COLUMNS.find(e => width >= e.width)?.columns;
      nextLayoutColumns.current = columns;
      setLayoutColumns(columns);
    },
    [setLayoutColumns]
  );

  const onContainerMouseDown = useCallback(
    event => (isContainerFocused.current = bodyRef.current.contains(event.target)),
    []
  );

  return (
    <LayoutContext.Provider
      value={{
        nextLayoutRows,
        nextLayoutColumns,
        nextLayoutAutoRows,
        nextLayoutAutoColumns,
        bodyRef,
        isContainerFocused,
        layoutRef,
        containerRefs,
        hexesContainerRefs,
        textsContainerRefs,
        // onLayoutInit,
        onLayoutResize,
        onLayoutColumnsChange,
        onLayoutRowsChange,
        onLayoutAutoColumnsChange,
        onLayoutAutoRowsChange,
        onContainerMouseDown,
        onLayoutColumnsResize
      }}
    >
      {useMemo(() => children, [children])}
    </LayoutContext.Provider>
  );
};

export const LayoutProvider = React.memo(WrappedLayoutProvider);
export const useLayout = (): LayoutContextProps => useContext(LayoutContext) as LayoutContextProps;
