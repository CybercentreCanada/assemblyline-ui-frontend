import {
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import ServiceTree from 'components/layout/serviceTree';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import Flow from 'helpers/flow';
import generateUUID from 'helpers/uuid';
import { OptionsObject, useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

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
  const history = useHistory();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const snackBarOptions: OptionsObject = {
    variant: 'error',
    autoHideDuration: 5000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
    }
  };

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

  const uploadAndScan = () => {
    setAllowClick(false);
    setUploadProgress(0);
    const flow = new Flow({
      target: '/api/v4/ui/flowjs/',
      permanentErrors: [412, 404, 500],
      maxChunkRetries: 1,
      chunkRetryInterval: 2000,
      simultaneousUploads: 4,
      generateUniqueIdentifier: getFileUUID
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
          enqueueSnackbar(`${t('submit.success')} ${api_data.api_response.sid}`, {
            ...snackBarOptions,
            variant: 'success'
          });
          setTimeout(() => {
            history.push(`/submissions/${api_data.api_response.sid}`);
          }, 500);
        },
        onFailure: api_data => {
          enqueueSnackbar(t('submit.file.failure'), snackBarOptions);
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
        enqueueSnackbar(`${t('submit.success')} ${api_data.api_response.sid}`, {
          ...snackBarOptions,
          variant: 'success'
        });
        setTimeout(() => {
          history.push(`/submissions/${api_data.api_response.sid}`);
        }, 500);
      },
      onFailure: api_data => {
        enqueueSnackbar(t('submit.url.failure'), snackBarOptions);
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
      <Box display="inline-block" textAlign="center" width="100%">
        <Box display="inline-block" marginBottom="2rem">
          {getBanner(theme)}
        </Box>
        {c12nDef.enforce ? (
          <Box pb={8}>
            <Box p={1} fontSize={16}>
              {t('classification')}
            </Box>
            <Classification
              format="long"
              type="picker"
              c12n={settings ? settings.classification : null}
              setClassification={setClassification}
            />
          </Box>
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
              <Box marginTop="30px">
                <FileDropper file={file} setFile={setFileDropperFile} />
                <Box marginTop="2rem">
                  {file ? (
                    <Button disabled={!allowClick} color="primary" variant="contained" onClick={uploadAndScan}>
                      {uploadProgress === null ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
                    </Button>
                  ) : null}
                </Box>
              </Box>
            ) : (
              <Skeleton style={{ height: '280px' }} />
            )}
            {configuration.ui.tos ? (
              <Box mt="50px" textAlign="center">
                <Typography variant="body2">
                  {t('terms1')}
                  <i>{t('file.button')}</i>
                  {t('terms2')}
                  <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                    {t('terms3')}
                  </Link>
                  .
                </Typography>
              </Box>
            ) : null}
          </TabPanel>
          <TabPanel value="1" className={classes.no_pad}>
            <Box display="flex" flexDirection="row" marginTop="30px" alignItems="flex-start">
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
            </Box>
            {configuration.ui.tos ? (
              <Box mt="50px" textAlign="center">
                <Typography variant="body2">
                  {t('terms1')}
                  <i>{t('url.button')}</i>
                  {t('terms2')}
                  <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                    {t('terms3')}
                  </Link>
                  .
                </Typography>
              </Box>
            ) : null}
          </TabPanel>
          <TabPanel value="2" className={classes.no_pad}>
            <Grid container spacing={1}>
              <Grid item xs={12} md>
                <Box pl={2} textAlign="left" mt={4}>
                  <Typography variant="h6" gutterBottom>
                    {t('options.service')}
                  </Typography>
                  <ServiceTree size="small" settings={settings} setSettings={setSettings} useMasonery={false} />
                </Box>
              </Grid>
              <Grid item xs={12} md>
                <Box textAlign="left" mt={4}>
                  <Typography variant="h6" gutterBottom>
                    {t('options.submission')}
                  </Typography>
                  <Box py={1}>
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
                  </Box>
                  <Box py={1}>
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
                  </Box>
                  <Box py={1}>
                    <Box pl={1}>
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
                    </Box>
                    <Box pl={1}>
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
                    </Box>
                    <Box pl={1}>
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
                    </Box>
                    <Box pl={1}>
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
                    </Box>
                    <Box pl={1}>
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
                    </Box>
                  </Box>
                  <Box py={1}>
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
                  </Box>
                </Box>

                {settings && settings.service_spec.length !== 0 ? (
                  <Box textAlign="left" mt={4}>
                    <Typography variant="h6" gutterBottom>
                      {t('options.service_spec')}
                    </Typography>
                    {settings.service_spec.map((service, idx) => {
                      return (
                        <Box key={idx} py={1}>
                          <Typography variant="subtitle1" gutterBottom>
                            {service.name}
                          </Typography>
                          {service.params.map((param, pidx) => {
                            return (
                              <Box key={pidx} pb={1}>
                                {param.type === 'bool' ? (
                                  <Box pl={1}>
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
                                  </Box>
                                ) : (
                                  <>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        gutterBottom
                                        style={{ textTransform: 'capitalize' }}
                                      >
                                        {param.name.replace('_', ' ')}
                                      </Typography>
                                    </Box>
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
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    })}
                  </Box>
                ) : null}
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </Box>
    </PageCenter>
  );
}

export default Submit;
