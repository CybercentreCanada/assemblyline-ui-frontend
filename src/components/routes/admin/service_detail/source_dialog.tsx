import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { SourceDetail } from 'components/routes/manage/signature_sources_details';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Source } from '../service_detail';

const DEFAULT_SOURCE: Source = {
  ca_cert: '',
  default_classification: '',
  headers: [],
  name: '',
  password: '',
  pattern: '',
  private_key: '',
  proxy: '',
  ssl_ignore_errors: false,
  uri: '',
  username: '',
  git_branch: '',
  status: {
    last_successful_update: '',
    message: '',
    state: '',
    ts: ''
  }
};

type SourceDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  source?: Source;
  defaults?: Source;
  onSave: (newSource: Source) => void;
};

const WrappedSourceDialog = ({ open, setOpen, source, defaults, onSave }: SourceDialogProps) => {
  const { t } = useTranslation(['adminServices']);
  const [modified, setModified] = useState(false);
  const { c12nDef } = useALContext();
  const [tempSource, setTempSource] = useState(null);
  const theme = useTheme();

  const handleSave = () => {
    setModified(false);
    setOpen(false);
    onSave(tempSource);
    if (!source) setTempSource(DEFAULT_SOURCE);
  };

  const handleClose = () => {
    setOpen(false);
    setModified(false);
    setTempSource(source || DEFAULT_SOURCE);
  };

  useEffect(() => {
    if (source) {
      setTempSource({ ...DEFAULT_SOURCE, default_classification: c12nDef.UNRESTRICTED, ...source });
    } else {
      setTempSource({ ...DEFAULT_SOURCE, default_classification: c12nDef.UNRESTRICTED });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  return (
    tempSource && (
      <div style={{ paddingTop: theme.spacing(1) }}>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
          <DialogTitle id="form-dialog-title">{t('updater.dialog.title')}</DialogTitle>
          <DialogContent>
            <SourceDetail
              source={tempSource}
              addMode={!source}
              defaults={defaults}
              setSource={setTempSource}
              setModified={setModified}
              showDetails={false}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              {t('updater.dialog.cancelText')}
            </Button>
            <Button
              onClick={handleSave}
              color="primary"
              disabled={!modified || tempSource.name === '' || tempSource.uri === ''}
            >
              {t('updater.dialog.acceptText')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  );
};

WrappedSourceDialog.defaultProps = {
  source: null
};

const SourceDialog = React.memo(WrappedSourceDialog);
export default SourceDialog;
