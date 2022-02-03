import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { HexStore, useCursor, useHex, useHover, useSearch, useSelect, useStyles } from 'components/visual/HexViewer';
import React, { useMemo } from 'react';

const useHexStyles = makeStyles(theme => ({
  data: {
    // border: `1px solid ${theme.palette.text.hint}`,
    padding: '2px',
    margin: 0,
    height: '22px'
  }
}));

export type HexCellProps = {
  store?: HexStore;
  type?: 'offset' | 'hex' | 'text';
  columnIndex?: number;
  index?: number;
};

export const WrappedHexCell = ({ store, type, columnIndex, index }: HexCellProps) => {
  const classes = useHexStyles();
  const { hexMap, getHexValue, getTextValue, getAddressValue } = useHex();
  const { onHoverMouseEnter, onHoverMouseLeave, onHoverMouseDown } = useHover();
  const { onCursorMouseDown, onCursorMouseEnter } = useCursor();
  const { onSelectMouseEnter, onSelectMouseDown } = useSelect();
  const { onSearchMouseDown } = useSearch();
  const {
    hexClasses,
    itemClasses,
    getHexColorClass,
    getCursorClass,
    getSelectClass,
    getSearchClass,
    getSelectedSearchClass,
    getBorderClass
  } = useStyles();

  const colorClass = useMemo(() => getHexColorClass(hexMap.current, index), [getHexColorClass, hexMap, index]);
  const borderClass = useMemo(() => getBorderClass(columnIndex), [columnIndex, getBorderClass]);
  const cursorClass = useMemo(
    () => getCursorClass(store.cursorIndex, index),
    [getCursorClass, index, store.cursorIndex]
  );
  const selectClass = useMemo(
    () => getSelectClass(store.selectIndexes, index),
    [getSelectClass, index, store.selectIndexes]
  );
  const searchClass = useMemo(
    () => getSearchClass(store.searchQuery, store.searchIndexes, store.searchIndex, index),
    [getSearchClass, index, store.searchIndex, store.searchIndexes, store.searchQuery]
  );
  const selectedSearchClass = useMemo(
    () => getSelectedSearchClass(store.searchQuery, store.searchIndexes, store.searchIndex, index),
    [getSelectedSearchClass, index, store.searchIndex, store.searchIndexes, store.searchQuery]
  );

  switch (type) {
    case 'offset':
      return <td>{getAddressValue(index)}</td>;
    case 'hex':
      return (
        <td
          data-index={index}
          className={clsx(
            classes.data,
            colorClass,
            borderClass,
            cursorClass,
            selectClass,
            searchClass,
            selectedSearchClass
          )}
          onMouseEnter={event => {
            onHoverMouseEnter(index);
            onCursorMouseEnter(index);
            onSelectMouseEnter(index);
          }}
          onMouseLeave={event => onHoverMouseLeave(index)}
          onMouseDown={event => {
            onHoverMouseDown();
            onCursorMouseDown(index);
            onSelectMouseDown(index);
            onSearchMouseDown(index);
          }}
        >
          {getHexValue(index)}
        </td>
      );
    case 'text':
      return (
        <td
          data-index={index}
          className={clsx(classes.data, colorClass, cursorClass, selectClass, searchClass, selectedSearchClass)}
          onMouseEnter={event => {
            onHoverMouseEnter(index);
            onCursorMouseEnter(index);
            onSelectMouseEnter(index);
          }}
          onMouseLeave={event => onHoverMouseLeave(index)}
          onMouseDown={event => {
            onHoverMouseDown();
            onCursorMouseDown(index);
            onSelectMouseDown(index);
            onSearchMouseDown(index);
          }}
        >
          {getTextValue(index)}
        </td>
      );
    default:
      return <td></td>;
  }
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
