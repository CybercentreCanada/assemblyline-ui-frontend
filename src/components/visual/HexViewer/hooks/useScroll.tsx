import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useLayout, useStore } from '..';

export type ScrollContextProps = {
  nextScrollIndex?: React.MutableRefObject<number>;
  nextScrollSpeed?: React.MutableRefObject<number>;
  nextScrollMaxIndex?: React.MutableRefObject<number>;
  nextIsSliding?: React.MutableRefObject<boolean>;
  isScrolling?: React.MutableRefObject<boolean>;
  getScrollOffsetIndex?: () => number;
  onScrollInit?: () => void;
  onScrollChange?: (state: 'scrollUp' | 'scrollDown' | 'setScroll', value: number) => void;
  onScrollWheel?: (event: React.WheelEvent<HTMLDivElement>) => void;
  onScrollClick?: (value: number) => void;
  onScrollSliderChange?: (value: number) => void;
  onScrollSliderMouseDown?: () => void;
  onScrollSliderMouseUp?: () => void;
  onScrollTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onScrollOffsetChange?: (index: number, location: 'top' | 'middle' | 'bottom' | 'include' | 'include-middle') => void;
  onScrollResize?: () => void;
  onScrollSpeedChange?: (speed: number) => void;
};

export const ScrollContext = React.createContext<ScrollContextProps>(null);

export const WrappedScrollProvider = ({ children }: HexProps) => {
  const { setScrollIndex, setScrollSpeed, setIsSliding } = useStore();
  const { hexMap, onHexIndexClamp } = useHex();
  const { nextLayoutColumns, nextLayoutRows } = useLayout();

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

  const clampOffsetIndex = useCallback(
    (offsetIndex: number) => {
      if (offsetIndex < nextScrollIndex.current) return offsetIndex;
      else if (offsetIndex >= nextScrollIndex.current + nextLayoutRows.current - 1)
        return offsetIndex - nextLayoutRows.current + 1;
      else return nextScrollIndex.current;
    },
    [nextLayoutRows]
  );

  const isOffsetClamped = useCallback(
    (offsetIndex: number) => {
      if (offsetIndex < nextScrollIndex.current) return true;
      else if (offsetIndex >= nextScrollIndex.current + nextLayoutRows.current - 1) return true;
      return false;
    },
    [nextLayoutRows]
  );

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

  const getScrollOffsetIndex = useCallback(
    () => nextScrollIndex.current * nextLayoutColumns.current,
    [nextLayoutColumns]
  );

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

  const onScrollOffsetChange = useCallback(
    (index: number, location: 'top' | 'middle' | 'bottom' | 'include' | 'include-middle') => {
      if (isNaN(index)) return;
      const clampedIndex = onHexIndexClamp(index);

      if (location === 'top') {
        nextScrollIndex.current = Math.floor(clampedIndex / nextLayoutColumns.current);
      } else if (location === 'middle') {
        nextScrollIndex.current = Math.floor(clampedIndex / nextLayoutColumns.current - nextLayoutRows.current / 2);
      } else if (location === 'bottom') {
        nextScrollIndex.current = Math.floor(clampedIndex / nextLayoutColumns.current - nextLayoutRows.current);
      } else if (location === 'include') {
        nextScrollIndex.current = clampOffsetIndex(Math.floor(clampedIndex / nextLayoutColumns.current));
      } else if (location === 'include-middle') {
        if (isOffsetClamped(Math.floor(clampedIndex / nextLayoutColumns.current)))
          nextScrollIndex.current = Math.floor(clampedIndex / nextLayoutColumns.current - nextLayoutRows.current / 2);
      }

      clampScrollIndex();
      handleScrollChange();
    },
    [
      clampOffsetIndex,
      clampScrollIndex,
      handleScrollChange,
      isOffsetClamped,
      nextLayoutColumns,
      nextLayoutRows,
      onHexIndexClamp
    ]
  );

  const onScrollResize = useCallback(() => {
    nextScrollMaxIndex.current = Math.ceil(
      hexMap.current.size / nextLayoutColumns.current - nextLayoutRows.current + 1
    );
    clampScrollIndex();
    handleScrollChange();
  }, [clampScrollIndex, handleScrollChange, hexMap, nextLayoutColumns, nextLayoutRows]);

  const onScrollSpeedChange = useCallback(
    (speed: number) => {
      if (speed <= 0 || isNaN(speed)) return;
      nextScrollSpeed.current = speed;
      setScrollSpeed(speed);
    },
    [setScrollSpeed]
  );

  return (
    <ScrollContext.Provider
      value={{
        nextScrollIndex,
        nextScrollSpeed,
        nextScrollMaxIndex,
        nextIsSliding,
        isScrolling,
        getScrollOffsetIndex,
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
        onScrollOffsetChange,
        onScrollResize,
        onScrollSpeedChange
      }}
    >
      {useMemo(() => children, [children])}
    </ScrollContext.Provider>
  );
};

export const ScrollProvider = React.memo(WrappedScrollProvider);
export const useScroll = (): ScrollContextProps => useContext(ScrollContext) as ScrollContextProps;
