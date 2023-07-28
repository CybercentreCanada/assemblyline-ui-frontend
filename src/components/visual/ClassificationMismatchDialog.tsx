import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import Classification from './Classification';

export type ClassificationMismatchDialogProps = {
  open: boolean;
  handleClose: (event?: any) => void;
  handleAccept: (event?: any) => void;
  title: string;
  cancelText: string;
  acceptText: string;
  dataClassification: string;
  targetClassification: string;
  waiting?: boolean;
  text?: string | React.ReactNode;
  handleCancel?: (event?: any) => void;
};

const ClassificationMismatchDialog = ({
  open,
  handleClose,
  handleAccept,
  title,
  cancelText,
  acceptText,
  dataClassification,
  targetClassification,
  waiting = false,
  text = null,
  handleCancel = null
}: ClassificationMismatchDialogProps) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      <div>{title}</div>
    </DialogTitle>
    {text && (
      <DialogContent>
        <DialogContentText style={{ textAlign: 'center', paddingBottom: '12px' }}>
          <Classification c12n={dataClassification} type={'text'} />
          {' > '}
          <Classification c12n={targetClassification} type={'text'} />
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={handleCancel || handleClose} color="secondary">
        {cancelText}
      </Button>
      <Button onClick={handleAccept} color="primary" autoFocus disabled={waiting}>
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

export default ClassificationMismatchDialog;
