import type { AlertProps } from '@mui/material';
import { Alert, alpha, styled } from '@mui/material';
import { memo } from 'react';

//*****************************************************************************************
// InformativeAlert
//*****************************************************************************************

export const InformativeAlert = memo(
  styled((props: AlertProps) => <Alert {...props} />)(({ theme }) => ({
    color: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    '& .MuiAlert-icon': {
      color: `${theme.palette.text.secondary} !important`
    },
    '& .MuiAlert-message': {
      width: '100%',
      textAlign: 'left'
    }
  }))
);

InformativeAlert.displayName = 'InformativeAlert';
