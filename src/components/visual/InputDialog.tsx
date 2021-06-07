import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@material-ui/core';

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
  text = null
}) => (
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
      <Button onClick={handleAccept} color="primary" disabled={!inputValue}>
        {acceptText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default InputDialog;
