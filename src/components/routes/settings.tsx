import {
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  isWidthDown,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  withWidth
} from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import CloseIcon from '@material-ui/icons/Close';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Skeleton from '@material-ui/lab/Skeleton';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ExternalSources from 'components/layout/externalSources';
import ServiceSpec from 'components/layout/serviceSpec';
import ServiceTree from 'components/layout/serviceTree';
import Classification from 'components/visual/Classification';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SettingsProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

function Skel() {
  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        <Skeleton />
      </Typography>
      <Skeleton />
      <Skeleton style={{ height: '2.5rem' }} />
      <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '8px' }}>
        <Skeleton style={{ height: '2.5rem', width: '1.5rem' }} />
        <Skeleton style={{ marginLeft: '1rem', height: '2.5rem', width: '100%' }} />
      </div>
    </div>
  );
}

const ClickRow = ({ children, enabled, onClick, chevron = false, ...other }) => (
  <TableRow
    hover={enabled}
    style={{ cursor: enabled ? 'pointer' : 'default' }}
    onClick={enabled ? () => onClick() : null}
    {...other}
  >
    {children}

    {chevron && <TableCell align="right">{enabled && <ChevronRightOutlinedIcon />}</TableCell>}
  </TableRow>
);

function Settings({ width }: SettingsProps) {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const [drawerType, setDrawerType] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [modified, setModified] = useState(false);
  const [editable, setEditable] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const sp6 = theme.spacing(6);

  const { apiCall } = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    drawer: {
      width: '500px',
      [theme.breakpoints.down('xs')]: {
        width: '100vw'
      }
    },
    row: {
      height: '62px'
    },
    group: {
      marginTop: '1rem'
    },
    skelItem: {
      display: 'inline-block'
    },
    skelButton: {
      display: 'inline-block',
      width: '9rem',
      height: '4rem'
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  }));
  const classes = useStyles();

  const setParam = (service_idx, param_idx, p_value) => {
    if (settings) {
      const newSettings = { ...settings };
      newSettings.service_spec[service_idx].params[param_idx].value = p_value;
      setSettings(newSettings);
      setModified(true);
    }
  };

  function setClassification(value) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, classification: value });
    }
  }

  function setTTL(value) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, ttl: parseInt(value) });
    }
  }

  function toggleDynamicPrevention() {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, ignore_dynamic_recursion_prevention: !settings.ignore_dynamic_recursion_prevention });
    }
  }

  const toggleExternalSource = source => {
    if (settings) {
      const newSources = settings.default_external_sources;
      if (newSources.indexOf(source) === -1) {
        newSources.push(source);
      } else {
        newSources.splice(newSources.indexOf(source), 1);
      }
      setModified(true);
      setSettings({ ...settings, default_external_sources: newSources });
    }
  };

  function toggleFiltering() {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, ignore_filtering: !settings.ignore_filtering });
    }
  }

  function toggleCaching() {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, ignore_cache: !settings.ignore_cache });
    }
  }

  function toggleDeepScan() {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, deep_scan: !settings.deep_scan });
    }
  }

  function toggleProfile() {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, profile: !settings.profile });
    }
  }

  function handleViewChange(event) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, submission_view: event.target.value });
    }
  }

  function handleEncodingChange(event) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, download_encoding: event.target.value });
    }
  }

  function handleEncodingPasswordChange(event) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, default_zip_password: event.target.value });
    }
  }

  function handleScoreChange(event) {
    if (settings) {
      setModified(true);
      setSettings({ ...settings, expand_min_score: event.target.value });
    }
  }

  function saveSettings() {
    if (settings) {
      apiCall({
        url: `/api/v4/user/settings/${currentUser.username}/`,
        method: 'POST',
        body: settings,
        onSuccess: () => {
          setModified(false);
          showSuccessMessage(t('success_save'));
        },
        onFailure: api_data => {
          if (api_data.api_status_code === 403) {
            showErrorMessage(api_data.api_error_message);
          }
        },
        onEnter: () => setButtonLoading(true),
        onExit: () => setButtonLoading(false)
      });
    }
  }

  function toggleDrawer(type) {
    if (settings) {
      setDrawerType(type);
      setDrawerOpen(true);
    }
  }

  useEffect(() => {
    // Make interface editable
    setEditable(currentUser.is_admin || currentUser.roles.includes('self_manage'));

    // Load user on start
    apiCall({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: api_data => {
        setSettings(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter margin={4} width="100%">
      <React.Fragment key="right">
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div style={{ alignSelf: 'flex-end' }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div
            className={classes.drawer}
            style={{
              paddingTop: sp4,
              paddingBottom: sp6,
              paddingLeft: sp4,
              paddingRight: sp4,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {drawerType &&
              settings &&
              {
                ttl: (
                  <>
                    <Typography variant="h4">{t('submissions.ttl')}</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {t('submissions.ttl_desc')}
                    </Typography>
                    <TextField
                      autoFocus
                      type="number"
                      margin="normal"
                      variant="outlined"
                      onChange={event => setTTL(event.target.value)}
                      value={settings.ttl}
                      inputProps={{
                        min: configuration.submission.max_dtl !== 0 ? 1 : 0,
                        max: configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365
                      }}
                    />
                  </>
                ),
                view: (
                  <>
                    <Typography variant="h4">{t('interface.view')}</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {t('interface.view_desc')}
                    </Typography>
                    <div style={{ paddingTop: sp2, width: '100%' }}>
                      <Select
                        id="view"
                        margin="dense"
                        value={settings.submission_view}
                        onChange={handleViewChange}
                        variant="outlined"
                        style={{ width: '100%' }}
                      >
                        <MenuItem value="report">{t('interface.view_report')}</MenuItem>
                        <MenuItem value="details">{t('interface.view_details')}</MenuItem>
                      </Select>
                    </div>
                  </>
                ),
                encoding: (
                  <>
                    <Typography variant="h4">{t('interface.encoding')}</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {t('interface.encoding_desc')}
                    </Typography>
                    <div style={{ paddingTop: sp2, width: '100%' }}>
                      <Select
                        id="view"
                        margin="dense"
                        value={settings.download_encoding}
                        onChange={handleEncodingChange}
                        variant="outlined"
                        style={{ width: '100%' }}
                      >
                        {!configuration.ui.allow_raw_downloads ? null : (
                          <MenuItem value="raw">{t('interface.encoding_raw')}</MenuItem>
                        )}
                        <MenuItem value="cart">{t('interface.encoding_cart')}</MenuItem>
                        {!configuration.ui.allow_zip_downloads ? null : (
                          <MenuItem value="zip">{t('interface.encoding_zip')}</MenuItem>
                        )}
                      </Select>
                    </div>
                    {settings.download_encoding !== 'zip' ? null : (
                      <>
                        <div style={{ paddingTop: sp2, width: '100%' }}>
                          <Typography variant="caption" color="textSecondary" gutterBottom>
                            {t('interface.encoding_password')}
                          </Typography>
                          <TextField
                            fullWidth={true}
                            required={true}
                            onChange={handleEncodingPasswordChange}
                            variant="outlined"
                            value={settings.default_zip_password}
                          ></TextField>
                        </div>
                      </>
                    )}
                  </>
                ),
                score: (
                  <>
                    <Typography variant="h4">{t('interface.score')}</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {t('interface.score_desc')}
                    </Typography>
                    <div style={{ paddingTop: sp2, width: '100%' }}>
                      <Select
                        id="view"
                        margin="dense"
                        value={settings.expand_min_score}
                        onChange={handleScoreChange}
                        variant="outlined"
                        style={{ width: '100%' }}
                      >
                        <MenuItem value="-1000000">{t('interface.score_-1000000')}</MenuItem>
                        <MenuItem value="0">{t('interface.score_0')}</MenuItem>
                        <MenuItem value="100">{t('interface.score_100')}</MenuItem>
                        <MenuItem value="500">{t('interface.score_500')}</MenuItem>
                        <MenuItem value="2000">{t('interface.score_2000')}</MenuItem>
                        <MenuItem value="100000000">{t('interface.score_100000000')}</MenuItem>
                      </Select>
                    </div>
                  </>
                )
              }[drawerType]}
          </div>
        </Drawer>
      </React.Fragment>

      <TableContainer className={classes.group} component={Paper}>
        <Table aria-label={t('submissions')}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={isWidthDown('xs', width) ? 2 : 3}>
                <Typography variant="h6" gutterBottom>
                  {t('submissions')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <ClickRow enabled={editable} onClick={toggleDynamicPrevention}>
              <TableCell colSpan={2} width="100%">
                <Typography variant="body1">{t('submissions.dynamic_recursion')}</Typography>
                <Typography variant="caption">{t('submissions.dynamic_recursion_desc')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Switch
                  checked={settings ? !settings.ignore_dynamic_recursion_prevention : true}
                  disabled={settings === null || !editable}
                  onChange={() => toggleDynamicPrevention()}
                  color="secondary"
                  name="dynamic_resursion"
                />
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} onClick={toggleFiltering}>
              <TableCell colSpan={2} width="100%">
                <Typography variant="body1">{t('submissions.filtering')}</Typography>
                <Typography variant="caption">{t('submissions.filtering_desc')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Switch
                  checked={settings ? !settings.ignore_filtering : true}
                  disabled={settings === null || !editable}
                  onChange={() => toggleFiltering()}
                  color="secondary"
                  name="filtering"
                />
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} onClick={toggleCaching}>
              <TableCell colSpan={2} width="100%">
                <Typography variant="body1">{t('submissions.result_caching')}</Typography>
                <Typography variant="caption">{t('submissions.result_caching_desc')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Switch
                  checked={settings ? !settings.ignore_cache : true}
                  disabled={settings === null || !editable}
                  onChange={() => toggleCaching()}
                  color="secondary"
                  name="result_caching"
                />
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} onClick={toggleDeepScan}>
              <TableCell colSpan={2} width="100%">
                <Typography variant="body1">{t('submissions.deep_scan')}</Typography>
                <Typography variant="caption">{t('submissions.deep_scan_desc')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Switch
                  checked={settings ? settings.deep_scan : true}
                  disabled={settings === null || !editable}
                  onChange={() => toggleDeepScan()}
                  color="secondary"
                  name="deep_scan"
                />
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} onClick={toggleProfile}>
              <TableCell colSpan={2} width="100%">
                <Typography variant="body1">{t('submissions.profile')}</Typography>
                <Typography variant="caption">{t('submissions.profile_desc')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Switch
                  checked={settings ? settings.profile : true}
                  disabled={settings === null || !editable}
                  onChange={() => toggleProfile()}
                  color="secondary"
                  name="profile"
                />
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} chevron onClick={event => toggleDrawer('ttl')}>
              {isWidthDown('xs', width) ? null : (
                <TableCell>
                  <Typography variant="body1">{t('submissions.ttl')}</Typography>
                  <Typography variant="caption">{t('submissions.ttl_desc')}</Typography>
                </TableCell>
              )}
              <TableCell colSpan={isWidthDown('xs', width) ? 2 : 1}>
                {!isWidthDown('xs', width) ? null : (
                  <>
                    <Typography variant="body1">{t('submissions.ttl')}</Typography>
                    <Typography variant="caption" gutterBottom>
                      {t('submissions.ttl_desc')}
                    </Typography>
                  </>
                )}
                {settings ? (
                  <Typography variant="subtitle2" color="primary">
                    {settings.ttl === 0 ? t('submissions.ttl_forever') : `${settings.ttl} ${t('submissions.ttl_days')}`}
                  </Typography>
                ) : (
                  <Skeleton />
                )}
              </TableCell>
            </ClickRow>
            {c12nDef.enforce && (
              <TableRow>
                {isWidthDown('xs', width) ? null : (
                  <TableCell>
                    <Typography variant="body1">{t('submissions.classification')}</Typography>
                    <Typography variant="caption">{t('submissions.classification_desc')}</Typography>
                  </TableCell>
                )}
                <TableCell colSpan={isWidthDown('xs', width) ? 3 : 2}>
                  {!isWidthDown('xs', width) ? null : (
                    <>
                      <Typography variant="body1">{t('submissions.classification')}</Typography>
                      <Typography variant="caption" gutterBottom>
                        {t('submissions.classification_desc')}
                      </Typography>
                    </>
                  )}
                  <Classification
                    type={editable ? 'picker' : 'pill'}
                    size="small"
                    c12n={settings ? settings.classification : null}
                    setClassification={setClassification}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer className={classes.group} component={Paper}>
        <Table aria-label={t('interface')}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="h6" gutterBottom>
                  {t('interface')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <ClickRow enabled={editable} chevron onClick={event => toggleDrawer('view')}>
              {isWidthDown('xs', width) ? null : (
                <TableCell>
                  <Typography variant="body1">{t('interface.view')}</Typography>
                  <Typography variant="caption">{t('interface.view_desc')}</Typography>
                </TableCell>
              )}
              <TableCell colSpan={isWidthDown('xs', width) ? 2 : 1}>
                {!isWidthDown('xs', width) ? null : (
                  <>
                    <Typography variant="body1">{t('interface.view')}</Typography>
                    <Typography variant="caption" gutterBottom>
                      {t('interface.view_desc')}
                    </Typography>
                  </>
                )}
                {settings ? (
                  <Typography variant="subtitle2" color="primary">
                    {t(`interface.view_${settings.submission_view}`)}
                  </Typography>
                ) : (
                  <Skeleton />
                )}
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} chevron onClick={event => toggleDrawer('encoding')}>
              {isWidthDown('xs', width) ? null : (
                <TableCell>
                  <Typography variant="body1">{t('interface.encoding')}</Typography>
                  <Typography variant="caption">{t('interface.encoding_desc')}</Typography>
                </TableCell>
              )}
              <TableCell colSpan={isWidthDown('xs', width) ? 2 : 1}>
                {!isWidthDown('xs', width) ? null : (
                  <>
                    <Typography variant="body1">{t('interface.encoding')}</Typography>
                    <Typography variant="caption" gutterBottom>
                      {t('interface.encoding_desc')}
                    </Typography>
                  </>
                )}
                {settings ? (
                  <>
                    <Typography variant="subtitle2" color="primary">
                      {t(`interface.encoding_${settings.download_encoding}`)}
                    </Typography>
                    {settings.download_encoding !== 'zip' ? null : (
                      <>
                        <div style={{ display: 'inline-block', verticalAlign: 'middle', paddingRight: '3px' }}>
                          <LockOutlinedIcon fontSize="small" />
                        </div>
                        <Typography variant="caption">{settings.default_zip_password}</Typography>
                      </>
                    )}
                  </>
                ) : (
                  <Skeleton />
                )}
              </TableCell>
            </ClickRow>
            <ClickRow enabled={editable} chevron onClick={event => toggleDrawer('score')}>
              {isWidthDown('xs', width) ? null : (
                <TableCell>
                  <Typography variant="body1">{t('interface.score')}</Typography>
                  <Typography variant="caption">{t('interface.score_desc')}</Typography>
                </TableCell>
              )}
              <TableCell colSpan={isWidthDown('xs', width) ? 2 : 1}>
                {!isWidthDown('xs', width) ? null : (
                  <>
                    <Typography variant="body1">{t('interface.score')}</Typography>
                    <Typography variant="caption" gutterBottom>
                      {t('interface.score_desc')}
                    </Typography>
                  </>
                )}
                {settings ? (
                  <Typography variant="subtitle2" color="primary">
                    {t(`interface.score_${settings.expand_min_score}`)}
                  </Typography>
                ) : (
                  <Skeleton />
                )}
              </TableCell>
            </ClickRow>
          </TableBody>
        </Table>
      </TableContainer>

      {configuration.submission.sha256_sources && configuration.submission.sha256_sources.length > 0 && (
        <Paper className={classes.group}>
          <ExternalSources disabled={!editable} settings={settings} onChange={toggleExternalSource} />
        </Paper>
      )}

      <Paper className={classes.group}>
        <div style={{ padding: sp2, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            {t('service')}
          </Typography>
          <ServiceTree
            disabled={!editable}
            settings={settings}
            setSettings={setSettings}
            setModified={setModified}
            compressed
          />
        </div>
      </Paper>

      <Paper className={classes.group}>
        <div style={{ padding: sp2, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            {t('service_spec')}
          </Typography>
          {settings ? (
            <ServiceSpec
              disabled={!editable}
              service_spec={settings.service_spec}
              setParam={setParam}
              setParamAsync={setParam}
              compressed
            />
          ) : (
            <div>
              <Skel />
              <Skel />
              <Skel />
              <Skel />
            </div>
          )}
        </div>
      </Paper>

      <RouterPrompt when={modified} />

      {settings && modified && (
        <div
          style={{
            paddingTop: sp1,
            paddingBottom: sp1,
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[4]
          }}
        >
          <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveSettings}>
            {t('save')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      )}
    </PageCenter>
  );
}

export default withWidth()(Settings);
