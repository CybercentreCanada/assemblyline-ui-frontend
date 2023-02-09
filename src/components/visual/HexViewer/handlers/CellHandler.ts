import { ClassNameMap } from '@mui/styles';
import { CellType, getHexType, isCursorIndex, isSearchIndex, isSelectedSearchIndex, isSelectIndex, Store } from '..';

export const isCellMouseDown = (store: Store) => store.cell.isMouseDown;

export const isSameCellClick = (store: Store) => store.cell.mouseDownIndex === store.cell.mouseEnterIndex;

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
