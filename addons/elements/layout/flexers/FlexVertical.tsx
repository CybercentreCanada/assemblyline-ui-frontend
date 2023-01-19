import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

const FlexVertical: React.FC<{
  children: React.ReactNode;
  height?: string;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
}> = React.memo(({ children, height = '100%', margin = null, mb = 0, ml = 0, mr = 0, mt = 0 }) => {
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        marginBottom: theme.spacing(margin / divider || mb / divider),
        marginLeft: theme.spacing(margin / divider || ml / divider),
        marginRight: theme.spacing(margin / divider || mr / divider),
        marginTop: theme.spacing(margin / divider || mt / divider)
      }}
    >
      {children}
    </div>
  );
});

export default FlexVertical;
