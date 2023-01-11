import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';

export type InputDialogProps = {
  open: boolean;
  handleClose: (event?: any) => void;
  handleAccept: (event?: any) => void;
  title: string;
  cancelText: string;
  acceptText: string;
  waiting?: boolean;
  text?: string | React.ReactNode;
  handleInputChange: (event?: any) => void;
  inputValue: string;
  inputLabel?: string;
};

const InputDialog = ({
  open,
  handleClose,
  handleAccept,
  title,
  cancelText,
  acceptText,
  handleInputChange,
  inputValue,
  inputLabel = null,
  waiting = false,
  text = null
}: InputDialogProps) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    {text && (
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
      </DialogContent>
    )}
    <DialogContent>
      <TextField
        autoFocus
        label={inputLabel}
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

export default InputDialog;
