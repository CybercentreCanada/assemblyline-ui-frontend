import { Store } from '..';

export type LayoutSize = {
  windowHeight: number;
  rowHeight: number;
  offsetWidth: number;
  hexWidth: number;
  textWidth: number;
  spacingWidth: number;
};

export const LAYOUT_SIZE: LayoutSize = {
  windowHeight: 350,
  rowHeight: 22.3958,
  offsetWidth: 73.5833,
  hexWidth: 21.8958,
  textWidth: 12.9479,
  spacingWidth: 10
};

export const COLUMNS: Array<{ width: number; columns: number }> = [
  { width: 4750, columns: 128 },
  { width: 4160, columns: 112 },
  { width: 3590, columns: 96 },
  { width: 3015, columns: 80 },
  { width: 2450, columns: 64 },
  { width: 1870, columns: 48 },
  { width: 1290, columns: 32 },
  { width: 1000, columns: 24 },
  { width: 860, columns: 20 },
  { width: 715, columns: 16 },
  { width: 575, columns: 12 },
  { width: 425, columns: 8 },
  { width: 285, columns: 4 },
  { width: 0, columns: 0 }
];

export const handleLayoutColumnResize = (width: number) => COLUMNS.find(e => width >= e.width)?.columns;

export const handleLayoutRowResize = (height: number) => Math.floor(height / LAYOUT_SIZE.rowHeight);

// Focus
type Focus = { none: 'none'; toolbar: 'toolbar'; body: 'body' };
const FOCUS: Focus = { none: 'none', toolbar: 'toolbar', body: 'body' };
export type FocusType = typeof FOCUS[keyof typeof FOCUS];
export type IsFocus = { [Property in FocusType]: (store: Store) => boolean };
export const isFocus = Object.fromEntries(
  Object.keys(FOCUS).map(key => [key, (store: Store) => store.layout.isFocusing === FOCUS[key]])
) as IsFocus;
