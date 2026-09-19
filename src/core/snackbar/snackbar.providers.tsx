import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { styled } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import type { CustomContentProps, SnackbarMessage } from 'notistack';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import type { PropsWithChildren, ReactNode } from 'react';
import { Children, isValidElement, memo, useCallback } from 'react';
import { IconButton } from 'ui/buttons/IconButton';

/**
 * @name getSnackbarMessageText
 * @description Extracts readable text from a snackbar message node.
 * @param message - Snackbar message to convert to clipboard text.
 * @returns The complete readable message text.
 */
const getSnackbarMessageText = (message: SnackbarMessage): string => {
  let text = '';

  Children.forEach(message, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      text += child;
    } else if (isValidElement<{ children?: ReactNode }>(child)) {
      text += getSnackbarMessageText(child.props.children);
    }
  });

  return text;
};

//*****************************************************************************************
// Copyable Snackbar Content
//*****************************************************************************************

const CopyableSnackbarContent = memo((props: CustomContentProps) => {
  const { action, message, ...contentProps } = props;

  const handleCopy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void navigator.clipboard?.writeText(getSnackbarMessageText(message));
    },
    [message]
  );

  const existingAction: ReactNode = typeof action === 'function' ? action(props.id) : (action as ReactNode);

  return (
    <MaterialDesignContent
      {...contentProps}
      message={
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {existingAction}
          {message}
          <IconButton color="inherit" size="small" tooltip="Copy message" onClick={handleCopy}>
            <ContentCopyOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      }
    />
  );
});

CopyableSnackbarContent.displayName = 'CopyableSnackbarContent';

//*****************************************************************************************
// StyledSnackbarProvider
//*****************************************************************************************

const StyledSnackbarProvider = styled(SnackbarProvider)`
  & #notistack-snackbar {
    width: 100%;
  }
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
    <StyledSnackbarProvider
      Components={{ error: CopyableSnackbarContent, warning: CopyableSnackbarContent }}
      maxSnack={maxSnack}
      dense={dense}
    >
      {children}
    </StyledSnackbarProvider>
  );
});

AppSnackbarProvider.displayName = 'AppSnackbarProvider';
