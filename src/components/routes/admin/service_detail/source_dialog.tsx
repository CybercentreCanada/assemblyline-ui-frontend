import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Source } from '../service_detail';

const useStyles = makeStyles(theme => ({
  checkbox: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  label: {
    fontWeight: 500
  }
}));

const DEFAULT_HEADER = {
  name: '',
  value: ''
};

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
  username: ''
};

type SourceDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  source?: Source;
  onSave: (newSource: Source) => void;
};

const WrappedSourceDialog = ({ open, setOpen, source, onSave }: SourceDialogProps) => {
  const { t } = useTranslation(['adminServices']);
  const [modified, setModified] = useState(false);
  const { c12nDef } = useALContext();
  const [tempSource, setTempSource] = useState(null);
  const [tempHeader, setTempHeader] = useState({ ...DEFAULT_HEADER });
  const theme = useTheme();
  const classes = useStyles();

  const handleSave = () => {
    setModified(false);
    setOpen(false);
    onSave(tempSource);
  };

  const handleClose = () => {
    setOpen(false);
    setModified(false);
    setTempSource(source || DEFAULT_SOURCE);
  };

  const handleValueChange = (field, value) => {
    setModified(true);
    setTempSource({ ...tempSource, [field]: value });
  };

  const toggleSSLChange = () => {
    setModified(true);
    setTempSource({ ...tempSource, ssl_ignore_errors: !tempSource.ssl_ignore_errors });
  };

  const handleTempHeaderName = event => {
    setTempHeader({ ...tempHeader, name: event.target.value });
  };
  const handleTempHeaderValue = event => {
    setTempHeader({ ...tempHeader, value: event.target.value });
  };

  const addHeader = () => {
    const newHeaders = [...tempSource.headers];
    newHeaders.push(tempHeader);
    setTempSource({ ...tempSource, headers: newHeaders });
    setTempHeader({ ...DEFAULT_HEADER });
    setModified(true);
  };
  const removeHeader = id => {
    const newHeaders = [...tempSource.headers];
    newHeaders.splice(id, 1);
    setTempSource({ ...tempSource, headers: newHeaders });
    setModified(true);
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
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <div className={classes.label}>{t('updater.dialog.uri')}</div>
                <TextField
                  size="small"
                  value={tempSource.uri}
                  fullWidth
                  variant="outlined"
                  onChange={event => handleValueChange('uri', event.target.value)}
                />
              </Grid>
              {c12nDef.enforce && (
                <Grid item xs={12}>
                  <div className={classes.label}>{t('updater.dialog.classification')}</div>
                  <Classification
                    c12n={tempSource.default_classification}
                    type="picker"
                    setClassification={value => handleValueChange('classification', value)}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <div>
                  <div className={classes.label}>{t('updater.dialog.name')}</div>
                  <TextField
                    disabled={!!source}
                    size="small"
                    value={tempSource.name}
                    fullWidth
                    variant="outlined"
                    onChange={event => handleValueChange('name', event.target.value)}
                  />
                </div>
                <div style={{ paddingTop: theme.spacing(1) }}>
                  <div className={classes.label}>{t('updater.dialog.pattern')}</div>
                  <TextField
                    size="small"
                    value={tempSource.pattern}
                    fullWidth
                    variant="outlined"
                    onChange={event => handleValueChange('pattern', event.target.value)}
                  />
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div>
                  <div className={classes.label}>{t('updater.dialog.username')}</div>
                  <TextField
                    size="small"
                    value={tempSource.username}
                    fullWidth
                    variant="outlined"
                    onChange={event => handleValueChange('username', event.target.value)}
                  />
                </div>
                <div style={{ paddingTop: theme.spacing(1) }}>
                  <div className={classes.label}>{t('updater.dialog.password')}</div>
                  <TextField
                    size="small"
                    value={tempSource.password}
                    fullWidth
                    variant="outlined"
                    onChange={event => handleValueChange('password', event.target.value)}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.label}>{t('updater.dialog.private_key')}</div>
                <TextField
                  size="small"
                  value={tempSource.private_key}
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  onChange={event => handleValueChange('private_key', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={classes.label}>{t('updater.dialog.headers')}</div>
              </Grid>
              {tempSource.headers.map((header, id) => {
                return (
                  <Grid key={id} item xs={12}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={10} md={3}>
                        <div className={classes.label}>{header.name}</div>
                      </Grid>
                      <Grid item xs={10} md={8}>
                        <TextField size="small" value={header.value} fullWidth variant="outlined" />
                      </Grid>
                      <Grid item xs={2} md={1} style={{ textAlign: 'end' }}>
                        <IconButton
                          style={{
                            color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
                            margin: '-4px 0'
                          }}
                          onClick={() => {
                            removeHeader(id);
                          }}
                        >
                          <RemoveCircleOutlineOutlinedIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={10} md={3}>
                    <TextField
                      size="small"
                      value={tempHeader.name}
                      fullWidth
                      placeholder={t('updater.dialog.headers.name')}
                      variant="outlined"
                      onChange={handleTempHeaderName}
                    />
                  </Grid>
                  <Grid item xs={10} md={8}>
                    <TextField
                      size="small"
                      value={tempHeader.value}
                      fullWidth
                      placeholder={t('updater.dialog.headers.value')}
                      variant="outlined"
                      onChange={handleTempHeaderValue}
                    />
                  </Grid>
                  <Grid item xs={2} md={1} style={{ textAlign: 'end' }}>
                    <IconButton
                      style={{
                        color:
                          !tempHeader.name || !tempHeader.value
                            ? theme.palette.action.disabled
                            : theme.palette.type === 'dark'
                            ? theme.palette.success.light
                            : theme.palette.success.dark,
                        margin: '-4px 0'
                      }}
                      disabled={!tempHeader.name || !tempHeader.value}
                      onClick={() => {
                        addHeader();
                      }}
                    >
                      <AddCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.label}>{t('updater.dialog.proxy')}</div>
                <TextField
                  size="small"
                  value={tempSource.proxy}
                  placeholder={t('updater.dialog.proxy.placeholder')}
                  fullWidth
                  variant="outlined"
                  onChange={event => handleValueChange('proxy', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={classes.label}>{t('updater.dialog.ca')}</div>
                <TextField
                  size="small"
                  value={tempSource.ca_cert}
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  onChange={event => handleValueChange('ca_cert', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={tempSource.ssl_ignore_errors}
                      name="label"
                      onChange={toggleSSLChange}
                    />
                  }
                  label={<Typography variant="body2">{t('updater.dialog.ignore_ssl')}</Typography>}
                  className={classes.checkbox}
                />
              </Grid>
            </Grid>
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
