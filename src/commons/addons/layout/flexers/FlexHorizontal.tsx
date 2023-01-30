import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

const FlexHorizontal: React.FC<{
  children: React.ReactNode;
  height?: string;
  alignItems?: string;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
}> = React.memo(({ children, height = '100%', alignItems, margin = null, mb = 0, ml = 0, mr = 0, mt = 0 }) => {
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height,
        alignItems,
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

export default FlexHorizontal;
