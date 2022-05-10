import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import {
  CellType,
  getCellClasses,
  getHexValue,
  getTextValue,
  LAYOUT_SIZE,
  StoreProps,
  useCellStyles,
  useDispatch,
  useReducer
} from '../..';

const useHexStyles = makeStyles(theme => ({
  cell: {
    paddingLeft: theme.spacing(0.2),
    paddingRight: theme.spacing(0.2),
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    userSelect: 'none',
    'td&': {},
    'div&': {
      display: 'block'
    }
  }
}));

export type HexCellProps = StoreProps & {
  columnIndex?: number;
  index?: number;
  Tag?: 'div' | 'td';
  type?: CellType;
  style?: string;
  bodyRef?: HTMLDivElement;
  listRef?: HTMLDivElement;
};

export const WrappedHexCell = ({
  store,
  columnIndex = -1,
  index = -1,
  Tag = 'div',
  type = 'hex',
  style = '',
  bodyRef = null,
  listRef = null
}: HexCellProps) => {
  const classes = useHexStyles();
  const cellClasses = useCellStyles();
  const { refs } = useReducer();
  const { onCellMouseEnter, onCellMouseDown } = useDispatch();

  const { codes: hexcodes } = store.hex;

  return (
    <Tag
      id={Tag + '-' + index}
      data-index={index}
      className={clsx('cell', classes.cell, style, getCellClasses(store, refs, type, columnIndex, index, cellClasses))}
      onMouseEnter={() => onCellMouseEnter({ index, type, bodyRef, listRef })}
      onMouseDown={() => onCellMouseDown({ index, type, bodyRef, listRef })}
      style={{ width: type === 'hex' ? LAYOUT_SIZE.hexWidth : LAYOUT_SIZE.textWidth }}
    >
      {type === 'hex' ? getHexValue(hexcodes, index) : getTextValue(store, hexcodes, index)}
    </Tag>
  );
};

export const HexCell = React.memo(
  WrappedHexCell,
  (
    prevProps: Readonly<React.PropsWithChildren<HexCellProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexCellProps>>
  ) =>
    prevProps.index === nextProps.index &&
    prevProps.columnIndex === nextProps.columnIndex &&
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.hex.null.char === nextProps.store.hex.null.char &&
    prevProps.store.hex.lower.encoding === nextProps.store.hex.lower.encoding &&
    prevProps.store.hex.lower.char === nextProps.store.hex.lower.char &&
    prevProps.store.hex.higher.encoding === nextProps.store.hex.higher.encoding &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char
);
