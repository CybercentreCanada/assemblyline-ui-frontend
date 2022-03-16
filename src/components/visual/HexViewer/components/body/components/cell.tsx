import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { HexStoreProps } from 'components/visual/HexViewer';
import { DEFAULT } from 'components/visual/HexViewer/configs/default';
import { getHexValue, getTextValue } from 'components/visual/HexViewer/handlers/HexHandler';
import React from 'react';

const useHexStyles = makeStyles(theme => ({
  cell: {
    display: 'block',
    paddingLeft: theme.spacing(0.2),
    paddingRight: theme.spacing(0.2),
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    userSelect: 'none'
  }
}));

export type HexCellProps = HexStoreProps & {
  columnIndex?: number;
  index?: number;
  Tag?: 'div' | 'td';
  type?: 'hex' | 'text';
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

  const {
    hex: { codes: hexcodes }
  } = store;

  // const { hexMap, getHexValue, getTextValue } = useHex();
  // const { onHoverMouseEnter, onHoverMouseLeave, onHoverMouseDown } = useHover();
  // const { onCursorMouseDown, onCursorMouseEnter } = useCursor();
  // const { onSelectMouseEnter, onSelectMouseDown } = useSelect();
  // const { onSearchMouseDown } = useSearch();
  // const {
  //   hexClasses,
  //   itemClasses,
  //   getHexColorClass,
  //   getCursorClass,
  //   getSelectClass,
  //   getSearchClass,
  //   getSelectedSearchClass,
  //   getBorderClass
  // } = useStyles();

  // const colorClass = useMemo(() => getHexColorClass(hexMap.current, index), [getHexColorClass, hexMap, index]);
  // const borderClass = useMemo(() => getBorderClass(columnIndex), [columnIndex, getBorderClass]);
  // const cursorClass = useMemo(
  //   () => getCursorClass(store.cursorIndex, index),
  //   [getCursorClass, index, store.cursorIndex]
  // );
  // const selectClass = useMemo(
  //   () => getSelectClass(store.selectIndexes, index),
  //   [getSelectClass, index, store.selectIndexes]
  // );
  // const searchClass = useMemo(
  //   () => getSearchClass(store.searchQuery, store.searchIndexes, store.searchIndex, index),
  //   [getSearchClass, index, store.searchIndex, store.searchIndexes, store.searchQuery]
  // );
  // const selectedSearchClass = useMemo(
  //   () => getSelectedSearchClass(store.searchQuery, store.searchIndexes, store.searchIndex, index),
  //   [getSelectedSearchClass, index, store.searchIndex, store.searchIndexes, store.searchQuery]
  // );

  return (
    <Tag
      data-index={index}
      className={clsx(
        classes.cell,
        style
        // colorClass,
        // borderClass,
        // cursorClass,
        // selectClass,
        // searchClass,
        // selectedSearchClass
      )}
      // onMouseEnter={event => {
      //   onHoverMouseEnter(index);
      //   onCursorMouseEnter(index);
      //   onSelectMouseEnter(index);
      // }}
      // onMouseLeave={event => onHoverMouseLeave(index)}
      // onMouseDown={event => {
      //   onHoverMouseDown();
      //   onCursorMouseDown(index);
      //   onSelectMouseDown(index);
      //   onSearchMouseDown(index);
      // }}
      style={{ width: type === 'hex' ? DEFAULT.hexWidth : DEFAULT.textWidth }}
    >
      {type === 'hex' ? getHexValue(hexcodes, index) : getTextValue(hexcodes, index)}
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
    prevProps.store.initialized === nextProps.store.initialized
);
