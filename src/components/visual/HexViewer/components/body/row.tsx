import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { HexCell, HexOffset, HexSpacer, LAYOUT_SIZE, StoreProps, useStore } from '../..';

const useHexStyles = makeStyles(theme => ({
  row: {
    padding: 0,
    margin: 0,
    height: LAYOUT_SIZE.rowHeight,
    'tr&': {},
    'div&': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center'
    }
  },
  spacer: {
    width: LAYOUT_SIZE.spacingWidth,
    padding: 0,
    margin: 0
  },
  empty: {
    adding: 0,
    margin: 0
  },
  emptyHex: {
    'div&': {
      width: LAYOUT_SIZE.hexWidth
    }
  },
  emptyText: {
    'div&': {
      width: LAYOUT_SIZE.textWidth
    }
  }
}));

export type HexRowProps = StoreProps & {
  rowIndex?: number;
  style?: React.CSSProperties;
  Tag?: 'div' | 'tr';
};

export const WrappedHexRow = ({ store, rowIndex = 0, style = null, Tag = 'div' }: HexRowProps) => {
  const classes = useHexStyles();

  const hexcodes = store.hex.codes;
  const cellTag = useMemo(() => (Tag === 'tr' ? 'td' : 'div'), [Tag]);
  const indexes: number[] = useMemo(
    () => Array.from({ length: store.layout.column.size }, (_, i) => i + rowIndex * store.layout.column.size),
    [rowIndex, store.layout.column.size]
  );

  return (
    <Tag className={classes.row} style={style}>
      <HexOffset store={store} index={rowIndex * store.layout.column.size} Tag={cellTag} />
      <HexSpacer Tag={cellTag} style={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= hexcodes.size ? (
          <HexSpacer key={index} Tag={cellTag} style={clsx(classes.empty, classes.emptyHex)} />
        ) : (
          <HexCell key={index} store={store} Tag={cellTag} type="hex" columnIndex={columnIndex} index={index} />
        )
      )}
      <HexSpacer Tag={cellTag} style={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= hexcodes.size ? (
          <HexSpacer key={index} Tag={cellTag} style={clsx(classes.empty, classes.emptyText)} />
        ) : (
          <HexCell key={columnIndex} store={store} Tag={cellTag} type="text" columnIndex={columnIndex} index={index} />
        )
      )}
      <HexSpacer Tag={cellTag} style={classes.spacer} />
    </Tag>
  );
};

export const HexRow = React.memo(
  WrappedHexRow,
  (
    prevProps: Readonly<React.PropsWithChildren<HexRowProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexRowProps>>
  ) =>
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.hex.null.char === nextProps.store.hex.null.char &&
    prevProps.store.hex.lower.encoding === nextProps.store.hex.lower.encoding &&
    prevProps.store.hex.lower.char === nextProps.store.hex.lower.char &&
    prevProps.store.hex.higher.encoding === nextProps.store.hex.higher.encoding &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width &&
    Object.is(prevProps.style, nextProps.style)
);

export const WrappedWindowRow = ({ rowIndex = 0, style = null, Tag = 'div' }: HexRowProps) => {
  const { store } = useStore();
  return <HexRow store={store} rowIndex={rowIndex} style={style} Tag={Tag} />;
};
export const WindowRow = React.memo(WrappedWindowRow);
