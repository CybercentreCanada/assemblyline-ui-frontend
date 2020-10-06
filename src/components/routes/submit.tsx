import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Tab,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ServiceTree from 'components/layout/serviceTree';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import Flow from 'helpers/flow';
import generateUUID from 'helpers/uuid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

const flow = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 404, 500],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

function Submit() {
  const { getBanner } = useAppLayout();
  const apiCall = useMyAPI();
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { user: currentUser, c12nDef, configuration } = useAppContext();
  const [uuid, setUUID] = useState(null);
  const [settings, setSettings] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [url, setUrl] = useState('');
  const [urlHasError, setUrlHasError] = useState(false);
  const [allowClick, setAllowClick] = useState(true);
  const [file, setFile] = useState(null);
  const [value, setValue] = useState('0');
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();
  const history = useHistory();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const sp8 = theme.spacing(8);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    },
    item: {
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
            window.location.reload(false);
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
        body: settings,
        onSuccess: api_data => {
          showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
          setTimeout(() => {
            history.push(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        },
        onFailure: api_data => {
          showErrorMessage(t('submit.file.failure'));
          setAllowClick(true);
        }
      });
    });

    flow.addFile(file);
    flow.upload();
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

  function handleUrlChange(event) {
    closeSnackbar();
    setUrlHasError(false);
    setUrl(event.target.value);
  }

  function analyseUrl() {
    const urlParseRE = /^(((([^:/#?]+:)?(?:(\/\/)((?:(([^:@/#?]+)(?::([^:@/#?]+))?)@)?(([^:/#?\][]+|\[[^/\]@#?]+])(?::([0-9]+))?))?)?)?((\/?(?:[^/?#]+\/+)*)([^?#]*)))?(\?[^#]+)?)(#.*)?/;
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
          history.push(`/submissions/${api_data.api_response.sid}`);
        }, 500);
      },
      onFailure: api_data => {
        showErrorMessage(t('submit.url.failure'));
        setUrlHasError(true);
      }
    });
  }

  useEffect(() => {
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
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'}>
      <div style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'inline-block', marginBottom: '2rem' }}>{getBanner(theme)}</div>
        {c12nDef.enforce ? (
          <div style={{ paddingBottom: sp8 }}>
            <div style={{ padding: sp1, fontSize: 16 }}>{t('classification')}</div>
            <Classification
              format="long"
              type="picker"
              c12n={settings ? settings.classification : null}
              setClassification={setClassification}
            />
          </div>
        ) : null}
        <TabContext value={value}>
          <Paper square>
            <TabList centered onChange={handleChange} indicatorColor="primary" textColor="primary">
              <Tab label={t('file')} value="0" />
              <Tab label={t('url')} value="1" />
              <Tab label={t('options')} value="2" />
            </TabList>
          </Paper>
          <TabPanel value="0" className={classes.no_pad}>
            {settings ? (
              <div style={{ marginTop: '30px' }}>
                <FileDropper file={file} setFile={setFileDropperFile} disabled={!allowClick} />
                <div style={{ marginTop: '2rem' }}>
                  {file ? (
                    <>
                      <Button disabled={!allowClick} color="primary" variant="contained" onClick={uploadAndScan}>
                        {uploadProgress === null ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
                      </Button>
                      <Button
                        style={{ marginLeft: '16px' }}
                        color="secondary"
                        variant="contained"
                        onClick={cancelUpload}
                      >
                        {t('file.cancel')}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <Skeleton style={{ height: '280px' }} />
            )}
            {configuration.ui.tos ? (
              <div style={{ marginTop: '50px', textAlign: 'center' }}>
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
          <TabPanel value="1" className={classes.no_pad}>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '30px', alignItems: 'flex-start' }}>
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
                    onClick={() => analyseUrl()}
                  >
                    {t('url.button')}
                  </Button>
                </>
              ) : (
                <>
                  <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
                  <Skeleton style={{ marginLeft: '16px', height: '3rem', width: '5rem' }} />
                </>
              )}
            </div>
            {configuration.ui.tos ? (
              <div style={{ marginTop: '50px', textAlign: 'center' }}>
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
          <TabPanel value="2" className={classes.no_pad}>
            <Grid container spacing={1}>
              <Grid item xs={12} md>
                <div style={{ paddingLeft: sp2, textAlign: 'left', marginTop: sp4 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('options.service')}
                  </Typography>
                  <ServiceTree size="small" settings={settings} setSettings={setSettings} />
                </div>
              </Grid>
              <Grid item xs={12} md>
                <div style={{ textAlign: 'left', marginTop: sp4 }}>
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
                    <div style={{ paddingLeft: sp1 }}>
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
                            <Skeleton
                              style={{ height: '2rem', width: '1.5rem', marginLeft: '16px', marginRight: '16px' }}
                            />
                          )
                        }
                        label={<Typography variant="body2">{t('options.submission.ignore_filtering')}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                    <div style={{ paddingLeft: sp1 }}>
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
                            <Skeleton
                              style={{ height: '2rem', width: '1.5rem', marginLeft: '16px', marginRight: '16px' }}
                            />
                          )
                        }
                        label={<Typography variant="body2">{t('options.submission.ignore_cache')}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                    <div style={{ paddingLeft: sp1 }}>
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
                            <Skeleton
                              style={{ height: '2rem', width: '1.5rem', marginLeft: '16px', marginRight: '16px' }}
                            />
                          )
                        }
                        label={
                          <Typography variant="body2">
                            {t('options.submission.ignore_dynamic_recursion_prevention')}
                          </Typography>
                        }
                        className={settings ? classes.item : null}
                      />
                    </div>
                    <div style={{ paddingLeft: sp1 }}>
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
                            <Skeleton
                              style={{ height: '2rem', width: '1.5rem', marginLeft: '16px', marginRight: '16px' }}
                            />
                          )
                        }
                        label={<Typography variant="body2">{t('options.submission.profile')}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                    <div style={{ paddingLeft: sp1 }}>
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
                            <Skeleton
                              style={{ height: '2rem', width: '1.5rem', marginLeft: '16px', marginRight: '16px' }}
                            />
                          )
                        }
                        label={<Typography variant="body2">{t('options.submission.deep_scan')}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                  </div>
                  <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {t('options.submission.ttl')}
                    </Typography>
                    {settings ? (
                      <TextField
                        id="ttl"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: 365 }}
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

                {settings && settings.service_spec.length !== 0 ? (
                  <div style={{ textAlign: 'left', marginTop: sp4 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('options.service_spec')}
                    </Typography>
                    {settings.service_spec.map((service, idx) => {
                      return (
                        <div key={idx} style={{ paddingTop: sp1, paddingBottom: sp1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {service.name}
                          </Typography>
                          {service.params.map((param, pidx) => {
                            return (
                              <div key={pidx} style={{ paddingBottom: sp1 }}>
                                {param.type === 'bool' ? (
                                  <div style={{ paddingLeft: sp1 }}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={param.value === 'true' || param.value === true}
                                          name="label"
                                          onChange={() => setParam(idx, pidx, !param.value)}
                                        />
                                      }
                                      label={
                                        <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                                          {param.name.replace('_', ' ')}
                                        </Typography>
                                      }
                                      className={classes.item}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <Typography
                                        variant="caption"
                                        gutterBottom
                                        style={{ textTransform: 'capitalize' }}
                                      >
                                        {param.name.replace('_', ' ')}
                                      </Typography>
                                    </div>
                                    {param.type === 'list' ? (
                                      <Select
                                        margin="dense"
                                        value={param.value}
                                        variant="outlined"
                                        onChange={event => setParam(idx, pidx, event.target.value)}
                                        fullWidth
                                      >
                                        {param.list.map((item, i) => {
                                          return (
                                            <MenuItem key={i} value={item}>
                                              {item}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    ) : (
                                      <TextField
                                        variant="outlined"
                                        type={param.type === 'int' ? 'number' : 'text'}
                                        size="small"
                                        fullWidth
                                        defaultValue={param.value}
                                        onChange={event => setParamAsync(idx, pidx, event.target.value)}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </div>
    </PageCenter>
  );
}

export default Submit;
