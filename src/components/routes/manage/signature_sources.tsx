import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  TextField,
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
import { Redirect } from 'react-router-dom';

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
  checkbox: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  card_title: {
    fontSize: 'large',
    fontFamily: 'monospace'
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
    fontSize: 'larger',
    fontFamily: 'monospace'
  },
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

const DEFAULT_HEADER = {
  name: '',
  value: ''
};

const DEFAULT_SOURCE = {
  ca_cert: '',
  default_classification: '',
  headers: [],
  name: '',
  password: '',
  pattern: '',
  private_key: '',
  ssl_ignore_errors: false,
  uri: '',
  username: ''
};

const WrappedSourceDetail = ({ service, base, close, reload }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [modified, setModified] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const apiCall = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const [tempHeader, setTempHeader] = useState({ ...DEFAULT_HEADER });
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

  const handleURIChange = event => {
    setSource({ ...source, uri: event.target.value });
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

  const saveChanges = () => {
    apiCall({
      method: base ? 'POST' : 'PUT',
      url: base ? `/api/v4/signature/sources/${service}/${source.name}/` : `/api/v4/signature/sources/${service}/`,
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
      url: `/api/v4/signature/sources/${service}/${source.name}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        reload();
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
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
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
              </Grid>
            )}
          </Grid>
        </div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <div className={classes.label}>{t('uri')}</div>
            <TextField size="small" value={source.uri} fullWidth variant="outlined" onChange={handleURIChange} />
          </Grid>
          {c12nDef.enforce && (
            <Grid item xs={12}>
              <div className={classes.label}>{t('classification')}</div>
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
                disabled={!!base}
                size="small"
                value={source.name}
                fullWidth
                variant="outlined"
                onChange={handleNameChange}
              />
            </div>
            <div style={{ paddingTop: theme.spacing(1) }}>
              <div className={classes.label}>{t('pattern')}</div>
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
              <div className={classes.label}>{t('username')}</div>
              <TextField
                size="small"
                value={source.username}
                fullWidth
                variant="outlined"
                onChange={handleUsernameChange}
              />
            </div>
            <div style={{ paddingTop: theme.spacing(1) }}>
              <div className={classes.label}>{t('password')}</div>
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
            <div className={classes.label}>{t('private_key')}</div>
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
          {source.headers.map((header, id) => {
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
            <div className={classes.label}>{t('proxy')}</div>
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
            <div className={classes.label}>{t('ca')}</div>
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
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox size="small" checked={source.ssl_ignore_errors} name="label" onChange={handleSSLChange} />
              }
              label={<Typography variant="body2">{t('ignore_ssl')}</Typography>}
              className={classes.checkbox}
            />
          </Grid>
        </Grid>
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

export const SourceDetail = React.memo(WrappedSourceDetail);

export const SourceCard = ({ source, onClick }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const classes = useStyles();

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card className={classes.card} onClick={onClick}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <div style={{ float: 'right' }}>
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
          </div>
          <span className={classes.card_title}>{source.name}&nbsp;</span>
          <span className={classes.mono}>({source.uri})</span>
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
            {source.headers.map((item, id) => {
              return (
                <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                  {`${item.name}: ${item.value}`}
                </div>
              );
            })}
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

  const openDrawer = useCallback((currentService: string, source) => {
    setGlobalDrawer(<SourceDetail service={currentService} base={source} close={closeGlobalDrawer} reload={reload} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => {
    return (
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
          <Grid item xs={2} style={{ textAlign: 'right' }}>
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
          </Grid>
        </Grid>
        <Divider />
        <Collapse in={open} timeout="auto">
          <div>
            {sources.length !== 0 ? (
              sources.map((source, id) => {
                return <SourceCard key={id} source={source} onClick={() => openDrawer(service, source)} />;
              })
            ) : (
              <Typography variant="subtitle1" color="textSecondary" style={{ marginTop: theme.spacing(1) }}>
                {t('no_sources')}
              </Typography>
            )}
          </div>
        </Collapse>
      </div>
    );
  }, [classes.title, open, openDrawer, service, sources, t, theme]);
};

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { user: currentUser } = useALContext();
  const [sources, setSources] = useState(null);
  const apiCall = useMyAPI();

  const reload = useCallback(() => {
    if (currentUser.is_admin || currentUser.roles.indexOf('signature_manager') !== -1) {
      apiCall({
        url: '/api/v4/signature/sources/',
        onSuccess: api_data => {
          setSources(api_data.api_response);
        }
      });
    }
  }, [apiCall, currentUser.is_admin, currentUser.roles]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return currentUser.is_admin || currentUser.roles.indexOf('signature_manager') !== -1 ? (
    <PageFullWidth margin={4}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption">
            {sources ? `${Object.keys(sources).length} ${t('caption')}` : <Skeleton />}
          </Typography>
        </div>

        {sources
          ? Object.keys(sources).map((key, id) => {
              return <ServiceDetail key={id} service={key} sources={sources[key]} reload={reload} />;
            })
          : [...Array(2)].map((item, i) => {
              return (
                <div key={i} style={{ marginTop: theme.spacing(2) }}>
                  <Typography variant="h6" style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                    <Skeleton />
                  </Typography>
                  <Divider />
                  <Skeleton variant="rect" height="6rem" style={{ marginTop: theme.spacing(2), borderRadius: '4px' }} />
                </div>
              );
            })}
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
