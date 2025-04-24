import { useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { getAddressValue, useDispatch } from 'components/visual/HexViewer';
import type { CSSProperties } from 'react';
import React from 'react';

export type HexOffsetProps = StoreProps & {
  index?: number;
  Tag?: 'div' | 'td';
  style?: CSSProperties;
};

export const WrappedHexOffset = ({ store, index = -1, Tag = 'div', style = null }: HexOffsetProps) => {
  const theme = useTheme();

  const { onBodyMouseLeave } = useDispatch();

  const {
    offset: { base, size }
  } = store;

  return (
    <Tag
      onMouseEnter={() => onBodyMouseLeave()}
      style={{
        margin: 0,
        padding: 0,
        display: 'block',
        color: theme.palette.text.secondary,
        fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
        userSelect: 'none',
        ...style
      }}
    >
      {getAddressValue(base, size, index)}
    </Tag>
  );
};

export const HexOffset = React.memo(
  WrappedHexOffset,
  (
    prevProps: Readonly<React.PropsWithChildren<HexOffsetProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexOffsetProps>>
  ) =>
    prevProps.index === nextProps.index &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.mode.body === nextProps.store.mode.body &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width
);
