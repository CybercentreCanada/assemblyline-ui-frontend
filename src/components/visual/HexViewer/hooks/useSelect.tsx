import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useHex, useStore, useStyles } from '..';

export type SelectContextProps = {
  nextSelectIndexes?: React.MutableRefObject<{ start: number; end: number }>;
  isMouseDown?: React.MutableRefObject<boolean>;
  mouseDownIndex?: React.MutableRefObject<number>;
  mouseHoverIndex?: React.MutableRefObject<number>;
  onSelectMouseEnter?: (index: number) => void;
  onSelectMouseDown?: (index: number) => void;
  onSelectMouseUp?: (event: MouseEvent) => void;
  onSelectClear?: () => void;
  onSelectChange?: (start: number, end: number) => void;
};

export const SelectContext = React.createContext<SelectContextProps>(null);

export const WrappedSelectProvider = ({ children }: HexProps) => {
  const { setSelectIndexes } = useStore();
  const { onHexIndexClamp } = useHex();
  const { itemClasses, addContainerClassToRange, removeContainerClassToRange } = useStyles();

  const nextSelectIndexes = useRef<{ start: number; end: number }>({ start: -1, end: -1 });
  const isMouseDown = useRef<boolean>(false);
  const mouseDownIndex = useRef<number>(null);
  const mouseHoverIndex = useRef<number>(null);

  const handleSelectClass = useCallback(
    (index: number) => {
      if (
        index > mouseHoverIndex.current &&
        mouseHoverIndex.current < mouseDownIndex.current &&
        index > mouseDownIndex.current
      ) {
        removeContainerClassToRange(mouseHoverIndex.current, mouseDownIndex.current, itemClasses.select);
        addContainerClassToRange(mouseDownIndex.current, index, itemClasses.select);
      } else if (
        index < mouseHoverIndex.current &&
        mouseHoverIndex.current > mouseDownIndex.current &&
        index < mouseDownIndex.current
      ) {
        removeContainerClassToRange(mouseDownIndex.current, mouseHoverIndex.current, itemClasses.select);
        addContainerClassToRange(index, mouseDownIndex.current, itemClasses.select);
      } else if (index > mouseHoverIndex.current && mouseHoverIndex.current >= mouseDownIndex.current)
        addContainerClassToRange(mouseHoverIndex.current, index, itemClasses.select);
      else if (index < mouseHoverIndex.current && index >= mouseDownIndex.current)
        removeContainerClassToRange(index + 1, mouseHoverIndex.current, itemClasses.select);
      else if (index < mouseHoverIndex.current && index <= mouseDownIndex.current)
        addContainerClassToRange(index, mouseHoverIndex.current, itemClasses.select);
      else if (index > mouseHoverIndex.current && index <= mouseDownIndex.current)
        removeContainerClassToRange(mouseHoverIndex.current, index - 1, itemClasses.select);
    },
    [addContainerClassToRange, itemClasses.select, removeContainerClassToRange]
  );

  const onSelectMouseEnter = useCallback(
    (index: number) => {
      if (!isMouseDown.current) return;
      handleSelectClass(index);
      mouseHoverIndex.current = index;
    },
    [handleSelectClass]
  );
  const onSelectMouseDown = useCallback(
    (index: number) => {
      isMouseDown.current = true;
      mouseDownIndex.current = index;
      mouseHoverIndex.current = index;
      removeContainerClassToRange(nextSelectIndexes.current.start, nextSelectIndexes.current.end, itemClasses.select);
      nextSelectIndexes.current = { start: -1, end: -1 };
    },
    [itemClasses.select, removeContainerClassToRange]
  );
  const onSelectMouseUp = useCallback(
    (event: MouseEvent) => {
      isMouseDown.current = false;
      if (mouseHoverIndex.current === mouseDownIndex.current) return;
      event.preventDefault();

      const start = Math.min(mouseDownIndex.current, mouseHoverIndex.current);
      const end = Math.max(mouseDownIndex.current, mouseHoverIndex.current);
      nextSelectIndexes.current = { start: start, end: end };
      setSelectIndexes({ start: start, end: end });
    },
    [setSelectIndexes]
  );

  const onSelectClear = useCallback(() => {
    removeContainerClassToRange(nextSelectIndexes.current.start, nextSelectIndexes.current.end, itemClasses.select);
    nextSelectIndexes.current = { start: -1, end: -1 };
    setSelectIndexes({ start: -1, end: -1 });
  }, [itemClasses.select, removeContainerClassToRange, setSelectIndexes]);

  const onSelectChange = useCallback(
    (start: number, end: number) => {
      if (isNaN(start) || isNaN(end)) return;
      let newStart = onHexIndexClamp(start);
      let newEnd = onHexIndexClamp(end);

      mouseDownIndex.current = newStart;
      mouseHoverIndex.current = newStart;
      handleSelectClass(newEnd);
      nextSelectIndexes.current = { start: newStart, end: newEnd };
      setSelectIndexes({ start: newStart, end: newEnd });
    },
    [handleSelectClass, onHexIndexClamp, setSelectIndexes]
  );

  return (
    <SelectContext.Provider
      value={{
        nextSelectIndexes,
        isMouseDown,
        mouseDownIndex,
        mouseHoverIndex,
        onSelectMouseEnter,
        onSelectMouseDown,
        onSelectMouseUp,
        onSelectClear,
        onSelectChange
      }}
    >
      {useMemo(() => children, [children])}
    </SelectContext.Provider>
  );
};

export const SelectProvider = React.memo(WrappedSelectProvider);
export const useSelect = (): SelectContextProps => useContext(SelectContext) as SelectContextProps;
