import { useTheme } from '@mui/material';
import { LAYOUT_SIZE, useDispatch } from 'components/visual/HexViewer';
import type { CSSProperties } from 'react';
import React from 'react';

export type HexSpacerProps = {
  Tag?: 'div' | 'td';
  style?: CSSProperties;
};

export const WrappedHexSpacer = ({ Tag = 'div', style = null }: HexSpacerProps) => {
  const theme = useTheme();
  const { onBodyMouseLeave } = useDispatch();

  return (
    <Tag
      onMouseEnter={() => onBodyMouseLeave()}
      style={{
        margin: 0,
        height: 'auto',
        fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
        userSelect: 'none',
        width: LAYOUT_SIZE.spacingWidth,
        ...(Tag === 'div' && { display: 'block' }),
        ...style
      }}
    />
  );
};

export const HexSpacer = React.memo(WrappedHexSpacer);
