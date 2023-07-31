import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Classification from './Classification';

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
          <Classification c12n={dataClassification} type={'text'} />
          {' > '}
          <Classification c12n={targetClassification} type={'text'} />
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
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClassificationMismatchDialog;
