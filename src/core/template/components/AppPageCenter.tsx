import { useMediaQuery, useTheme } from '@mui/material';
import type { CSSProperties, PropsWithChildren } from 'react';
import { forwardRef, memo } from 'react';

export type AppPageCenterProps = PropsWithChildren<{ style?: CSSProperties }>;

export const AppPageCenter = memo(
  forwardRef<HTMLDivElement, AppPageCenterProps>(({ children, style = null }: AppPageCenterProps) => {
    const theme = useTheme();

    const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            marginInline: 'auto',
            textAlign: 'center',

            paddingTop: theme.spacing(4 / divider),
            paddingBottom: theme.spacing(4 / divider),
            paddingLeft: theme.spacing(4 / divider),
            paddingRight: theme.spacing(4 / divider),
            ...style
          }}
        >
          {children}
        </div>
      </div>
    );
  })
);

AppPageCenter.displayName = 'AppPageCenter';
