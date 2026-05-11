import { useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { FoldingType, HexCell, HexOffset, HexSpacer, LAYOUT_SIZE, useStore } from 'components/visual/HexViewer';
import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';

export type HexRowProps = StoreProps & {
  rowIndex?: number;
  style?: CSSProperties;
  Tag?: 'div' | 'tr';
};

export const WrappedHexRow = ({ store, rowIndex = 0, style = null, Tag = 'div' }: HexRowProps) => {
  const theme = useTheme();

  const hexcodes = store.hex.codes;
  const cellTag = useMemo(() => (Tag === 'tr' ? 'td' : 'div'), [Tag]);

  const { active, rows } = store.layout.folding;

  const hexRowIndex = useMemo(() => (active ? rows.get(rowIndex).index : rowIndex), [active, rowIndex, rows]);
  const hexRowType = useMemo(() => (active ? rows.get(rowIndex).type : FoldingType.SHOW), [active, rowIndex, rows]);

  const indexes: number[] = useMemo(
    () =>
      Array.from(
        { length: store.layout.column.size },
        (_, i) => i + (active ? rows.get(rowIndex).index : rowIndex) * store.layout.column.size
      ),
    [active, rowIndex, rows, store.layout.column.size]
  );

  if (active && hexRowType === FoldingType.HIDE)
    return (
      <Tag
        style={{
          padding: '0px',
          margin: '0px',
          height: LAYOUT_SIZE.rowHeight,
          ...(Tag === 'div' && {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
          }),
          ...style
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'grid',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              height: LAYOUT_SIZE.rowHeight / 4,
              backgroundColor: theme.palette.background.paper
            }}
          >
            {' '}
          </div>
        </div>
      </Tag>
    );
  else
    return (
      <Tag
        style={{
          padding: '0px',
          margin: '0px',
          height: LAYOUT_SIZE.rowHeight,
          ...(Tag === 'div' && {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
          }),
          ...style
        }}
      >
        <HexOffset store={store} index={hexRowIndex * store.layout.column.size} Tag={cellTag} />
        <HexSpacer Tag={cellTag} style={{ width: LAYOUT_SIZE.spacingWidth, padding: '0px', margin: '0px' }} />
        {indexes.map((index, columnIndex) =>
          index >= hexcodes.size ? (
            <HexSpacer
              key={index}
              Tag={cellTag}
              style={{ padding: '0px', margin: '0px', ...(cellTag === 'div' && { width: LAYOUT_SIZE.hexWidth }) }}
            />
          ) : (
            <HexCell key={index} store={store} Tag={cellTag} type="hex" columnIndex={columnIndex} index={index} />
          )
        )}
        <HexSpacer Tag={cellTag} style={{ width: LAYOUT_SIZE.spacingWidth, padding: '0px', margin: '0px' }} />
        {indexes.map((index, columnIndex) =>
          index >= hexcodes.size ? (
            <HexSpacer
              key={index}
              Tag={cellTag}
              style={{ padding: '0px', margin: '0px', ...(cellTag === 'div' && { width: LAYOUT_SIZE.textWidth }) }}
            />
          ) : (
            <HexCell
              key={columnIndex}
              store={store}
              Tag={cellTag}
              type="text"
              columnIndex={columnIndex}
              index={index}
            />
          )
        )}
        <HexSpacer Tag={cellTag} style={{ width: LAYOUT_SIZE.spacingWidth, padding: '0px', margin: '0px' }} />
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
    prevProps.store.loading.status === nextProps.store.loading.status &&
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.hex.null.char === nextProps.store.hex.null.char &&
    prevProps.store.hex.nonPrintable.set === nextProps.store.hex.nonPrintable.set &&
    prevProps.store.hex.nonPrintable.char === nextProps.store.hex.nonPrintable.char &&
    prevProps.store.hex.higher.set === nextProps.store.hex.higher.set &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.mode.body === nextProps.store.mode.body &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.layout.folding.active === nextProps.store.layout.folding.active &&
    prevProps.store.layout.folding.rows.size === nextProps.store.layout.folding.rows.size &&
    Object.is(prevProps.style, nextProps.style)
);

export const WrappedWindowRow = ({ rowIndex = 0, style = null, Tag = 'div' }: HexRowProps) => {
  const { store } = useStore();
  return <HexRow store={store} rowIndex={rowIndex} style={style} Tag={Tag} />;
};
export const WindowRow = React.memo(WrappedWindowRow);
