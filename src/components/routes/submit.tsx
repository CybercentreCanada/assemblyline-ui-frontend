import Flow from '@flowjs/flow.js';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Alert, Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ServiceSpec from 'components/layout/serviceSpec';
import ServiceTree from 'components/layout/serviceTree';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Empty from 'components/visual/Empty';
import FileDropper from 'components/visual/FileDropper';
import generateUUID from 'helpers/uuid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';


function Submit() {
  const { getBanner } = useAppLayout();
  const { apiCall } = useMyAPI();
  const { t, i18n } = useTranslation(['submit']);
  const theme = useTheme();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const [uuid, setUUID] = useState(null);
  const [flow, setFlow] = useState(null);
  const [settings, setSettings] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [url, setUrl] = useState('');
  const [urlHasError, setUrlHasError] = useState(false);
  const [hashHasError, setHashHasError] = useState(false);
  const [validate, setValidate] = useState(false);
  const [validateCB, setValidateCB] = useState(null);
  const [allowClick, setAllowClick] = useState(true);
  const [file, setFile] = useState(null);
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();
  const history = useHistory();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const state = history.location.state;
  const [hash, setHash] = useState((state !== undefined) ? state['hash'] : "");
  const [value, setValue] = useState((state !== undefined) ? state['tabContext'] : "0");
  const classification = useState((state !== undefined) ? state['c12n'] : null)[0];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    },
    item: {
      marginLeft: 0,
      width: '100%',
      '&:hover': {
        background: theme.palette.action.hover
      }
    }
  }));
  const classes = useStyles();

  const getFileUUID = selectedFile => {
    const relativePath =
      selectedFile.relativePath || selectedFile.webkitRelativePath || selectedFile.fileName || selectedFile.name;
    return `${uuid}_${file.size}_${relativePath.replace(/[^0-9a-zA-Z_-]/gim, '')}`;
  };

  const cancelUpload = () => {
    setFile(null);
    setAllowClick(true);
    setUploadProgress(null);
    flow.cancel();
    flow.off('complete');
    flow.off('fileError');
    flow.off('progress');
    setUUID(generateUUID());
  };

  const validateServiceSelection = cbType => {
    let showPopup = false;

    // Check if we need the popup, and if we do
    settings.services.forEach(cat => {
      cat.services.forEach(srv => {
        if (srv.selected && srv.is_external) {
          showPopup = true;
        }
      });
    });

    if (showPopup) {
      // External service selected, show popup
      setValidateCB(cbType);
      setValidate(true);
    } else if (cbType === 'file') {
      // No external service and file submitted
      uploadAndScan();
    } else if (cbType === 'sha256') {
      analyseHash();
    } else {
      // No external service and url submitted
      analyseUrl();
    }
  };

  const cleanupServiceSelection = () => {
    // eslint-disable-next-line guard-for-in
    for (const i in settings.services) {
      const cat = settings.services[i];
      // eslint-disable-next-line guard-for-in
      for (const j in settings.services[i].services) {
        const srv = settings.services[i].services[j];
        if (srv.selected && srv.is_external) {
          srv.selected = false;
        }
      }
      cat.selected = cat.services.every(e => e.selected);
    }

    executeCB();
  };

  const executeCB = () => {
    setValidate(false);
    if (validateCB === 'file') {
      uploadAndScan();
    } else {
      analyseUrl();
    }
  };

  const uploadAndScan = () => {
    flow.opts.generateUniqueIdentifier = getFileUUID;
    setAllowClick(false);
    setUploadProgress(0);
    flow.on('fileError', (event, api_data) => {
      try {
        const data = JSON.parse(api_data);
        if (Object.hasOwnProperty.call(data, 'api_status_code')) {
          if (data.api_status_code === 401) {
            window.location.reload();
          }
        }
      } catch (ex) {
        cancelUpload();
        showErrorMessage(t('submit.file.upload_fail'));
      }
    });
    flow.on('progress', () => {
      setUploadProgress(Math.trunc(flow.progress() * 100));
    });
    flow.on('complete', () => {
      if (flow.files.length === 0) {
        return;
      }

      for (let x = 0; x < flow.files.length; x++) {
        if (flow.files[x].error) {
          return;
        }
      }
      apiCall({
        url: `/api/v4/ui/start/${uuid}/`,
        method: 'POST',
        body: { ...settings, filename: file.path },
        onSuccess: api_data => {
          showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
          setTimeout(() => {
            history.push(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        },
        onFailure: api_data => {
          if (
            api_data.api_status_code === 503 ||
            api_data.api_status_code === 403 ||
            api_data.api_status_code === 404 ||
            api_data.api_status_code === 400
          ) {
            showErrorMessage(api_data.api_error_message);
          } else {
            showErrorMessage(t('submit.file.failure'));
          }
          setAllowClick(true);
          cancelUpload();
        }
      });
    });

    flow.addFile(file);
    flow.upload();
  };

  const isSelected = service_name => {
    let selected = false;
    settings.services.forEach(cat => {
      cat.services.forEach(srv => {
        if (srv.name === service_name) {
          selected = srv.selected;
        }
      });
    });
    return selected;
  };

  const anySelected = () => {
    const serviceList = settings.service_spec.map(srv => srv.name);
    return serviceList.some(isSelected);
  };

  const setFileDropperFile = selectedFile => {
    setFile(selectedFile);
  };

  const setParam = (service_idx, param_idx, p_value) => {
    if (settings) {
      const newSettings = { ...settings };
      newSettings.service_spec[service_idx].params[param_idx].value = p_value;
      setSettings(newSettings);
    }
  };

  function setParamAsync(service_idx, param_idx, p_value) {
    if (settings) {
      settings.service_spec[service_idx].params[param_idx].value = p_value;
    }
  }

  function setSettingValue(field, fieldValue) {
    if (settings) {
      setSettings({ ...settings, [field]: fieldValue });
    }
  }

  function setSettingAsyncValue(field, fieldValue) {
    if (settings) {
      settings[field] = fieldValue;
    }
  }

  function setClassification(c12n) {
    if (settings) {
      setSettings({ ...settings, classification: c12n });
    }
  }

  function handleHashChange(event) {
    closeSnackbar();
    setHashHasError(false);
    setHash(event.target.value);
  }

  function handleUrlChange(event) {
    closeSnackbar();
    setUrlHasError(false);
    setUrl(event.target.value);
  }

  function analyseHash() {
    // Validation might not be necessary since the API will check if the hash exists
    // const sha256ParseRE = /^[a-f0-9]{64}$/;
    // const matches = sha256ParseRE.exec(hash)

    const data = {
      name: hash,
      sha256: hash,
      ui_params: settings
    };

    setHashHasError(false);
    apiCall({
      url: '/api/v4/submit/',
      method: 'POST',
      body: data,
      onSuccess: api_data => {
        setAllowClick(false);
        showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
        setTimeout(() => {
          history.push(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      },
      onFailure: api_data => {
        showErrorMessage(t('submit.hash.failure'));
        setHashHasError(true);
      }
    });
  }

  function analyseUrl() {
    const urlParseRE =
      /^(((([^:/#?]+:)?(?:(\/\/)((?:(([^:@/#?]+)(?::([^:@/#?]+))?)@)?(([^:/#?\][]+|\[[^/\]@#?]+])(?::([0-9]+))?))?)?)?((\/?(?:[^/?#]+\/+)*)([^?#]*)))?(\?[^#]+)?)(#.*)?/;
    const matches = urlParseRE.exec(url);

    if (matches[15] === undefined || matches[15] === '') {
      matches[15] = 'file';
    }

    const data = {
      name: matches[15],
      url,
      ui_params: settings
    };

    setUrlHasError(false);
    apiCall({
      url: '/api/v4/submit/',
      method: 'POST',
      body: data,
      onSuccess: api_data => {
        setAllowClick(false);
        showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
        setTimeout(() => {
          history.push(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      },
      onFailure: api_data => {
        showErrorMessage(t('submit.url.failure'));
        setUrlHasError(true);
      }
    });
  }

  useEffect(() => {
    // Setup Flow
    setFlow(
      new Flow({
        target: '/api/v4/ui/flowjs/',
        permanentErrors: [412, 500, 501],
        maxChunkRetries: 1,
        chunkRetryInterval: 500,
        simultaneousUploads: 4
      })
    );

    // Load user on start
    apiCall({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: api_data => {
        setSettings(api_data.api_response);
      }
    });
    setUUID(generateUUID());
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <ConfirmationDialog
        open={validate}
        handleClose={cleanupServiceSelection}
        handleAccept={executeCB}
        title={t('validate.title')}
        cancelText={t('validate.cancelText')}
        acceptText={t('validate.acceptText')}
        text={t('validate.text')}
      />
      <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{getBanner(theme)}</div>
      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}
      {c12nDef.enforce ? (
        <div style={{ paddingBottom: sp4 }}>
          <div style={{ padding: sp1, fontSize: 16 }}>{t('classification')}</div>
          <Classification
            format="long"
            type="picker"
            c12n={classification ? classification : settings ? settings.classification : null}
            setClassification={setClassification}
          />
        </div>
      ) : null}
      <TabContext value={value}>
        <Paper square>
          <TabList centered onChange={handleChange} indicatorColor="primary" textColor="primary">
            <Tab label={t('file')} value="0" />
            {configuration.ui.allow_url_submissions ? (
              <Tab label={t('url')} value="1" disabled={!configuration.ui.allow_url_submissions} />
            ) : (
              <Empty />
            )}
            <Tab label="SHA256" value="2" />
            <Tab label={t('options')} value="3" />
          </TabList>
        </Paper>
        <TabPanel value="0" className={classes.no_pad}>
          {settings ? (
            <div style={{ marginTop: sp2 }}>
              <FileDropper file={file} setFile={setFileDropperFile} disabled={!allowClick} />
              {file ? (
                <>
                  {configuration.ui.allow_malicious_hinting ? (
                    <div style={{ padding: sp1 }}>
                      <Tooltip title={t('malicious.tooltip')}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings ? settings.malicious : true}
                              disabled={settings === null}
                              onChange={() => setSettingValue('malicious', !settings.malicious)}
                              color="secondary"
                              name="is_malware"
                            />
                          }
                          label={t('malicious')}
                        />
                      </Tooltip>
                    </div>
                  ) : (
                    <div style={{ padding: sp2 }} />
                  )}
                  <Button
                    disabled={!allowClick}
                    color="primary"
                    variant="contained"
                    onClick={() => validateServiceSelection('file')}
                  >
                    {uploadProgress === null ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
                  </Button>
                  <Button style={{ marginLeft: sp2 }} color="secondary" variant="contained" onClick={cancelUpload}>
                    {t('file.cancel')}
                  </Button>
                </>
              ) : null}
            </div>
          ) : (
            <Skeleton style={{ height: '280px' }} />
          )}
          {configuration.ui.tos ? (
            <div style={{ marginTop: sp4, textAlign: 'center' }}>
              <Typography variant="body2">
                {t('terms1')}
                <i>{t('file.button')}</i>
                {t('terms2')}
                <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                  {t('terms3')}
                </Link>
                .
              </Typography>
            </div>
          ) : null}
        </TabPanel>
        {configuration.ui.allow_url_submissions && (
          <TabPanel value="1" className={classes.no_pad}>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: sp2, alignItems: 'flex-start' }}>
              {settings ? (
                <>
                  <TextField
                    label={t('url.input')}
                    error={urlHasError}
                    size="small"
                    type="url"
                    variant="outlined"
                    value={url}
                    onChange={handleUrlChange}
                    style={{ flexGrow: 1, marginRight: '1rem' }}
                  />
                  <Button
                    disabled={!url || !allowClick}
                    color="primary"
                    variant="contained"
                    onClick={() => validateServiceSelection('url')}
                  >
                    {t('url.button')}
                  </Button>
                </>
              ) : (
                <>
                  <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
                  <Skeleton style={{ marginLeft: sp2, height: '3rem', width: '5rem' }} />
                </>
              )}
            </div>
            {configuration.ui.tos ? (
              <div style={{ marginTop: sp4, textAlign: 'center' }}>
                <Typography variant="body2">
                  {t('terms1')}
                  <i>{t('url.button')}</i>
                  {t('terms2')}
                  <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                    {t('terms3')}
                  </Link>
                  .
                </Typography>
              </div>
            ) : null}
          </TabPanel>
        )}
        <TabPanel value="2" className={classes.no_pad}>
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: sp2, alignItems: 'flex-start' }}>
            {settings ? (
              <>
                <TextField
                  label={t('hash.input')}
                  error={hashHasError}
                  size="small"
                  type="hash"
                  variant="outlined"
                  value={hash}
                  onChange={handleHashChange}
                  style={{ flexGrow: 1, marginRight: '1rem' }}
                />
                <Button
                  disabled={!hash || !allowClick}
                  color="primary"
                  variant="contained"
                  onClick={() => validateServiceSelection('sha256')}
                >
                  {t('hash.button')}
                </Button>
              </>
            ) : (
              <>
                <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
                <Skeleton style={{ marginLeft: sp2, height: '3rem', width: '5rem' }} />
              </>
            )}
          </div>
          {configuration.ui.tos ? (
            <div style={{ marginTop: sp4, textAlign: 'center' }}>
              <Typography variant="body2">
                {t('terms1')}
                <i>{t('hash.button')}</i>
                {t('terms2')}
                <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                  {t('terms3')}
                </Link>
                .
              </Typography>
            </div>
          ) : null}
        </TabPanel>
        <TabPanel value="3" className={classes.no_pad}>
          <Grid container spacing={1}>
            <Grid item xs={12} md>
              <div style={{ paddingLeft: sp2, textAlign: 'left', marginTop: sp2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('options.service')}
                </Typography>
                <ServiceTree size="small" settings={settings} setSettings={setSettings} />
              </div>
            </Grid>
            <Grid item xs={12} md>
              <div style={{ textAlign: 'left', marginTop: sp2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('options.submission')}
                </Typography>
                <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    {t('options.submission.desc')}
                  </Typography>
                  {settings ? (
                    <TextField
                      id="desc"
                      size="small"
                      type="text"
                      defaultValue={settings.description}
                      onChange={event => setSettingAsyncValue('description', event.target.value)}
                      InputLabelProps={{
                        shrink: true
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  ) : (
                    <Skeleton style={{ height: '3rem' }} />
                  )}
                </div>
                <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    {t('options.submission.priority')}
                  </Typography>
                  {settings ? (
                    <Select
                      id="priority"
                      margin="dense"
                      value={settings.priority}
                      variant="outlined"
                      onChange={event => setSettingValue('priority', event.target.value)}
                      fullWidth
                    >
                      <MenuItem value="500">{t('options.submission.priority.low')}</MenuItem>
                      <MenuItem value="1000">{t('options.submission.priority.medium')}</MenuItem>
                      <MenuItem value="1500">{t('options.submission.priority.high')}</MenuItem>
                    </Select>
                  ) : (
                    <Skeleton style={{ height: '3rem' }} />
                  )}
                </div>
                <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                  <FormControlLabel
                    control={
                      settings ? (
                        <Checkbox
                          size="small"
                          checked={settings.ignore_filtering}
                          name="label"
                          onChange={event => setSettingValue('ignore_filtering', event.target.checked)}
                        />
                      ) : (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      )
                    }
                    label={<Typography variant="body2">{t('options.submission.ignore_filtering')}</Typography>}
                    className={settings ? classes.item : null}
                  />
                  <FormControlLabel
                    control={
                      settings ? (
                        <Checkbox
                          size="small"
                          checked={settings.ignore_cache}
                          name="label"
                          onChange={event => setSettingValue('ignore_cache', event.target.checked)}
                        />
                      ) : (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      )
                    }
                    label={<Typography variant="body2">{t('options.submission.ignore_cache')}</Typography>}
                    className={settings ? classes.item : null}
                  />
                  <FormControlLabel
                    control={
                      settings ? (
                        <Checkbox
                          size="small"
                          checked={settings.ignore_dynamic_recursion_prevention}
                          name="label"
                          onChange={event =>
                            setSettingValue('ignore_dynamic_recursion_prevention', event.target.checked)
                          }
                        />
                      ) : (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      )
                    }
                    label={
                      <Typography variant="body2">
                        {t('options.submission.ignore_dynamic_recursion_prevention')}
                      </Typography>
                    }
                    className={settings ? classes.item : null}
                  />
                  <FormControlLabel
                    control={
                      settings ? (
                        <Checkbox
                          size="small"
                          checked={settings.profile}
                          name="label"
                          onChange={event => setSettingValue('profile', event.target.checked)}
                        />
                      ) : (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      )
                    }
                    label={<Typography variant="body2">{t('options.submission.profile')}</Typography>}
                    className={settings ? classes.item : null}
                  />
                  <FormControlLabel
                    control={
                      settings ? (
                        <Checkbox
                          size="small"
                          checked={settings.deep_scan}
                          name="label"
                          onChange={event => setSettingValue('deep_scan', event.target.checked)}
                        />
                      ) : (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      )
                    }
                    label={<Typography variant="body2">{t('options.submission.deep_scan')}</Typography>}
                    className={settings ? classes.item : null}
                  />
                </div>
                <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    {`${t('options.submission.ttl')} (${
                      configuration.submission.max_dtl !== 0
                        ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                        : t('options.submission.ttl.forever')
                    })`}
                  </Typography>
                  {settings ? (
                    <TextField
                      id="ttl"
                      size="small"
                      type="number"
                      inputProps={{
                        min: configuration.submission.max_dtl !== 0 ? 1 : 0,
                        max: configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365
                      }}
                      defaultValue={settings.ttl}
                      onChange={event => setSettingAsyncValue('ttl', event.target.value)}
                      variant="outlined"
                      fullWidth
                    />
                  ) : (
                    <Skeleton style={{ height: '3rem' }} />
                  )}
                </div>
              </div>

              {settings && settings.service_spec.length !== 0 && anySelected() && (
                <div style={{ textAlign: 'left', marginTop: sp4 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('options.service_spec')}
                  </Typography>
                  <ServiceSpec
                    service_spec={settings.service_spec}
                    setParam={setParam}
                    setParamAsync={setParamAsync}
                    isSelected={isSelected}
                  />
                </div>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
    </PageCenter>
  );
}

export default Submit;
