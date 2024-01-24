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
  extra?: React.ReactNode;
  outLabel?: boolean;
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
  text = null,
  extra = null,
  outLabel = false
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
