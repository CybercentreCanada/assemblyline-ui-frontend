import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Checkbox, FormControlLabel, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Environment } from '../admin/service_detail';
import ResetButton from '../admin/service_detail/reset_button';

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

const DEFAULT_HEADER: Environment = {
  name: '',
  value: ''
};

const WrappedSourceDetail = ({
  source,
  defaults,
  setSource,
  addMode = false,
  setModified = null,
  showDetails = true
}) => {
  const { t, i18n } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [tempHeader, setTempHeader] = useState({ ...DEFAULT_HEADER });
  const classes = useStyles();

  const handleURIChange = event => {
    setSource({ ...source, uri: event.target.value });
    setModified(true);
  };

  const handleBranchChange = event => {
    setSource({ ...source, git_branch: event.target.value });
    setModified(true);
  };

  const handleProxyChange = event => {
    setSource({ ...source, proxy: event.target.value });
    setModified(true);
  };

  const handleNameChange = event => {
    setSource({ ...source, name: event.target.value });
    setModified(true);
  };

  const handlePasswordChange = event => {
    setSource({ ...source, password: event.target.value });
    setModified(true);
  };

  const handlePatternChange = event => {
    setSource({ ...source, pattern: event.target.value });
    setModified(true);
  };

  const handleCAChange = event => {
    setSource({ ...source, ca_cert: event.target.value });
    setModified(true);
  };

  const handlePrivateKeyChange = event => {
    setSource({ ...source, private_key: event.target.value });
    setModified(true);
  };

  const handleUsernameChange = event => {
    setSource({ ...source, username: event.target.value });
    setModified(true);
  };

  const handleSSLChange = event => {
    setSource({ ...source, ssl_ignore_errors: event.target.checked });
    setModified(true);
  };

  const handleSyncChange = event => {
    setSource({ ...source, sync: event.target.checked });
    setModified(true);
  };

  const handleClassificationChange = c12n => {
    setSource({ ...source, default_classification: c12n });
    setModified(true);
  };

  const handleTempHeaderName = event => {
    setTempHeader({ ...tempHeader, name: event.target.value });
  };

  const handleTempHeaderValue = event => {
    setTempHeader({ ...tempHeader, value: event.target.value });
  };

  const handleHeaderValueChange = (event, id) => {
    const newHeaders = [...source.headers];
    newHeaders[id] = { ...newHeaders[id], value: event.target.value };
    setSource({ ...source, headers: newHeaders });
    setModified(true);
  };

  const addHeader = () => {
    const newHeaders = [...source.headers];
    newHeaders.push(tempHeader);
    setSource({ ...source, headers: newHeaders });
    setTempHeader({ ...DEFAULT_HEADER });
    setModified(true);
  };

  const removeHeader = id => {
    const newHeaders = [...source.headers];
    newHeaders.splice(id, 1);
    setSource({ ...source, headers: newHeaders });
    setModified(true);
  };

  return (
    source && (
      <Grid container spacing={1}>
        <Grid item xs={12} sm={9}>
          <div className={classes.label}>
            {t('uri')}
            <ResetButton
              service={source}
              defaults={defaults}
              field="uri"
              reset={() => {
                setSource({ ...source, uri: defaults.uri });
                setModified(true);
              }}
            />
          </div>
          <TextField size="small" value={source.uri} fullWidth variant="outlined" onChange={handleURIChange} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <div className={classes.label}>{t('git_branch')}</div>
          <TextField
            size="small"
            value={source.git_branch}
            fullWidth
            variant="outlined"
            onChange={handleBranchChange}
          />
        </Grid>
        {c12nDef.enforce && (
          <Grid item xs={12}>
            <div className={classes.label}>
              {t('classification')}
              <ResetButton
                service={source}
                defaults={defaults}
                field="default_classification"
                reset={() => {
                  setSource({ ...source, default_classification: defaults.default_classification });
                  setModified(true);
                }}
              />
            </div>
            <Classification
              c12n={source.default_classification}
              type="picker"
              setClassification={handleClassificationChange}
            />
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <div>
            <div className={classes.label}>{t('name')}</div>
            <TextField
              disabled={!addMode}
              size="small"
              value={source.name}
              fullWidth
              variant="outlined"
              onChange={handleNameChange}
            />
          </div>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <div className={classes.label}>
              {t('pattern')}
              <ResetButton
                service={source}
                defaults={defaults}
                field="pattern"
                reset={() => {
                  setSource({ ...source, pattern: defaults.pattern });
                  setModified(true);
                }}
              />
            </div>
            <TextField
              size="small"
              value={source.pattern}
              fullWidth
              variant="outlined"
              onChange={handlePatternChange}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div>
            <div className={classes.label}>
              {t('username')}
              <ResetButton
                service={source}
                defaults={defaults}
                field="username"
                reset={() => {
                  setSource({ ...source, username: defaults.username });
                  setModified(true);
                }}
              />
            </div>
            <TextField
              size="small"
              value={source.username}
              fullWidth
              variant="outlined"
              onChange={handleUsernameChange}
            />
          </div>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <div className={classes.label}>
              {t('password')}
              <ResetButton
                service={source}
                defaults={defaults}
                field="password"
                reset={() => {
                  setSource({ ...source, password: defaults.password });
                  setModified(true);
                }}
              />
            </div>
            <TextField
              size="small"
              value={source.password}
              fullWidth
              variant="outlined"
              onChange={handlePasswordChange}
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.label}>
            {t('private_key')}
            <ResetButton
              service={source}
              defaults={defaults}
              field="private_key"
              reset={() => {
                setSource({ ...source, private_key: defaults.private_key });
                setModified(true);
              }}
            />
          </div>
          <TextField
            size="small"
            value={source.private_key}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            InputProps={{ style: { fontFamily: 'monospace' } }}
            onChange={handlePrivateKeyChange}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.label}>{t('headers')}</div>
        </Grid>
        {source.headers.map((header, id) => (
          <Grid key={id} item xs={12}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={10} md={3}>
                <div className={classes.label}>{header.name}</div>
              </Grid>
              <Grid item xs={10} md={8}>
                <TextField
                  size="small"
                  value={header.value}
                  fullWidth
                  variant="outlined"
                  onChange={event => handleHeaderValueChange(event, id)}
                />
              </Grid>
              <Grid item xs={2} md={1} style={{ textAlign: 'end' }}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
                    margin: '-4px 0'
                  }}
                  onClick={() => {
                    removeHeader(id);
                  }}
                  size="large"
                >
                  <RemoveCircleOutlineOutlinedIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={10} md={3}>
              <TextField
                size="small"
                value={tempHeader.name}
                fullWidth
                placeholder={t('headers.name')}
                variant="outlined"
                onChange={handleTempHeaderName}
              />
            </Grid>
            <Grid item xs={10} md={8}>
              <TextField
                size="small"
                value={tempHeader.value}
                fullWidth
                placeholder={t('headers.value')}
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
                      : theme.palette.mode === 'dark'
                      ? theme.palette.success.light
                      : theme.palette.success.dark,
                  margin: '-4px 0'
                }}
                disabled={!tempHeader.name || !tempHeader.value}
                onClick={() => {
                  addHeader();
                }}
                size="large"
              >
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.label}>
            {t('proxy')}
            <ResetButton
              service={source}
              defaults={defaults}
              field="proxy"
              reset={() => {
                setSource({ ...source, proxy: defaults.proxy });
                setModified(true);
              }}
            />
          </div>
          <TextField
            size="small"
            value={source.proxy}
            placeholder={t('proxy.placeholder')}
            fullWidth
            variant="outlined"
            onChange={handleProxyChange}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.label}>
            {t('ca')}
            <ResetButton
              service={source}
              defaults={defaults}
              field="ca_cert"
              reset={() => {
                setSource({ ...source, ca_cert: defaults.ca_cert });
                setModified(true);
              }}
            />
          </div>
          <TextField
            size="small"
            value={source.ca_cert}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            InputProps={{ style: { fontFamily: 'monospace' } }}
            onChange={handleCAChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox size="small" checked={source.ssl_ignore_errors} name="label" onChange={handleSSLChange} />
            }
            label={
              <Typography variant="body2">
                {t('ignore_ssl')}
                <ResetButton
                  service={source}
                  defaults={defaults}
                  field="ssl_ignore_errors"
                  reset={() => {
                    setSource({ ...source, ssl_ignore_errors: defaults.ssl_ignore_errors });
                    setModified(true);
                  }}
                />
              </Typography>
            }
            className={classes.checkbox}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={<Checkbox size="small" checked={source.sync} name="label" onChange={handleSyncChange} />}
            label={
              <Typography variant="body2">
                {t('sync')}
                <ResetButton
                  service={source}
                  defaults={defaults}
                  field="sync"
                  reset={() => {
                    setSource({ ...source, sync: defaults.sync });
                    setModified(true);
                  }}
                />
              </Typography>
            }
            className={classes.checkbox}
          />
        </Grid>
        {showDetails && (
          <div style={{ textAlign: 'center', paddingTop: theme.spacing(3), flexGrow: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {`${t('update.label.last_successful')}: `}
              <Moment fromNow locale={i18n.language}>
                {source.status.last_successful_update}
              </Moment>
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {`${t('update.label.status')}: ${source.status.message}`}
            </Typography>
          </div>
        )}
      </Grid>
    )
  );
};

export const SourceDetail = React.memo(WrappedSourceDetail);
