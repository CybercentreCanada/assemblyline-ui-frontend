import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { getHexType, isCursorIndex, isSearchIndex, isSelectedSearchIndex, isSelectIndex, Store } from '..';

type Cell = { hex: 'hex'; text: 'text' };
const CELL: Cell = { hex: 'hex', text: 'text' };
export type CellType = typeof CELL[keyof typeof CELL];
export type IsCell = { [Property in CellType]: (store: Store) => boolean };
export const isCell = Object.fromEntries(
  Object.keys(CELL).map(key => [key, (store: Store) => store.cell.mouseOverType === CELL[key]])
) as IsCell;

export const isCellMouseDown = (store: Store) => store.cell.isMouseDown;

export const isSameCellClick = (store: Store) => store.cell.mouseDownIndex === store.cell.mouseEnterIndex;

export type OffsetSettingValues = {
  en: Array<{ label: string; value: number }>;
  fr: Array<{ label: string; value: number }>;
};

export const OFFSET_SETTING_VALUES: OffsetSettingValues = {
  en: [
    { label: 'Octal', value: 8 },
    { label: 'Decimal', value: 10 },
    { label: 'Hexadecimal', value: 16 }
  ],
  fr: [
    { label: 'Octal', value: 8 },
    { label: 'Décimal', value: 10 },
    { label: 'Hexadécimal', value: 16 }
  ]
};

export const getCellClasses = (
  store: Store,
  type: CellType,
  columnIndex: number,
  index: number,
  classes: ClassNameMap<any>
): Array<string> => {
  const asciiType = getHexType(store.hex.codes.get(index));

  return [
    asciiType === 'null' && classes.nullColor,
    asciiType === 'non printable' && classes.nonPrintableColor,
    asciiType === 'lower ASCII' && classes.lowerASCIIColor,
    asciiType === 'higher ASCII' && classes.higherASCIIColor,
    columnIndex % 4 === 0 && columnIndex !== 0 && type === 'hex' && classes.border,
    isCursorIndex(store, index) && classes.cursor,
    isSelectIndex(store, index) && classes.select,
    isSearchIndex(store, index) && classes.search,
    isSelectedSearchIndex(store, index) && classes.selectedSearch
  ];
};
