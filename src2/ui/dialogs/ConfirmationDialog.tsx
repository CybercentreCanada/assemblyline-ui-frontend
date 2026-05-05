import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import type { ReactNode } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// ConfirmationDialog
//*****************************************************************************************

/** Props for ConfirmationDialog. */
export type ConfirmationDialogProps = {
  /** Text for the accept button. */
  acceptText: string;
  /** Text for the cancel button. */
  cancelText: string;
  /** Optional children rendered in the dialog content. */
  children?: ReactNode;
  /** Callback fired on accept. */
  handleAccept: () => void;
  /** Optional cancel callback (defaults to handleClose). */
  handleCancel?: () => void;
  /** Callback to close the dialog. */
  handleClose: () => void;
  /** Whether the dialog is open. */
  open: boolean;
  /** Optional text content. */
  text?: string | ReactNode;
  /** Whether the accept action is disallowed. */
  unacceptable?: boolean;
  /** Whether accept is in progress. */
  waiting?: boolean;
  /** Whether cancel is in progress. */
  waitingCancel?: boolean;
  /** Dialog title. */
  title: string;
};

export const ConfirmationDialog = memo(
  ({
    acceptText,
    cancelText,
    children = null,
    handleAccept,
    handleCancel = null,
    handleClose,
    open,
    text = null,
    title,
    unacceptable = false,
    waiting = false,
    waitingCancel = false
  }: ConfirmationDialogProps) => (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      {(text || children) && (
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {text && <DialogContentText id="alert-dialog-description">{text}</DialogContentText>}
            {children}
          </div>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={handleCancel || handleClose} color="secondary" disabled={waitingCancel || unacceptable}>
          {cancelText}
          {waitingCancel && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
        </Button>
        <Button onClick={handleAccept} color="primary" autoFocus disabled={waiting || unacceptable}>
          {acceptText}
          {waiting && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
        </Button>
      </DialogActions>
    </Dialog>
  )
);

ConfirmationDialog.displayName = 'ConfirmationDialog';
