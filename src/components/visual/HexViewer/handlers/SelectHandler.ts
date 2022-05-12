import { MutableRefObject } from 'react';
import { addClassToRange, removeClassToRange } from '.';
import { Store, StoreRef } from '..';

export const orderSelectIndexes = (startIndex: number, endIndex: number): { startIndex: number; endIndex: number } => ({
  startIndex: Math.min(startIndex, endIndex),
  endIndex: Math.max(startIndex, endIndex)
});

export const isSelectIndex = (store: Store, index: number) =>
  store.select.startIndex <= index && index <= store.select.endIndex;

export const getSelectIndexes = (store: Store, refs: StoreRef): number[] =>
  Array.from(
    { length: store.select.endIndex - store.select.startIndex + 1 },
    (_, i) => i + store.select.startIndex
  ).filter(index => store.cellsRendered.overscanStartIndex <= index && index <= store.cellsRendered.overscanStopIndex);

export const handleSelectClass = (
  ref: MutableRefObject<HTMLDivElement>,
  nextIndex: number,
  prevIndex: number,
  origin: number,
  selectClass: string
) => {
  if (nextIndex > prevIndex && prevIndex < origin && nextIndex > origin) {
    removeClassToRange(ref, prevIndex, origin, selectClass);
    addClassToRange(ref, origin, nextIndex, selectClass);
  } else if (nextIndex < prevIndex && prevIndex > origin && nextIndex < origin) {
    removeClassToRange(ref, origin, prevIndex, selectClass);
    addClassToRange(ref, nextIndex, origin, selectClass);
  } else if (nextIndex > prevIndex && prevIndex >= origin) addClassToRange(ref, prevIndex, nextIndex, selectClass);
  else if (nextIndex < prevIndex && nextIndex >= origin) removeClassToRange(ref, nextIndex + 1, prevIndex, selectClass);
  else if (nextIndex < prevIndex && nextIndex <= origin) addClassToRange(ref, nextIndex, prevIndex, selectClass);
  else if (nextIndex > prevIndex && nextIndex <= origin) removeClassToRange(ref, prevIndex, nextIndex - 1, selectClass);
};
