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

export const handleSelectClass = (nextIndex: number, prevIndex: number, origin: number, selectClass: string) => {
  if (nextIndex > prevIndex && prevIndex < origin && nextIndex > origin) {
    removeClassToRange(prevIndex, origin, selectClass);
    addClassToRange(origin, nextIndex, selectClass);
  } else if (nextIndex < prevIndex && prevIndex > origin && nextIndex < origin) {
    removeClassToRange(origin, prevIndex, selectClass);
    addClassToRange(nextIndex, origin, selectClass);
  } else if (nextIndex > prevIndex && prevIndex >= origin) addClassToRange(prevIndex, nextIndex, selectClass);
  else if (nextIndex < prevIndex && nextIndex >= origin) removeClassToRange(nextIndex + 1, prevIndex, selectClass);
  else if (nextIndex < prevIndex && nextIndex <= origin) addClassToRange(nextIndex, prevIndex, selectClass);
  else if (nextIndex > prevIndex && nextIndex <= origin) removeClassToRange(prevIndex, nextIndex - 1, selectClass);
};
