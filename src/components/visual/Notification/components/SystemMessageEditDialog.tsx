import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, useNotificationDispatch } from '..';

type Props = {
  store: Store;
  alContext: CustomUserContextProps;
};

export const WrappedSystemMessageEditDialog: React.FC<Props> = ({ store, alContext }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation('notification');
  const { setStoreRef } = useNotificationDispatch();

  const handleSeverityChange = React.useCallback(
    event => {
      if (!['info', 'warning', 'error', 'success'].includes(event.target.value)) return;
      else setStoreRef.current(s => ({ ...s, systemMessage: { ...s.systemMessage, severity: event.target.value } }));
    },
    [setStoreRef]
  );

  return (
    <Dialog
      fullWidth
      open={store.open.editDialog}
      onClose={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, editDialog: false } }))}
      aria-labelledby="na-dialog-title"
      aria-describedby="na-dialog-description"
    >
      <DialogTitle id="na-dialog-title">{t('edit.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="na-dialog-description">{t('edit.text')}</DialogContentText>
      </DialogContent>
      <DialogContent>
        <Typography variant="subtitle2">{t('edit.severity')}</Typography>
        <Select
          fullWidth
          id="na-severity"
          value={store.systemMessage.severity}
          onChange={handleSeverityChange}
          variant="outlined"
          margin="dense"
          style={{ marginBottom: theme.spacing(2) }}
        >
          <MenuItem value="info">{t('severity.info')}</MenuItem>
          <MenuItem value="warning">{t('severity.warning')}</MenuItem>
          <MenuItem value="success">{t('severity.success')}</MenuItem>
          <MenuItem value="error">{t('severity.error')}</MenuItem>
        </Select>
        <Typography variant="subtitle2">{t('edit.message.title')}</Typography>
        <TextField
          autoFocus
          size="small"
          variant="outlined"
          fullWidth
          value={store.systemMessage.title}
          onChange={event =>
            setStoreRef.current(s => ({ ...s, systemMessage: { ...s.systemMessage, title: event.target.value } }))
          }
          style={{ marginBottom: theme.spacing(2) }}
        />
        <Typography variant="subtitle2">{t('edit.message')}</Typography>
        <TextField
          size="small"
          variant="outlined"
          multiline
          fullWidth
          rows={4}
          value={store.systemMessage.message}
          onChange={event =>
            setStoreRef.current(s => ({ ...s, systemMessage: { ...s.systemMessage, message: event.target.value } }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, editDialog: false } }))}
          color="secondary"
        >
          {t('edit.button.cancel')}
        </Button>
        <Button
          onClick={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, saveConfirmation: true } }))}
          color="primary"
          disabled={!store.systemMessage.message}
        >
          {t('edit.button.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SystemMessageEditDialog = React.memo(WrappedSystemMessageEditDialog);
export default SystemMessageEditDialog;
