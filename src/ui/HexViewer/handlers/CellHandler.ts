import type { CellType, Store } from '..';
import { getHexType, isCursorIndex, isSearchIndex, isSelectedSearchIndex, isSelectIndex } from '..';

export const isCellMouseDown = (store: Store) => store.cell.isMouseDown;

export const isSameCellClick = (store: Store) => store.cell.mouseDownIndex === store.cell.mouseEnterIndex;

export const getCellClasses = (store: Store, type: CellType, columnIndex: number, index: number): string[] => {
  const asciiType = getHexType(store.hex.codes.get(index));

  return [
    asciiType === 'null' && 'hex-viewer-null-color',
    asciiType === 'non printable' && 'hex-viewer-non-printable-color',
    asciiType === 'lower ASCII' && 'hex-viewer-lower-ascii-color',
    asciiType === 'higher ASCII' && 'hex-viewer-higher-ascii-color',
    columnIndex % 4 === 0 && columnIndex !== 0 && type === 'hex' && 'hex-viewer-border',
    isCursorIndex(store, index) && 'hex-viewer-cursor',
    isSelectIndex(store, index) && 'hex-viewer-select',
    isSearchIndex(store, index) && 'hex-viewer-search',
    isSelectedSearchIndex(store, index) && 'hex-viewer-selected-search'
  ];
};
