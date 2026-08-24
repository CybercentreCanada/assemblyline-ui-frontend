import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack
} from '@mui/material';
import React from 'react';

export type ConfirmationDialogProps = {
  open: boolean;
  handleClose: (event?: any) => void;
  handleAccept: (event?: any) => void;
  title: string;
  cancelText: string;
  acceptText: string;
  waiting?: boolean;
  waitingCancel?: boolean;
  unacceptable?: boolean;
  text?: string | React.ReactNode;
  children?: React.ReactNode;
  handleCancel?: (event?: any) => void;
};

const ConfirmationDialog = ({
  open,
  handleClose,
  handleAccept,
  title,
  cancelText,
  acceptText,
  waiting = false,
  waitingCancel = false,
  unacceptable = false,
  text = null,
  children = null,
  handleCancel = null
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
        <Stack spacing={2}>
          {text && <DialogContentText id="alert-dialog-description">{text}</DialogContentText>}
          {children}
        </Stack>
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
);

export default ConfirmationDialog;
