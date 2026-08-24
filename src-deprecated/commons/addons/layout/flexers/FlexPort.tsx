import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

const FlexPort: React.FC<{
  margin?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  children: React.ReactNode;
}> = React.memo(({ margin = null, mb = 0, ml = 0, mr = 0, mt = 0, children }) => {
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;
  return (
    <div
      style={{
        position: 'relative',
        flexGrow: 1,
        marginBottom: theme.spacing(margin / divider || mb / divider),
        marginLeft: theme.spacing(margin / divider || ml / divider),
        marginRight: theme.spacing(margin / divider || mr / divider),
        marginTop: theme.spacing(margin / divider || mt / divider)
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default FlexPort;
