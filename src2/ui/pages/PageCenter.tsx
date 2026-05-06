import { useTheme } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import { memo } from 'react';
import { PageContent } from './PageContent';

type PageCenterProps = {
  children?: ReactNode;
  height?: CSSProperties['height'];
  margin?: CSSProperties['margin'];
  maxWidth?: CSSProperties['maxWidth'];
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  textAlign?: CSSProperties['textAlign'];
  width?: CSSProperties['width'];
};

export const PageCenterLayout = memo(
  ({ children, height, width = '95%', maxWidth = '1200px', textAlign = 'center' }: PageCenterProps) => {
    return (
      <div
        style={{
          height,
          width,
          textAlign,
          display: 'flex',
          flexDirection: 'column',
          marginInline: 'auto',
          maxWidth
        }}
      >
        <PageContent style={{ height: '100%' }}>{children}</PageContent>
      </div>
    );
  }
);

PageCenterLayout.displayName = 'PageCenterLayout';

export const PageCenter = memo(
  ({
    children,
    height,
    margin,
    mb,
    ml,
    mr,
    mt,
    width = '95%',
    maxWidth = '1200px',
    textAlign = 'center'
  }: PageCenterProps) => {
    const theme = useTheme();

    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            height,
            width,
            maxWidth,
            textAlign,
            display: 'flex',
            flexDirection: 'column',
            marginInline: 'auto',
            ...(margin !== undefined && { margin: theme.spacing(margin) }),
            ...(mt !== undefined && { marginTop: theme.spacing(mt) }),
            ...(mb !== undefined && { marginBottom: theme.spacing(mb) }),
            ...(ml !== undefined && { marginLeft: theme.spacing(ml) }),
            ...(mr !== undefined && { marginRight: theme.spacing(mr) })
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PageCenter.displayName = 'PageCenter';
