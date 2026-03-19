import { styled } from '@mui/material';
import { useAppConfigStore } from 'core/config';
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

export type AppSnackbarProviderProps = PropsWithChildren;

export const AppSnackbarProvider = React.memo(({ children }: AppSnackbarProviderProps) => {
  const dense = useAppConfigStore(s => s.snackbar.dense);
  const maxSnack = useAppConfigStore(s => s.snackbar.maxSnack);

  return (
    <StyledSnackbarProvider maxSnack={maxSnack} dense={dense}>
      {children}
    </StyledSnackbarProvider>
  );
});

AppSnackbarProvider.displayName = 'AppSnackbarProvider';
