import { styled } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import { SnackbarProvider } from 'notistack';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// StyledSnackbarProvider
//*****************************************************************************************

const StyledSnackbarProvider = styled(SnackbarProvider)`
  & .SnackbarItem-message {
    word-break: break-all;
  }
`;

StyledSnackbarProvider.displayName = 'StyledSnackbarProvider';

//*****************************************************************************************
// AppSnackbarProvider
//*****************************************************************************************

export const AppSnackbarProvider = memo(({ children }: PropsWithChildren) => {
  const dense = useAppPreferenceStore(s => s.snackbar.dense);
  const maxSnack = useAppPreferenceStore(s => s.snackbar.maxSnack);

  return (
    <StyledSnackbarProvider maxSnack={maxSnack} dense={dense}>
      {children}
    </StyledSnackbarProvider>
  );
});

AppSnackbarProvider.displayName = 'AppSnackbarProvider';
