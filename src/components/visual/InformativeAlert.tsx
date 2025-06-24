import type { AlertProps } from '@mui/material';
import { Alert, alpha, useTheme } from '@mui/material';
import type { FC } from 'react';
import { memo } from 'react';

export const InformativeAlert: FC<AlertProps> = memo(({ ...props }) => {
  const theme = useTheme();

  return (
    <Alert
      {...props}
      slotProps={{
        root: { sx: { color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.text.primary, 0.04) } },
        icon: { sx: { color: `${theme.palette.text.secondary} !important` } },
        message: { sx: { width: '100%', textAlign: 'left' } }
      }}
    />
  );
});

export default InformativeAlert;
