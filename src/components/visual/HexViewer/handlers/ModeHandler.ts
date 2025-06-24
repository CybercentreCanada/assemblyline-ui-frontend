import type { ModeWidth, Store } from '..';
import { STORE_TYPES } from '..';

export const isWidthEqualDown = (store: Store, type: ModeWidth): boolean =>
  STORE_TYPES.mode.width[type] >= STORE_TYPES.mode.width[store.mode.width];

export const isWidthEqualUp = (store: Store, type: ModeWidth): boolean =>
  STORE_TYPES.mode.width[type] <= STORE_TYPES.mode.width[store.mode.width];
