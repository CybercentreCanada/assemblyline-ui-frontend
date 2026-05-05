import { useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { PageContent } from './PageContent';

type PageCenterProps = {
  children?: ReactNode;
  height?: string | number;
  margin?: number;
  maxWidth?: string;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  textAlign?: string;
  width?: string;
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
    );
  }
);

PageCenter.displayName = 'PageCenter';
