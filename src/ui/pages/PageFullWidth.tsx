import { useTheme } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import { memo } from 'react';
import { PageContent } from 'ui/pages/PageContent';

type PageFullWidthProps = {
  children?: ReactNode;
  height?: string | number;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};

export const PageFullWidth = memo(({ children, height, margin, mb, ml, mr, mt }: PageFullWidthProps) => {
  const theme = useTheme();

  const style: CSSProperties = {
    width: 'initial',
    ...(height !== undefined && { height }),
    ...(margin !== undefined && { margin: theme.spacing(margin) }),
    ...(mt !== undefined && { marginTop: theme.spacing(mt) }),
    ...(mb !== undefined && { marginBottom: theme.spacing(mb) }),
    ...(ml !== undefined && { marginLeft: theme.spacing(ml) }),
    ...(mr !== undefined && { marginRight: theme.spacing(mr) })
  };

  return <PageContent style={style}>{children}</PageContent>;
});

PageFullWidth.displayName = 'PageFullWidth';
