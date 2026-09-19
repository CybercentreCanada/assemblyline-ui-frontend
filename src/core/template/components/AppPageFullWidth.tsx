import { useMediaQuery, useTheme } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { forwardRef, memo } from 'react';

export const AppPageFullWidth = memo(
  forwardRef<HTMLDivElement, PropsWithChildren>(({ children }: PropsWithChildren, ref) => {
    const theme = useTheme();
    const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          textAlign: 'left',

          paddingTop: theme.spacing(4 / divider),
          paddingBottom: theme.spacing(4 / divider),
          paddingLeft: theme.spacing(4 / divider),
          paddingRight: theme.spacing(4 / divider)
        }}
      >
        {children}
      </div>
    );
  })
);

AppPageFullWidth.displayName = 'AppPageFullWidth';
