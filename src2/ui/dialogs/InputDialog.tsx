import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// InputDialog
//*****************************************************************************************

/** Props for InputDialog. */
export type InputDialogProps = {
  /** Text for the accept button. */
  acceptText: string;
  /** Text for the cancel button. */
  cancelText: string;
  /** Optional extra content. */
  extra?: ReactNode;
  /** Callback fired on accept. */
  handleAccept: (event?: MouseEvent<HTMLButtonElement>) => void;
  /** Callback to close the dialog. */
  handleClose: (event?: MouseEvent<HTMLButtonElement>) => void;
  /** Input change handler. */
  handleInputChange: (event?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Label for the input field. */
  inputLabel?: string;
  /** Current input value. */
  inputValue: string;
  /** Whether the dialog is open. */
  open: boolean;
  /** Whether label renders outside the field. */
  outLabel?: boolean;
  /** Optional text content. */
  text?: string | ReactNode;
  /** Dialog title. */
  title: string;
  /** Whether accept is in progress. */
  waiting?: boolean;
};

export const InputDialog = memo(
  ({
    acceptText,
    cancelText,
    extra = null,
    handleAccept,
    handleClose,
    handleInputChange,
    inputLabel = null,
    inputValue,
    open,
    outLabel = false,
    text = null,
    title,
    waiting = false
  }: InputDialogProps) => (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      {text && (
        <DialogContent sx={{ padding: '10px 24px 10px 24px' }}>
          <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
        </DialogContent>
      )}
      {extra && <DialogContent sx={{ padding: '10px 24px 10px 24px' }}>{extra}</DialogContent>}
      <DialogContent sx={{ padding: '10px 24px 20px 24px' }}>
        {outLabel && inputLabel && <Typography variant="overline">{inputLabel}</Typography>}
        <TextField
          autoFocus
          label={outLabel ? null : inputLabel}
          size="small"
          variant="outlined"
          fullWidth
          onChange={handleInputChange}
          value={inputValue}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {cancelText}
        </Button>
        <Button onClick={handleAccept} color="primary" disabled={!inputValue || waiting}>
          {acceptText}
          {waiting && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
        </Button>
      </DialogActions>
    </Dialog>
  )
);

InputDialog.displayName = 'InputDialog';
