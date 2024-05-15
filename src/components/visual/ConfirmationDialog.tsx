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

export type ConfirmationDialogProps = {
  open: boolean;
  handleClose: (event?: any) => void;
  handleAccept: (event?: any) => void;
  title: string;
  cancelText: string;
  acceptText: string;
  waiting?: boolean;
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
    {text && (
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText id="alert-dialog-description" component="div">
            {text}
          </DialogContentText>
          {children}
        </Stack>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={handleCancel || handleClose} color="secondary">
        {cancelText}
      </Button>
      <Button onClick={handleAccept} color="primary" autoFocus disabled={waiting || unacceptable}>
        {acceptText}
        {waiting && (
          <CircularProgress
            size={24}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -12,
              marginLeft: -12
            }}
          />
        )}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
