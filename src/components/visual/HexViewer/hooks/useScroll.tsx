import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useLayout, useStore } from '..';

export type ScrollContextProps = {
  nextScrollIndex?: React.MutableRefObject<number>;
  nextScrollSpeed?: React.MutableRefObject<number>;
  nextScrollMaxIndex?: React.MutableRefObject<number>;
  nextIsSliding?: React.MutableRefObject<boolean>;
  isScrolling?: React.MutableRefObject<boolean>;
  handleScrollChange: () => void;
  onScrollInit?: () => void;
  onScrollChange?: (state: 'scrollUp' | 'scrollDown' | 'setScroll', value: number) => void;
  onScrollWheel?: (event: React.WheelEvent<HTMLDivElement>) => void;
  onScrollClick?: (value: number) => void;
  onScrollSliderChange?: (value: number) => void;
  onScrollSliderMouseDown?: () => void;
  onScrollSliderMouseUp: () => void;
  onScrollTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollToCursor?: (index: number) => void;
  onScrollToSearchIndex?: (index: number) => void;
  onScrollResize?: () => void;
};

export const ScrollContext = React.createContext<ScrollContextProps>(null);

export const WrappedScrollProvider = ({ children }: HexProps) => {
  const { setScrollIndex, setScrollSpeed, setIsSliding } = useStore();
  const { hexMap } = useHex();
  const { nextLayoutColumns, nextLayoutRow } = useLayout();

  const nextScrollIndex = useRef<number>(0);
  const nextScrollSpeed = useRef<number>(1);
  const nextScrollMaxIndex = useRef<number>(50);
  const nextIsSliding = useRef<boolean>(false);
  const isScrolling = useRef<boolean>(false);
  const startTouchScreenY = useRef<number>(0);
  const prevTouchDistance = useRef<number>(0);

  const clampScrollIndex = useCallback(() => {
    if (nextScrollIndex.current < 0) nextScrollIndex.current = 0;
    else if (nextScrollIndex.current > nextScrollMaxIndex.current - 1)
      nextScrollIndex.current = nextScrollMaxIndex.current - 1;
  }, []);

  const handleScrollIndexChange = useCallback(
    (scrolling: boolean) => {
      setScrollIndex(nextScrollIndex.current);
      isScrolling.current = scrolling;
    },
    [setScrollIndex]
  );

  const handleScrollChange = useCallback(() => {
    if (isScrolling.current) return;
    setTimeout(() => handleScrollIndexChange(true), 25);
    setTimeout(() => handleScrollIndexChange(false), 50);
    handleScrollIndexChange(true);
  }, [handleScrollIndexChange]);

  const onScrollInit = useCallback(() => {
    setScrollIndex(nextScrollIndex.current);
    setScrollSpeed(nextScrollSpeed.current);
  }, [setScrollIndex, setScrollSpeed]);

  const onScrollChange = useCallback(
    (state: 'scrollUp' | 'scrollDown' | 'setScroll', value?: number) => {
      if (state === 'scrollUp') nextScrollIndex.current -= value;
      else if (state === 'scrollDown') nextScrollIndex.current += value;
      else if (state === 'setScroll') nextScrollIndex.current = value;
      clampScrollIndex();
      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange]
  );

  const onScrollClick = useCallback(
    (value: number) => {
      if (value > 0) nextScrollIndex.current += nextScrollSpeed.current;
      else nextScrollIndex.current -= nextScrollSpeed.current;
      clampScrollIndex();
      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange]
  );

  const onScrollSliderChange = useCallback(
    (value: number) => {
      nextScrollIndex.current = nextScrollMaxIndex.current - value;
      clampScrollIndex();
      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange]
  );

  const onScrollSliderMouseDown = useCallback(() => {
    nextIsSliding.current = true;
    setIsSliding(true);
  }, [setIsSliding]);

  const onScrollSliderMouseUp = useCallback(() => {
    nextIsSliding.current = false;
    setIsSliding(false);
  }, [setIsSliding]);

  const onScrollWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.deltaY === null || event.deltaY === 0) return;

      if (event.deltaY > 0) nextScrollIndex.current += nextScrollSpeed.current;
      else nextScrollIndex.current -= nextScrollSpeed.current;
      clampScrollIndex();
      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange]
  );

  const onScrollTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    startTouchScreenY.current = event.targetTouches[0].screenY;
    prevTouchDistance.current = 0;
  }, []);

  const onScrollTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    startTouchScreenY.current = 0;
    prevTouchDistance.current = 0;
  }, []);

  const onScrollTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const distance: number = (event.targetTouches[0].screenY - startTouchScreenY.current) / 22.875;
      const scrollDistance: number = distance >= 0 ? Math.floor(distance) : Math.ceil(distance);
      if (scrollDistance !== prevTouchDistance.current) {
        nextScrollIndex.current -= scrollDistance - prevTouchDistance.current;
        clampScrollIndex();
        handleScrollChange();
        prevTouchDistance.current = scrollDistance;
      }
    },
    [clampScrollIndex, handleScrollChange]
  );

  const onScrollToCursor = useCallback(
    (index: number) => {
      let cursorRow = Math.floor(index / nextLayoutColumns.current);
      if (cursorRow <= nextScrollIndex.current) nextScrollIndex.current = cursorRow;
      else if (cursorRow >= nextScrollIndex.current + nextLayoutRow.current - 1)
        nextScrollIndex.current = cursorRow - nextLayoutRow.current + 1;
      clampScrollIndex();

      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange, nextLayoutColumns, nextLayoutRow]
  );

  const onScrollToSearchIndex = useCallback(
    (index: number) => {
      // let searchRow = Math.floor(index / nextLayoutColumns.current - nextLayoutRow.current / 2);
      let searchRow = Math.floor(index / nextLayoutColumns.current);

      if (searchRow <= nextScrollIndex.current || searchRow >= nextScrollIndex.current + nextLayoutRow.current - 1)
        nextScrollIndex.current = Math.floor(searchRow - nextLayoutRow.current / 2);
      clampScrollIndex();
      handleScrollChange();
    },
    [clampScrollIndex, handleScrollChange, nextLayoutColumns, nextLayoutRow]
  );

  const onScrollResize = useCallback(() => {
    nextScrollMaxIndex.current = Math.ceil(hexMap.current.size / nextLayoutColumns.current - nextLayoutRow.current + 1);
    clampScrollIndex();
    handleScrollChange();
  }, [clampScrollIndex, handleScrollChange, hexMap, nextLayoutColumns, nextLayoutRow]);

  return (
    <ScrollContext.Provider
      value={{
        nextScrollIndex,
        nextScrollSpeed,
        nextScrollMaxIndex,
        nextIsSliding,
        isScrolling,
        handleScrollChange,
        onScrollInit,
        onScrollChange,
        onScrollWheel,
        onScrollClick,
        onScrollSliderChange,
        onScrollSliderMouseDown,
        onScrollSliderMouseUp,
        onScrollTouchStart,
        onScrollTouchMove,
        onScrollTouchEnd,
        onScrollToCursor,
        onScrollToSearchIndex,
        onScrollResize
      }}
    >
      {useMemo(() => children, [children])}
    </ScrollContext.Provider>
  );
};

export const ScrollProvider = React.memo(WrappedScrollProvider);
export const useScroll = (): ScrollContextProps => useContext(ScrollContext) as ScrollContextProps;
