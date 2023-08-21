import { FoldingType, Store } from '..';

export type LayoutSize = {
  windowHeight: number;
  mobileWindowHeight: number;
  rowHeight: number;
  offsetWidth: number;
  hexWidth: number;
  textWidth: number;
  spacingWidth: number;
};

export const LAYOUT_SIZE: LayoutSize = {
  windowHeight: 350,
  mobileWindowHeight: 160,
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
  { width: 1, columns: 1 }
];

export const handleLayoutColumnResize = (width: number) => COLUMNS.find(e => width >= e.width)?.columns;

export const handleLayoutRowResize = (height: number) => {
  const row = Math.floor(height / LAYOUT_SIZE.rowHeight);
  return row > 3 ? row : 3;
};

export const handleLayoutColumnResize2 = (store: Store, width: number) => {
  const columns = COLUMNS.sort((a, b) => b.columns - a.columns).find(e => {
    const displayType = store.layout.display.mode;
    let size: number = 0;

    size += 20;
    size += store.offset.show && LAYOUT_SIZE.offsetWidth;
    size += displayType === 'dual' ? 3 * LAYOUT_SIZE.spacingWidth : 2 * LAYOUT_SIZE.spacingWidth;
    size += (displayType === 'dual' || displayType === 'hex') && e.columns * LAYOUT_SIZE.hexWidth;
    size += (displayType === 'dual' || displayType === 'text') && e.columns * LAYOUT_SIZE.textWidth;

    return size < width;
  })?.columns;

  if (columns === null || columns === undefined) return COLUMNS[COLUMNS.length - 1].columns;
  else if (store.hex.codes.size <= columns)
    return COLUMNS.sort((a, b) => b.columns - a.columns).find(e => e.columns <= store.hex.codes.size)?.columns;
  else return columns;
};

export const concatArray = (data: Array<string>, size: number): Array<string> => {
  let array = [];
  let text = '';
  for (let i = 0; i < data.length; i++) {
    if (i % size === size - 1) {
      array.push(text);
      text = '';
    } else text = text + data[i];
  }
  if (text.length !== 0) array.push(text);
  return array;
};

export const getRowFoldingMap = (
  store: Store,
  columnSize: number
): Map<number, { index: number; type: FoldingType }> => {
  const data = concatArray(store.hex.data.split(' '), columnSize);
  let map: Map<number, { index: number; type: FoldingType }> = new Map();

  let i: number = 1; // data
  let j: number = 1; // map
  let hiddenSection: boolean = false;

  if (data.length === null || data.length === 0) return map;

  map.set(0, { index: 0, type: FoldingType.SHOW });
  if (data.length === 1) return map;

  while (i < data.length - 1) {
    if (data[i - 1] !== data[i] && data[i] !== data[i + 1]) {
      map.set(j, { index: i, type: FoldingType.SHOW });
      j++;
    } else if (data[i - 1] !== data[i] && data[i] === data[i + 1]) {
      map.set(j, { index: i, type: FoldingType.SHOW });
      j++;
    } else if (data[i - 1] === data[i] && data[i] !== data[i + 1] && hiddenSection) {
      map.set(j, { index: i, type: FoldingType.SHOW });
      hiddenSection = false;
      j++;
    } else if (data[i - 1] === data[i] && data[i] === data[i + 1] && !hiddenSection) {
      map.set(j, { index: i, type: FoldingType.HIDE });
      hiddenSection = true;
      j++;
    }
    i++;
  }

  map.set(j, { index: data.length - 1, type: FoldingType.SHOW });

  return map;
};
