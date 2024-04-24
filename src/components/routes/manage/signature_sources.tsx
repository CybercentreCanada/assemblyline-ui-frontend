import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import NoEncryptionOutlinedIcon from '@mui/icons-material/NoEncryptionOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import {
  Button,
  Card,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiGitBranch } from 'react-icons/di';
import { Link } from 'react-router-dom';
import ForbiddenPage from '../403';
import { Source } from '../admin/service_detail';
import { SourceDetail } from './signature_sources_details';

const useStyles = makeStyles(theme => ({
  actionButton: {
    marginTop: '-16px'
  },
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
      backgroundColor: theme.palette.mode === 'dark' ? '#ffffff10' : '#00000005',
      cursor: 'pointer'
    }
  },
  errorCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    backgroundColor: theme.palette.mode === 'dark' ? '#ff000017' : '#FFE4E4',
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
  },
  sync: false
};

const isSourceUpdating = (source: Source) => source.status.state === 'UPDATING';
const queueSourceUpdate = (source: Source) => ({
  ...source,
  status: { ...source.status, state: 'UPDATING', message: 'Queued for update..' }
});

const WrappedSourceDetailDrawer = ({ service, base, close, generatesSignatures }) => {
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
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 1000);
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
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 1000);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const triggerSourceUpdate = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/update/${service}/?sources=${encodeURIComponent(source.name)}`,
      onSuccess: () => {
        showSuccessMessage(`${t('update.response.success')}: ${source.name} (${service})`);
        setSource(queueSourceUpdate(source));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 500);
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
          waiting={buttonLoading}
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
              <Grid item xs={12} sm style={{ textAlign: 'right', flexGrow: 1 }}>
                {generatesSignatures && (
                  <Tooltip title={t('view_signatures')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? '#F' : '#0'
                      }}
                      component={Link}
                      to={`/manage/signatures/?query=${encodeURIComponent(
                        `type:${service.toLowerCase()} AND source:${source.name}`
                      )}`}
                      size="large"
                    >
                      <FingerprintOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {base && (
                  <Tooltip title={t('update')}>
                    <IconButton
                      style={{
                        color: isSourceUpdating(source)
                          ? theme.palette.action.disabled
                          : theme.palette.mode === 'dark'
                          ? theme.palette.info.light
                          : theme.palette.info.dark
                      }}
                      disabled={isSourceUpdating(source)}
                      onClick={triggerSourceUpdate}
                      size="large"
                    >
                      <SystemUpdateAltIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t('delete')}>
                  <IconButton
                    style={{
                      color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                    }}
                    onClick={deleteSource}
                    size="large"
                  >
                    <RemoveCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </div>
        <SourceDetail source={source} defaults={null} addMode={!base} setSource={setSource} setModified={setModified} />

        <RouterPrompt when={modified} />

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

export const SourceCard = ({ source, onClick, service, generatesSignatures, showDetails = true }) => {
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
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 500);
      }
    });
    e.stopPropagation();
  };

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card
        className={source.status && source.status.state === 'ERROR' ? classes.errorCard : classes.card}
        onClick={onClick}
      >
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
            {source.sync && (
              <Tooltip title={t('sync_used')}>
                <SyncOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {showDetails && (
              <span style={{ marginLeft: '6px' }}>
                {generatesSignatures && (
                  <Tooltip title={t('view_signatures')}>
                    <IconButton
                      className={classes.actionButton}
                      component={Link}
                      to={`/manage/signatures/?query=${encodeURIComponent(
                        `type:${service.toLowerCase()} AND source:${source.name}`
                      )}`}
                      style={{
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
                      }}
                      onClick={e => {
                        e.stopPropagation();
                      }}
                      size="large"
                    >
                      <FingerprintOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t('update')}>
                  <IconButton
                    className={classes.actionButton}
                    style={{
                      color: isSourceUpdating(source)
                        ? theme.palette.action.disabled
                        : theme.palette.mode === 'dark'
                        ? theme.palette.info.light
                        : theme.palette.info.dark
                    }}
                    disabled={isSourceUpdating(source)}
                    onClick={triggerSourceUpdate}
                    size="large"
                  >
                    <SystemUpdateAltIcon />
                  </IconButton>
                </Tooltip>
              </span>
            )}
          </div>
          <span className={classes.card_title}>{source.name}&nbsp;</span>
          <span className={classes.mono}>({source.uri})&nbsp;</span>
          {source.git_branch && (
            <span>
              <DiGitBranch style={{ verticalAlign: 'text-bottom' }}></DiGitBranch>
              <span className={classes.mono}>{source.git_branch}</span>
            </span>
          )}
          {showDetails && (
            <>
              <div>
                <span className={classes.card_caption}>{t('update.label.last_successful')}:&nbsp;</span>
                <Tooltip title={source.status.last_successful_update}>
                  <div className={classes.card_caption}>
                    <Moment variant="fromNow">{source.status.last_successful_update}</Moment>
                  </div>
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

const ServiceDetail = ({ service, sources, generatesSignatures }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSourceUpdateAll = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/update/${service}/`,
      onSuccess: () => {
        showSuccessMessage(`${t('update_all.response.success')}: ${service}`);
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 500);
      }
    });
  };

  const openDrawer = useCallback((currentService: string, source) => {
    setGlobalDrawer(
      <SourceDetailDrawer
        service={currentService}
        base={source}
        close={closeGlobalDrawer}
        generatesSignatures={generatesSignatures}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => (
      <div style={{ paddingTop: theme.spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography
              variant="h6"
              className={classes.title}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {service}
            </Typography>
          </div>
          <div style={{ paddingRight: '8px' }}>
            <Tooltip title={t('add_source')}>
              <IconButton
                style={{
                  color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
                  margin: '-4px 0'
                }}
                onClick={() => openDrawer(service, null)}
                size="large"
              >
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
            {generatesSignatures && (
              <Tooltip title={t('view_signatures')}>
                <IconButton
                  component={Link}
                  to={`/manage/signatures/?query=${encodeURIComponent(`type:${service.toLowerCase()}`)}`}
                  style={{
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                  size="large"
                >
                  <FingerprintOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {sources.length !== 0 && (
              <Tooltip title={t('update_all')}>
                <IconButton
                  style={{
                    color: sources.some(isSourceUpdating)
                      ? theme.palette.action.disabled
                      : theme.palette.mode === 'dark'
                      ? theme.palette.info.light
                      : theme.palette.info.dark
                  }}
                  disabled={sources.some(isSourceUpdating)}
                  onClick={triggerSourceUpdateAll}
                  size="large"
                >
                  <SystemUpdateAltIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
        <Divider />
        <Collapse in={open} timeout="auto">
          <div>
            {sources.length !== 0 ? (
              sources.map((source, id) => (
                <SourceCard
                  key={id}
                  source={source}
                  service={service}
                  onClick={() => openDrawer(service, source)}
                  generatesSignatures={generatesSignatures}
                />
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
    [classes.title, generatesSignatures, open, openDrawer, service, sources, t, theme, triggerSourceUpdateAll]
  );
};

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const intervalID = setInterval(reload, 15000);

    window.addEventListener('reloadUpdateSources', reload);
    return () => {
      clearInterval(intervalID);
      window.removeEventListener('reloadUpdateSources', reload);
    };
  }, [reload]);

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
              <ServiceDetail
                key={id}
                service={key}
                sources={sources[key].sources}
                generatesSignatures={sources[key].generates_signatures}
              />
            ))
          : [...Array(2)].map((item, i) => (
              <div key={i} style={{ marginTop: theme.spacing(2) }}>
                <Typography variant="h6" style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                  <Skeleton />
                </Typography>
                <Divider />
                <Skeleton
                  variant="rectangular"
                  height="6rem"
                  style={{ marginTop: theme.spacing(2), borderRadius: '4px' }}
                />
              </div>
            ))}
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
