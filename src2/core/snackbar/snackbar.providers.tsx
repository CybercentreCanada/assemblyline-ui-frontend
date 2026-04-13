import { styled } from '@mui/material';
import { useAppConfig } from 'core/config';
import { SnackbarProvider } from 'notistack';
import React, { PropsWithChildren } from 'react';

const StyledSnackbarProvider = styled(SnackbarProvider)`
  & .SnackbarItem-message {
    word-break: break-all;
  }
`;

//*****************************************************************************************
// App Snackbar Provider
//*****************************************************************************************
export const AppSnackbarProvider = React.memo(({ children }: PropsWithChildren) => {
  const dense = useAppConfig(s => s.snackbar.dense);
  const maxSnack = useAppConfig(s => s.snackbar.maxSnack);

  return (
    <StyledSnackbarProvider maxSnack={maxSnack} dense={dense}>
      {children}
    </StyledSnackbarProvider>
  );
});

AppSnackbarProvider.displayName = 'AppSnackbarProvider';
