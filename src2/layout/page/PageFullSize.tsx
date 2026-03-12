import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import React, { forwardRef } from 'react';

type PageFullSizeProps = {
  id?: string;
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  className?: string;
  styles?: {
    root?: React.CSSProperties;
    paper?: React.CSSProperties;
  };
};

const PageFullSize2 = forwardRef<HTMLDivElement, PageFullSizeProps>(function PageFullSize(
  {
    id,
    className,
    children,
    margin = null,
    mb = 2,
    ml = 2,
    mr = 2,
    mt = 2,
    styles = {
      root: null,
      paper: null
    }
  },
  ref
) {
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <Box
      id={id}
      className={className}
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minHeight: 0,
        ...styles.root
      }}
    >
      <Box
        sx={{
          marginBottom: theme.spacing(margin / divider || mb / divider),
          marginLeft: theme.spacing(margin / divider || ml / divider),
          marginRight: theme.spacing(margin / divider || mr / divider),
          marginTop: theme.spacing(margin / divider || mt / divider),

          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0,
          ...styles.paper
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

export const PageFullSize = React.memo(styled(PageContent)(() => ({ width: '100%' }))) as React.FC<BoxProps>;

PageFullSize.displayName = 'PageFullSize';
