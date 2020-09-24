import {
  Box,
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
import Skeleton from '@material-ui/lab/Skeleton';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import ServiceTree from 'components/layout/serviceTree';
import Classification from 'components/visual/Classification';
import { OptionsObject, useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNull } from 'util';

type SettingsProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

function Settings<SettingsProps>({ width }) {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const [drawerType, setDrawerType] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, c12nDef } = useAppContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const apiCall = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    page: {
      width: '90%',
      maxWidth: '1200px',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
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

  const snackBarSuccessOptions: OptionsObject = {
    variant: 'success',
    autoHideDuration: 3000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
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
          enqueueSnackbar(t('success_save'), snackBarSuccessOptions);
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
    <PageCenter>
      <React.Fragment key="right">
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box alignSelf="flex-end">
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box pt={4} pb={6} px={4} className={classes.drawer} display="flex" flexDirection="column">
            {drawerType && settings
              ? {
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
                        inputProps={{ min: 0, max: 365 }}
                      />
                    </>
                  ),
                  view: (
                    <>
                      <Typography variant="h4">{t('interface.view')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('interface.view_desc')}
                      </Typography>
                      <Box pt={2} width="100%">
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
                      </Box>
                    </>
                  ),
                  encoding: (
                    <>
                      <Typography variant="h4">{t('interface.encoding')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('interface.encoding_desc')}
                      </Typography>
                      <Box pt={2} width="100%">
                        <Select
                          id="view"
                          margin="dense"
                          value={settings.download_encoding}
                          onChange={handleEncodingChange}
                          variant="outlined"
                          style={{ width: '100%' }}
                        >
                          <MenuItem value="raw">{t('interface.encoding_raw')}</MenuItem>
                          <MenuItem value="cart">{t('interface.encoding_cart')}</MenuItem>
                        </Select>
                      </Box>
                    </>
                  ),
                  score: (
                    <>
                      <Typography variant="h4">{t('interface.score')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('interface.score_desc')}
                      </Typography>
                      <Box pt={2} width="100%">
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
                      </Box>
                    </>
                  )
                }[drawerType]
              : null}
          </Box>
        </Drawer>
      </React.Fragment>

      <Box className={classes.page} py={6} display="inline-block" textAlign="center">
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
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDynamicPrevention()}>
                <TableCell colSpan={2} width="100%">
                  <Typography variant="body1">{t('submissions.dynamic_recursion')}</Typography>
                  <Typography variant="caption">{t('submissions.dynamic_recursion_desc')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={settings ? !settings.ignore_dynamic_recursion_prevention : true}
                    disabled={isNull(settings)}
                    onChange={() => toggleDynamicPrevention()}
                    color="secondary"
                    name="dynamic_resursion"
                  />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleFiltering()}>
                <TableCell colSpan={2} width="100%">
                  <Typography variant="body1">{t('submissions.filtering')}</Typography>
                  <Typography variant="caption">{t('submissions.filtering_desc')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={settings ? !settings.ignore_filtering : true}
                    disabled={isNull(settings)}
                    onChange={() => toggleFiltering()}
                    color="secondary"
                    name="filtering"
                  />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleCaching()}>
                <TableCell colSpan={2} width="100%">
                  <Typography variant="body1">{t('submissions.result_caching')}</Typography>
                  <Typography variant="caption">{t('submissions.result_caching_desc')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={settings ? !settings.ignore_cache : true}
                    disabled={isNull(settings)}
                    onChange={() => toggleCaching()}
                    color="secondary"
                    name="result_caching"
                  />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDeepScan()}>
                <TableCell colSpan={2} width="100%">
                  <Typography variant="body1">{t('submissions.deep_scan')}</Typography>
                  <Typography variant="caption">{t('submissions.deep_scan_desc')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={settings ? settings.deep_scan : true}
                    disabled={isNull(settings)}
                    onChange={() => toggleDeepScan()}
                    color="secondary"
                    name="deep_scan"
                  />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleProfile()}>
                <TableCell colSpan={2} width="100%">
                  <Typography variant="body1">{t('submissions.profile')}</Typography>
                  <Typography variant="caption">{t('submissions.profile_desc')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={settings ? !settings.profile : true}
                    disabled={isNull(settings)}
                    onChange={() => toggleProfile()}
                    color="secondary"
                    name="profile"
                  />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={event => toggleDrawer('ttl')}>
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
                      {settings.ttl === 0
                        ? t('submissions.ttl_forever')
                        : `${settings.ttl} ${t('submissions.ttl_days')}`}
                    </Typography>
                  ) : (
                    <Skeleton />
                  )}
                </TableCell>
                <TableCell align="right">
                  <ChevronRightOutlinedIcon />
                </TableCell>
              </TableRow>
              {c12nDef.enforce ? (
                <TableRow style={{ cursor: 'pointer' }}>
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
                      type="picker"
                      size="small"
                      c12n={settings ? settings.classification : null}
                      setClassification={setClassification}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
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
              <TableRow hover style={{ cursor: 'pointer' }} onClick={event => toggleDrawer('view')}>
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
                <TableCell align="right">
                  <ChevronRightOutlinedIcon />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={event => toggleDrawer('encoding')}>
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
                    <Typography variant="subtitle2" color="primary">
                      {t(`interface.encoding_${settings.download_encoding}`)}
                    </Typography>
                  ) : (
                    <Skeleton />
                  )}
                </TableCell>
                <TableCell align="right">
                  <ChevronRightOutlinedIcon />
                </TableCell>
              </TableRow>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={event => toggleDrawer('score')}>
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
                <TableCell align="right">
                  <ChevronRightOutlinedIcon />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Paper className={classes.group}>
          <Box p={2} textAlign="left">
            <Typography variant="h6" gutterBottom>
              {t('service')}
            </Typography>
            <ServiceTree settings={settings} setSettings={setSettings} setModified={setModified} />
          </Box>
        </Paper>

        {settings && modified ? (
          <Box
            py={1}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              backgroundColor: theme.palette.background.default,
              boxShadow: theme.shadows[4]
            }}
          >
            <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveSettings}>
              {t('save')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </Box>
        ) : null}
      </Box>
    </PageCenter>
  );
}

export default withWidth()(Settings);
