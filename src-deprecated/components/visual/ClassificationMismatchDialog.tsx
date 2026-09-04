import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import Classification from 'components/visual/Classification';
import { useTranslation } from 'react-i18next';

export type ClassificationMismatchDialogProps = {
  open: boolean;
  handleClose: (event?: any) => void;
  handleAccept: (event?: any) => void;
  dataClassification: string;
  targetClassification: string;
  waiting?: boolean;
  handleCancel?: (event?: any) => void;
};

const ClassificationMismatchDialog = ({
  open,
  handleClose,
  handleAccept,
  dataClassification,
  targetClassification,
  waiting = false,
  handleCancel = null
}: ClassificationMismatchDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <div>{t('classification.title')}</div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ textAlign: 'center', paddingBottom: '12px' }}>
          <Classification c12n={dataClassification} type="text" />
          {' > '}
          <Classification c12n={targetClassification} type="text" />
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          {t('classification.text')} {handleAccept && t('classification.text.accept')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel || handleClose} color="secondary">
          {t('classification.cancelText')}
        </Button>
        {handleAccept && (
          <Button onClick={handleAccept} color="primary" autoFocus disabled={waiting}>
            {t('classification.acceptText')}
            {waiting && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClassificationMismatchDialog;
