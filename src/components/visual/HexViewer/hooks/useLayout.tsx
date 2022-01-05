import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useStore } from '..';

export type LayoutContextProps = {
  nextLayoutRow?: React.MutableRefObject<number>;
  nextLayoutColumns?: React.MutableRefObject<number>;
  nextLayoutAutoRow?: React.MutableRefObject<boolean>;
  nextLayoutAutoColumns?: React.MutableRefObject<boolean>;
  isContainerFocused?: React.MutableRefObject<boolean>;

  layoutRef?: React.MutableRefObject<HTMLDivElement>;
  containerRefs?: React.MutableRefObject<HTMLDivElement>[];
  hexesContainerRefs?: React.MutableRefObject<HTMLDivElement>;
  textsContainerRefs?: React.MutableRefObject<HTMLDivElement>;

  onLayoutInit?: () => void;
  onLayoutResize?: () => void;
  onLayoutColumnsChange?: (columns: number) => void;
  onContainerMouseDown: (event: MouseEvent) => void;
};

export const LayoutContext = React.createContext<LayoutContextProps>(null);

export const WrappedLayoutProvider = ({ children }: HexProps) => {
  const { setLayoutRows, setLayoutColumns } = useStore();
  const { hexOffsetSize, onHexOffsetSizeChange } = useHex();

  const nextLayoutRow = useRef<number>(50);
  const nextLayoutColumns = useRef<number>(16);
  const nextLayoutAutoRow = useRef<boolean>(false);
  const nextLayoutAutoColumns = useRef<boolean>(false);
  const isContainerFocused = useRef<boolean>(false);

  const hexesContainerRefs = useRef<HTMLDivElement>(null);
  const textsContainerRefs = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const containerRefs = useMemo(() => [hexesContainerRefs, textsContainerRefs], []);

  const handleOffsetResize = useCallback(() => {
    const size = layoutRef.current.getBoundingClientRect().width > 425 ? 8 : 4;
    hexOffsetSize.current = size;
    onHexOffsetSizeChange(size);
  }, [hexOffsetSize, onHexOffsetSizeChange]);

  const handleRowResize = useCallback(() => {
    const viewportOffset = layoutRef.current.getBoundingClientRect();
    const newYSize = Math.floor(Math.abs(window.innerHeight - viewportOffset.top) / 22.875);
    const rows = newYSize > 5 ? newYSize - 3 : 3;
    nextLayoutRow.current = rows;
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
    setLayoutRows(nextLayoutRow.current);
    setLayoutColumns(nextLayoutColumns.current);
  }, [setLayoutColumns, setLayoutRows]);

  const onLayoutResize = useCallback(() => {
    if (layoutRef.current === null || layoutRef.current === undefined) return;
    nextLayoutAutoRow.current && handleRowResize();
    nextLayoutAutoColumns.current && handleColumnResize();
    handleOffsetResize();
  }, [handleColumnResize, handleOffsetResize, handleRowResize]);

  const onLayoutColumnsChange = useCallback(
    (columns: number) => {
      nextLayoutColumns.current = columns;
      setLayoutColumns(columns);
    },
    [setLayoutColumns]
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
        nextLayoutRow,
        nextLayoutColumns,
        nextLayoutAutoRow,
        nextLayoutAutoColumns,
        isContainerFocused,
        layoutRef,
        containerRefs,
        hexesContainerRefs,
        textsContainerRefs,
        onLayoutInit,
        onLayoutResize,
        onLayoutColumnsChange,
        onContainerMouseDown
      }}
    >
      {useMemo(() => children, [children])}
    </LayoutContext.Provider>
  );
};

export const LayoutProvider = React.memo(WrappedLayoutProvider);
export const useLayout = (): LayoutContextProps => useContext(LayoutContext) as LayoutContextProps;
