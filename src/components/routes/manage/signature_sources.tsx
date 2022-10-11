import {
  Button,
  Card,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CardMembershipOutlinedIcon from '@material-ui/icons/CardMembershipOutlined';
import DnsOutlinedIcon from '@material-ui/icons/DnsOutlined';
import NoEncryptionOutlinedIcon from '@material-ui/icons/NoEncryptionOutlined';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import { Skeleton } from '@material-ui/lab';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import ForbiddenPage from '../403';
import { Source } from '../admin/service_detail';
import { SourceDetail } from './signature_sources_details';

const useStyles = makeStyles(theme => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  card: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    wordBreak: 'break-word',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#ffffff10' : '#00000005',
      cursor: 'pointer'
    }
  },
  errorCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    backgroundColor: theme.palette.type === 'dark' ? '#ff000017' : '#FFE4E4',
    wordBreak: 'break-word',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  checkbox: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  card_title: {
    fontSize: 'larger',
    fontFamily: 'monospace'
  },
  card_caption: {
    fontSize: 'smaller',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  label: {
    fontWeight: 500
  },
  mono: {
    fontFamily: 'monospace'
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

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

const WrappedSourceDetailDrawer = ({ service, base, close, reload }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [modified, setModified] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const [source, setSource] = useState(null);
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));
  const classes = useStyles();

  useEffect(() => {
    if (base) {
      setSource({ ...DEFAULT_SOURCE, default_classification: c12nDef.UNRESTRICTED, ...base });
    } else {
      setSource({ ...DEFAULT_SOURCE, default_classification: c12nDef.UNRESTRICTED });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const saveChanges = () => {
    apiCall({
      method: base ? 'POST' : 'PUT',
      url: base
        ? `/api/v4/signature/sources/${service}/${encodeURIComponent(source.name)}/`
        : `/api/v4/signature/sources/${service}/`,
      body: source,
      onSuccess: () => {
        showSuccessMessage(t(base ? 'change.success' : 'add.success'));
        setModified(false);
        if (!base || !isXL) close();
        reload();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const deleteSource = () => setDeleteDialog(true);

  const executeDeleteSource = () => {
    close();
    apiCall({
      url: `/api/v4/signature/sources/${service}/${encodeURIComponent(source.name)}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        reload();
      }
    });
  };

  const triggerSourceUpdate = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/update/${service}/?sources=${encodeURIComponent(source.name)}`,
      onSuccess: () => {
        showSuccessMessage(`${t('update.response.success')}: ${source.name} (${service})`);
      }
    });
  };

  return (
    source && (
      <div style={{ paddingTop: theme.spacing(2) }}>
        <ConfirmationDialog
          open={deleteDialog}
          handleClose={() => setDeleteDialog(false)}
          handleAccept={executeDeleteSource}
          title={t('delete.title')}
          cancelText={t('delete.cancelText')}
          acceptText={t('delete.acceptText')}
          text={t('delete.text')}
        />

        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{service}</Typography>
              <Typography variant="caption">
                {`${t(base ? 'editing_source' : 'adding_source')}${base ? ` (${base.name})` : ''}`}
              </Typography>
            </Grid>
            {base && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 1 }}>
                <Tooltip title={t('delete')}>
                  <IconButton
                    style={{
                      color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                    }}
                    onClick={deleteSource}
                  >
                    <RemoveCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
                {base && (
                  <Tooltip title={t('update')}>
                    <IconButton
                      style={{
                        color:
                          source.status.state === 'UPDATING'
                            ? theme.palette.action.disabled
                            : theme.palette.type === 'dark'
                            ? theme.palette.info.light
                            : theme.palette.info.dark
                      }}
                      disabled={source.status.state === 'UPDATING'}
                      onClick={triggerSourceUpdate}
                    >
                      <SystemUpdateAltIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            )}
          </Grid>
        </div>
        <SourceDetail source={source} defaults={null} addMode={!base} setSource={setSource} setModified={setModified} />
        <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2), textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!source.name || !source.uri || !modified || buttonLoading}
            onClick={saveChanges}
          >
            {t(base ? 'change.save' : 'add.save')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      </div>
    )
  );
};

export const SourceDetailDrawer = React.memo(WrappedSourceDetailDrawer);

export const SourceCard = ({ source, onClick, service, showDetails = true }) => {
  const { t, i18n } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSourceUpdate = e => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/update/${service}/?sources=${encodeURIComponent(source.name)}`,
      onSuccess: () => {
        showSuccessMessage(`${t('update.response.success')}: ${source.name} (${service})`);
      }
    });
    e.stopPropagation();
  };

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card className={source.status.state === 'ERROR' ? classes.errorCard : classes.card} onClick={onClick}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <div style={{ float: 'right', marginTop: '8px' }}>
            {source.private_key && (
              <Tooltip title={t('private_key_used')}>
                <VpnKeyOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.ca_cert && (
              <Tooltip title={t('ca_used')}>
                <CardMembershipOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.proxy && (
              <Tooltip title={t('proxy_used')}>
                <DnsOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.ssl_ignore_errors && (
              <Tooltip title={t('ignore_ssl_used')}>
                <NoEncryptionOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {showDetails && (
              <Tooltip title={t('update')}>
                <IconButton
                  style={{
                    marginTop: '-16px',
                    color:
                      source.status.state === 'UPDATING'
                        ? theme.palette.action.disabled
                        : theme.palette.type === 'dark'
                        ? theme.palette.info.light
                        : theme.palette.info.dark
                  }}
                  disabled={source.status.state === 'UPDATING'}
                  onClick={triggerSourceUpdate}
                >
                  <SystemUpdateAltIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
          <span className={classes.card_title}>{source.name}&nbsp;</span>
          <span className={classes.mono}>({source.uri})</span>
          {showDetails && (
            <>
              <div>
                <span className={classes.card_caption}>{t('update.label.last_successful')}:&nbsp;</span>
                <Tooltip title={source.status.last_successful_update}>
                  <Moment className={classes.card_caption} fromNow locale={i18n.language}>
                    {source.status.last_successful_update}
                  </Moment>
                </Tooltip>
              </div>
              <Tooltip title={`${source.status.message} @ ${source.status.ts}`}>
                <div className={classes.card_caption}>
                  {t('update.label.status')}: {source.status.message}
                </div>
              </Tooltip>
            </>
          )}
        </div>
        <Grid container>
          {source.pattern && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('pattern')}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                {source.pattern}
              </Grid>
            </>
          )}
          {source.username && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('username')}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                {source.username}
              </Grid>
            </>
          )}
          {source.password && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('password')}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                ******
              </Grid>
            </>
          )}
          {c12nDef.enforce && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('classification')}:`}</Grid>

              <Grid item xs={7} sm={8} md={10}>
                <Classification type="text" c12n={source.default_classification || c12nDef.UNRESTRICTED} />
              </Grid>
            </>
          )}
        </Grid>
        {source.headers && source.headers.length !== 0 && (
          <div>
            <div className={classes.label}>{`${t('headers')}:`}&nbsp;</div>
            {source.headers.map((item, id) => (
              <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                {`${item.name} = ${item.value}`}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const ServiceDetail = ({ service, sources, reload }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isUpdateAllDisabled = () => {
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].status.state === 'UPDATING') {
        return true;
      }
    }
    return false;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSourceUpdateAll = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/update/${service}/`,
      onSuccess: () => {
        showSuccessMessage(`${t('update_all.response.success')}: ${service}`);
        reload();
      }
    });
  };

  const openDrawer = useCallback((currentService: string, source) => {
    setGlobalDrawer(
      <SourceDetailDrawer service={currentService} base={source} close={closeGlobalDrawer} reload={reload} />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => (
      <div style={{ paddingTop: theme.spacing(2) }}>
        <Grid container>
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <Typography
              variant="h6"
              className={classes.title}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {service}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ textAlign: 'right', paddingRight: '8px' }}>
            <Tooltip title={t('add_source')}>
              <IconButton
                style={{
                  color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
                  margin: '-4px 0'
                }}
                onClick={() => openDrawer(service, null)}
              >
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('update_all')}>
              <IconButton
                style={{
                  color: isUpdateAllDisabled()
                    ? theme.palette.action.disabled
                    : theme.palette.type === 'dark'
                    ? theme.palette.info.light
                    : theme.palette.info.dark
                }}
                disabled={isUpdateAllDisabled()}
                onClick={triggerSourceUpdateAll}
              >
                <SystemUpdateAltIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <Divider />
        <Collapse in={open} timeout="auto">
          <div>
            {sources.length !== 0 ? (
              sources.map((source, id) => (
                <SourceCard key={id} source={source} service={service} onClick={() => openDrawer(service, source)} />
              ))
            ) : (
              <Typography variant="subtitle1" color="textSecondary" style={{ marginTop: theme.spacing(1) }}>
                {t('no_sources')}
              </Typography>
            )}
          </div>
        </Collapse>
      </div>
    ),
    [classes.title, isUpdateAllDisabled, open, openDrawer, service, sources, t, theme, triggerSourceUpdateAll]
  );
};

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { user: currentUser } = useALContext();
  const [sources, setSources] = useState(null);
  const { apiCall } = useMyAPI();

  const reload = useCallback(() => {
    if (currentUser.roles.includes('signature_manage')) {
      apiCall({
        url: '/api/v4/signature/sources/',
        onSuccess: api_data => {
          setSources(api_data.api_response);
        }
      });
      setTimeout(reload, 15000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return currentUser.roles.includes('signature_manage') ? (
    <PageFullWidth margin={4}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption">
            {sources ? `${Object.keys(sources).length} ${t('caption')}` : <Skeleton />}
          </Typography>
        </div>

        {sources
          ? Object.keys(sources).map((key, id) => (
              <ServiceDetail key={id} service={key} sources={sources[key]} reload={reload} />
            ))
          : [...Array(2)].map((item, i) => (
              <div key={i} style={{ marginTop: theme.spacing(2) }}>
                <Typography variant="h6" style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                  <Skeleton />
                </Typography>
                <Divider />
                <Skeleton variant="rect" height="6rem" style={{ marginTop: theme.spacing(2), borderRadius: '4px' }} />
              </div>
            ))}
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
