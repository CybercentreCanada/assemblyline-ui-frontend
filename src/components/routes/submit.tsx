import Flow from '@flowjs/flow.js';
import ClearIcon from '@mui/icons-material/Clear';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Switch,
  Tab,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ServiceSpec from 'components/layout/serviceSpec';
import ServiceTree from 'components/layout/serviceTree';
import { UserSettings } from 'components/models/base/user_settings';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDropper from 'components/visual/FileDropper';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

type SubmitState = {
  hash: string;
  tabContext: string;
  c12n: string;
  metadata?: any;
};

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

const Submit: React.FC<any> = () => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const [allowClick, setAllowClick] = useState<boolean>(true);
  const [file, setFile] = useState(null);
  const [flow, setFlow] = useState(null);
  const [settings, setSettings] = useState<UserSettings>(null);
  const [submissionMetadata, setSubmissionMetadata] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [urlAutoselection, setUrlAutoselection] = useState(false);
  const [uuid, setUUID] = useState(null);
  const [validate, setValidate] = useState(false);
  const [validateCB, setValidateCB] = useState(null);
  const [value, setValue] = useState('0');
  const [stringInput, setStringInput] = useState('');
  const [stringType, setStringType] = useState(undefined);
  const [stringInputHasError, setStringInputHasError] = useState(false);

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const state: SubmitState = location.state as SubmitState;
  const params = new URLSearchParams(location.search);
  const stringInputTitle = t('urlHash.input_title');
  const stringInputText = stringInputTitle + t('urlHash.input_suffix');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
    } else if (cbType === 'urlHash') {
      // No external service and url/SHA256 submitted
      analyseUrlHash();
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
      analyseUrlHash();
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
            navigate(`/submission/detail/${api_data.api_response.sid}`);
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

  const toggleServiceSelection = service_name => {
    if (settings) {
      const newServices = settings.services;
      for (const cat of newServices) {
        for (const srv of cat.services) {
          if (srv.name === service_name) {
            srv.selected = !srv.selected;
            break;
          }
        }
        cat.selected = cat.services.every(e => e.selected);
      }
      setSettings({ ...settings, services: newServices });
    }
  };

  const anySelected = () => {
    const serviceList = settings.service_spec.map(srv => srv.name);
    return serviceList.some(isSelected);
  };

  const setFileDropperFile = selectedFile => {
    setFile(selectedFile);
  };

  const toggleExternalSource = source => {
    if (settings) {
      const newSources = settings.default_external_sources;
      if (newSources.indexOf(source) === -1) {
        newSources.push(source);
      } else {
        newSources.splice(newSources.indexOf(source), 1);
      }
      setSettings({ ...settings, default_external_sources: newSources });
    }
  };

  const setParam = (service_idx, param_idx, p_value) => {
    if (settings) {
      const newSettings = { ...settings };
      const type = newSettings.service_spec[service_idx].params[param_idx].type;
      newSettings.service_spec[service_idx].params[param_idx].value = type === 'int' ? parseInt(p_value) : p_value;
      setSettings(newSettings);
    }
  };

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

  function handleStringChange(string) {
    closeSnackbar();
    setStringType(getSubmitType(string, configuration));
    setStringInputHasError(false);
    setSubmissionMetadata(undefined);
    setStringInput(string);
  }

  function analyseUrlHash() {
    let data: any = null;
    setAllowClick(false);

    if (!stringType && (stringType !== 'url' || !configuration.ui.allow_url_submissions)) {
      setAllowClick(true);
      setStringInputHasError(true);
      showErrorMessage(t(`submit.${configuration.ui.allow_url_submissions ? 'urlhash' : 'hash'}.error`));
      return;
    }

    data = { ui_params: settings, [stringType]: stringInput, metadata: submissionMetadata };

    setStringInputHasError(false);
    apiCall({
      url: '/api/v4/submit/',
      method: 'POST',
      body: data,
      onSuccess: api_data => {
        setAllowClick(false);
        showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
        setTimeout(() => {
          navigate(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
        setStringInputHasError(true);
        setAllowClick(true);
      }
    });
  }

  useEffect(() => {
    if (settings && !urlAutoselection && stringType === 'url') {
      const newServices = settings.services;
      for (const cat of newServices) {
        for (const srv of cat.services) {
          if (configuration.ui.url_submission_auto_service_selection.includes(srv.name)) {
            srv.selected = true;
          }
        }
        cat.selected = cat.services.every(e => e.selected);
      }
      setSettings({ ...settings, services: newServices });
      setUrlAutoselection(true);
    }
  }, [settings, stringType, urlAutoselection, configuration.ui.url_submission_auto_service_selection]);

  useEffect(() => {
    if (state) {
      setStringInput(state.hash);
      setStringType(getSubmitType(state.hash, configuration));
      setSubmissionMetadata(state.metadata);
      setValue(state.tabContext);
    }
  }, [state, configuration]);

  useEffectOnce(() => {
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
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: api_data => {
        if (state) {
          setSettings({ ...api_data.api_response, classification: state.c12n });
        } else if (params.get('classification')) {
          setSettings({ ...api_data.api_response, classification: params.get('classification') });
        } else {
          setSettings(api_data.api_response);
        }
      }
    });
    setUUID(generateUUID());

    var inputParam = params.get('input') || '';

    if (inputParam) {
      handleStringChange(inputParam);
      setValue('1');
    }
  });

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <ConfirmationDialog
        open={validate}
        handleClose={event => setValidate(false)}
        handleCancel={cleanupServiceSelection}
        handleAccept={executeCB}
        title={t('validate.title')}
        cancelText={t('validate.cancelText')}
        acceptText={t('validate.acceptText')}
        text={t('validate.text')}
      />
      <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>
      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}
      {/* {currentUser.roles.includes('submission_create') ? ( */}
      <>
        {c12nDef.enforce ? (
          <div style={{ paddingBottom: sp4 }}>
            <div style={{ padding: sp1, fontSize: 16 }}>{t('classification')}</div>
            <Classification
              format="long"
              type="picker"
              c12n={settings ? settings.classification : null}
              setClassification={setClassification}
              disabled={!currentUser.roles.includes('submission_create')}
            />
          </div>
        ) : null}
        <TabContext value={value}>
          <Paper square>
            <TabList
              centered
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tweaked_tabs}
            >
              <Tab label={t('file')} value="0" disabled={!currentUser.roles.includes('submission_create')} />
              <Tab label={stringInputTitle} value="1" disabled={!currentUser.roles.includes('submission_create')} />
              <Tab label={t('options')} value="2" disabled={!currentUser.roles.includes('submission_create')} />
            </TabList>
          </Paper>
          <TabPanel value="0" className={classes.no_pad}>
            {settings ? (
              <div style={{ marginTop: sp2 }}>
                <FileDropper
                  file={file}
                  setFile={setFileDropperFile}
                  disabled={!allowClick || !currentUser.roles.includes('submission_create')}
                />
                {file ? (
                  <>
                    {configuration.ui.allow_malicious_hinting ? (
                      <div style={{ padding: sp1 }}>
                        <Tooltip title={t('malicious.tooltip')} placement="top">
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
          <TabPanel value="1" className={classes.no_pad}>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: sp2, alignItems: 'flex-start' }}>
              {settings ? (
                <>
                  <TextField
                    label={stringInputText}
                    error={stringInputHasError}
                    size="small"
                    type="stringInput"
                    variant="outlined"
                    value={stringInput}
                    onChange={event => handleStringChange(event.target.value as String)}
                    style={{ flexGrow: 1, marginRight: '1rem' }}
                  />
                  <Button
                    disabled={!(stringInput && stringType) || !allowClick}
                    color="primary"
                    variant="contained"
                    onClick={() => validateServiceSelection('urlHash')}
                    style={{ height: '40px' }}
                  >
                    {stringType ? `${t('urlHash.button')} ${stringType}` : t('urlHash.button')}
                    {!allowClick && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </Button>
                </>
              ) : (
                <>
                  <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
                  <Skeleton style={{ marginLeft: sp2, height: '3rem', width: '5rem' }} />
                </>
              )}
            </div>
            {stringType === 'url' &&
              configuration.ui.url_submission_auto_service_selection &&
              configuration.ui.url_submission_auto_service_selection.length > 0 && (
                <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
                  <Typography variant="subtitle1">
                    {t('options.submission.url_submission_auto_service_selection')}
                  </Typography>
                  {configuration.ui.url_submission_auto_service_selection.map((service, i) => (
                    <div key={i}>
                      <FormControlLabel
                        control={
                          settings ? (
                            <Checkbox
                              size="small"
                              checked={isSelected(service)}
                              name="label"
                              onChange={event => toggleServiceSelection(service)}
                            />
                          ) : (
                            <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                          )
                        }
                        label={<Typography variant="body2">{service}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                  ))}
                </div>
              )}
            {stringType &&
              configuration.submission.file_sources[stringType] &&
              configuration.submission.file_sources[stringType].sources &&
              configuration.submission.file_sources[stringType].sources.length > 0 && (
                <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
                  <Typography variant="subtitle1">{t('options.submission.default_external_sources')}</Typography>
                  {configuration.submission.file_sources[stringType].sources.map((source, i) => (
                    <div key={i}>
                      <FormControlLabel
                        control={
                          settings ? (
                            <Checkbox
                              size="small"
                              checked={settings.default_external_sources.indexOf(source) !== -1}
                              name="label"
                              onChange={event => toggleExternalSource(source)}
                            />
                          ) : (
                            <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                          )
                        }
                        label={<Typography variant="body2">{source}</Typography>}
                        className={settings ? classes.item : null}
                      />
                    </div>
                  ))}
                </div>
              )}
            {submissionMetadata && Object.keys(submissionMetadata).length !== 0 && (
              <div style={{ textAlign: 'start', marginTop: theme.spacing(2) }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography style={{ flexGrow: 1 }} variant="subtitle1">
                    {t('options.submission.metadata')}
                  </Typography>
                  <Tooltip title={t('options.submission.metadata.clear')}>
                    <IconButton onClick={() => setSubmissionMetadata(undefined)}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <div>
                  {Object.keys(submissionMetadata).map((meta, i) => (
                    <Grid container key={i}>
                      <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500 }}>{meta}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                        {submissionMetadata[meta]}
                      </Grid>
                    </Grid>
                  ))}
                </div>
              </div>
            )}
            {configuration.ui.tos ? (
              <div style={{ marginTop: sp4, textAlign: 'center' }}>
                <Typography variant="body2">
                  {t('terms1')}
                  <i>{t('urlHash.button')}</i>
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
                      <FormControl size="small" fullWidth>
                        <Select
                          id="priority"
                          value={settings.priority}
                          variant="outlined"
                          onChange={event => setSettingValue('priority', event.target.value)}
                          fullWidth
                        >
                          <MenuItem value="500">{t('options.submission.priority.low')}</MenuItem>
                          <MenuItem value="1000">{t('options.submission.priority.medium')}</MenuItem>
                          <MenuItem value="1500">{t('options.submission.priority.high')}</MenuItem>
                        </Select>
                      </FormControl>
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
                            checked={settings.generate_alert}
                            name="label"
                            onChange={event => setSettingValue('generate_alert', event.target.checked)}
                          />
                        ) : (
                          <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                        )
                      }
                      label={<Typography variant="body2">{t('options.submission.generate_alert')}</Typography>}
                      className={settings ? classes.item : null}
                    />
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
                        type="number"
                        margin="dense"
                        size="small"
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
                    <ServiceSpec service_spec={settings.service_spec} setParam={setParam} isSelected={isSelected} />
                  </div>
                )}
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </>
      {/* ) : (
        <div>Cannot submit files</div>
      )} */}
    </PageCenter>
  );
};

export default memo(Submit);
