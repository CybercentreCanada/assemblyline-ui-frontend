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
  useDispatch
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
};

export const WrappedHexCell = ({
  store,
  columnIndex = -1,
  index = -1,
  Tag = 'div',
  type = 'hex',
  style = ''
}: HexCellProps) => {
  const classes = useHexStyles();
  const cellClasses = useCellStyles();
  const { onCellMouseEnter, onCellMouseDown } = useDispatch();

  const { codes: hexcodes } = store.hex;

  return (
    <Tag
      id={Tag + '-' + index}
      data-index={index}
      className={clsx('cell', classes.cell, style, getCellClasses(store, type, columnIndex, index, cellClasses))}
      onMouseEnter={() => onCellMouseEnter({ index, type })}
      onMouseDown={() => onCellMouseDown({ index, type })}
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
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.themeType === nextProps.store.mode.themeType &&
    prevProps.store.mode.languageType === nextProps.store.mode.languageType &&
    prevProps.store.mode.widthType === nextProps.store.mode.widthType &&
    prevProps.store.hex.null.char === nextProps.store.hex.null.char &&
    prevProps.store.hex.lower.encoding === nextProps.store.hex.lower.encoding &&
    prevProps.store.hex.lower.char === nextProps.store.hex.lower.char &&
    prevProps.store.hex.higher.encoding === nextProps.store.hex.higher.encoding &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char
);
