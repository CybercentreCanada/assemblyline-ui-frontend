import { styled, useMediaQuery, useTheme } from '@mui/material';
import type { CSSProperties } from 'react';
import { forwardRef, memo } from 'react';
import { PageContent } from './PageContent';

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
    root?: CSSProperties;
    paper?: CSSProperties;
  };
};

export const PageFullSizeLayout = memo(
  forwardRef<HTMLDivElement, PageFullSizeProps>(function PageFullSizeLayout(
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
      <div
        id={id}
        className={className}
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          minHeight: 0,
          ...styles.root
        }}
      >
        <div
          style={{
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
        </div>
      </div>
    );
  })
);

PageFullSizeLayout.displayName = 'PageFullSizeLayout';

export const PageFullSize = memo(styled(PageContent)(() => ({ width: '100%' })));

PageFullSize.displayName = 'PageFullSize';
