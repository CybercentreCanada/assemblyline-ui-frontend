import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useLayout, useScroll, useStore, useStyles } from '..';

export type CursorContextProps = {
  nextCursorIndex?: React.MutableRefObject<number>;
  isCursorMoving?: React.MutableRefObject<boolean>;
  onCursorMouseDown?: (index: number) => void;
  onCursorMouseUp?: (event: MouseEvent) => void;
  onCursorMouseEnter?: (index: number) => void;
  onCursorKeyDown?: (event: KeyboardEvent) => void;
  onCursorClear?: () => void;
  onCursorIndexChange?: (index: number) => void;
};

export const CursorContext = React.createContext<CursorContextProps>(null);

export const WrappedCursorProvider = ({ children }: HexProps) => {
  const { setCursorIndex } = useStore();
  const { hexMap } = useHex();
  const { isContainerFocused, nextLayoutColumns } = useLayout();
  const { itemClasses, addContainerClass, removeContainerClass } = useStyles();
  const { onScrollToCursor } = useScroll();

  const nextCursorIndex = useRef<number>(null);
  const mouseDownIndex = useRef<number>(null);
  const mouseHoverIndex = useRef<number>(null);
  const isCursorMoving = useRef<boolean>(false);

  const clampCursor = useCallback(
    (index: number) => {
      if (index < 0) return 0;
      else if (index >= hexMap.current.size) return hexMap.current.size - 1;
      else return index;
    },
    [hexMap]
  );

  const handleCursorIndexChange = useCallback(
    (index: number, cursorMoving: boolean) => {
      isCursorMoving.current = cursorMoving;
      if (index === nextCursorIndex.current) return;
      removeContainerClass(nextCursorIndex.current, itemClasses.cursor);
      addContainerClass(index, itemClasses.cursor);
      nextCursorIndex.current = index;
      setCursorIndex(nextCursorIndex.current);
    },
    [addContainerClass, itemClasses.cursor, removeContainerClass, setCursorIndex]
  );

  const handleCursorChange = useCallback(
    (index: number) => {
      if (isCursorMoving.current) return;
      setTimeout(() => handleCursorIndexChange(index, true), 5);
      setTimeout(() => handleCursorIndexChange(index, false), 10);
      handleCursorIndexChange(index, true);
    },
    [handleCursorIndexChange]
  );

  const onCursorMouseDown = useCallback((index: number) => (mouseDownIndex.current = index), []);

  const onCursorMouseEnter = useCallback((index: number) => (mouseHoverIndex.current = index), []);

  const onCursorMouseUp = useCallback(
    (event: MouseEvent) => {
      if (mouseHoverIndex.current !== mouseDownIndex.current) return;
      event.preventDefault();
      handleCursorChange(mouseHoverIndex.current);
    },
    [handleCursorChange]
  );

  const onCursorKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key: keyCode } = event;

      if (
        !isContainerFocused.current ||
        nextCursorIndex.current === null ||
        (!isArrowLeft(keyCode) && !isArrowRight(keyCode) && !isArrowUp(keyCode) && !isArrowDown(keyCode))
      )
        return;
      event.preventDefault();

      let newCursorIndex: number = nextCursorIndex.current;
      if (isArrowLeft(keyCode)) newCursorIndex -= 1;
      else if (isArrowRight(keyCode)) newCursorIndex += 1;
      else if (isArrowUp(keyCode)) newCursorIndex -= nextLayoutColumns.current;
      else if (isArrowDown(keyCode)) newCursorIndex += nextLayoutColumns.current;

      newCursorIndex = clampCursor(newCursorIndex);
      onScrollToCursor(newCursorIndex);
      handleCursorChange(newCursorIndex);
    },
    [isContainerFocused, nextLayoutColumns, clampCursor, onScrollToCursor, handleCursorChange]
  );

  const onCursorClear = useCallback(() => handleCursorChange(null), [handleCursorChange]);

  const onCursorIndexChange = useCallback(
    (index: number) => {
      if (typeof index !== 'number' || isNaN(index)) return;
      const newCursorIndex = clampCursor(index);
      onScrollToCursor(newCursorIndex);
      handleCursorChange(newCursorIndex);
    },
    [clampCursor, handleCursorChange, onScrollToCursor]
  );

  return (
    <CursorContext.Provider
      value={{
        nextCursorIndex,
        isCursorMoving,
        onCursorKeyDown,
        onCursorMouseDown,
        onCursorMouseUp,
        onCursorMouseEnter,
        onCursorClear,
        onCursorIndexChange
      }}
    >
      {useMemo(() => children, [children])}
    </CursorContext.Provider>
  );
};

export const CursorProvider = React.memo(WrappedCursorProvider);
export const useCursor = (): CursorContextProps => useContext(CursorContext) as CursorContextProps;
