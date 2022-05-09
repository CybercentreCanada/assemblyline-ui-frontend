import { Store } from '..';

export const clampHistoryIndex = (store: Store, index: number) => {
  if (index <= 0) return 0;
  else if (index >= store.history.values.length) return store.history.values.length - 1;
  else return index;
};
