import { Store } from '..';

export const isCursorNull = (store: Store) => store.cursor.index === null;

export const isCursorIndex = (store: Store, index: number) => store.cursor.index === index;

export const didCursorMove = (prevStore: Store, nextStore: Store): boolean =>
  prevStore.cursor.index !== nextStore.cursor.index;
