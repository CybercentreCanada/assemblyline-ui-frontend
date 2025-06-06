import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import CheckIcon from '@mui/icons-material/Check';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import NoEncryptionOutlinedIcon from '@mui/icons-material/NoEncryptionOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import {
  Card,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { UpdateConfig, UpdateSource } from 'components/models/base/service';
import { DEFAULT_SOURCE } from 'components/models/base/service';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import { SourceDetail } from 'components/routes/manage/signature_sources_details';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiGitBranch } from 'react-icons/di';
import { Link } from 'react-router-dom';

const CardCaption = memo(
  styled('div')(() => ({
    fontSize: 'smaller',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }))
);

const isSourceUpdating = (source: UpdateSource) => source.status.state === 'UPDATING';
const queueSourceUpdate = (source: UpdateSource) => ({
  ...source,
  status: { ...source.status, state: 'UPDATING', message: 'Queued for update..' }
});

type SourceDetailDrawerProps = {
  service: string;
  base: UpdateSource;
  defaults: UpdateSource;
  generatesSignatures: UpdateConfig['generates_signatures'];
  onClose?: () => void;
};

const WrappedSourceDetailDrawer = ({
  service,
  base,
  defaults,
  onClose,
  generatesSignatures
}: SourceDetailDrawerProps) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [source, setSource] = useState<UpdateSource>(null);
  const [modified, setModified] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

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
      method: base?.name ? 'POST' : 'PUT',
      url: base?.name
        ? `/api/v4/signature/sources/${service}/${encodeURIComponent(source.name)}/`
        : `/api/v4/signature/sources/${service}/`,
      body: source,
      onSuccess: () => {
        showSuccessMessage(t(base?.name ? 'change.success' : 'add.success'));
        setModified(false);
        if (!base || !isXL) onClose();
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 1000);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const deleteSource = () => setDeleteDialog(true);

  const executeDeleteSource = () => {
    onClose();
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

  const toggleSource = () => {
    apiCall({
      method: 'PUT',
      url: `/api/v4/signature/sources/enable/${service}/${encodeURIComponent(source.name)}/`,
      body: { enabled: !source.enabled },
      onSuccess: () => {
        setSource({ ...source, enabled: !source.enabled });
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 100);
      }
    });
  };

  const saveEnabled = source?.name && source?.uri && modified && !buttonLoading;

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

        <PageHeader
          primary={service}
          secondary={`${t(base ? 'editing_source' : 'adding_source')}${base ? ` (${base.name})` : ''}`}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(2) } }
          }}
          actions={
            <>
              {base && (
                <Tooltip key="enabled" title={t(source.enabled ? 'disable' : 'enable')}>
                  <IconButton onClick={toggleSource} size="large">
                    {source.enabled ? <ToggleOnIcon /> : <ToggleOffOutlinedIcon />}
                  </IconButton>
                </Tooltip>
              )}
              {base && generatesSignatures && (
                <Tooltip key="view" title={t('view_signatures')}>
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
                <Tooltip key="update" title={t('update')}>
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
              <Tooltip key="save" title={t(base ? 'change.save' : 'add.save')}>
                <IconButton
                  style={{
                    color: saveEnabled
                      ? theme.palette.mode === 'dark'
                        ? theme.palette.success.light
                        : theme.palette.success.dark
                      : theme.palette.grey[750]
                  }}
                  onClick={saveChanges}
                  disabled={!saveEnabled}
                  size="large"
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              {base && (
                <Tooltip key="removve" title={t('delete')}>
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
              )}
            </>
          }
        />

        <SourceDetail
          source={source}
          defaults={defaults}
          addMode={!base?.name}
          setSource={setSource}
          setModified={setModified}
          showDetails={false}
        />

        <RouterPrompt when={modified} />
      </div>
    )
  );
};

export const SourceDetailDrawer = React.memo(WrappedSourceDetailDrawer);

type SourceCardProps = {
  service: string;
  source: UpdateSource;
  generatesSignatures: UpdateConfig['generates_signatures'];
  showDetails?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export const SourceCard = ({ source, onClick, service, generatesSignatures, showDetails = true }: SourceCardProps) => {
  const { t, i18n } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

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
        onClick={onClick}
        sx={{
          ...(!source.enabled
            ? {
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                padding: '8px',
                margin: '0.25rem 0',
                overflow: 'auto',
                opacity: '50%',
                wordBreak: 'break-word',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#ffffff10' : '#00000010',
                  cursor: 'pointer'
                }
              }
            : source.status && source.status.state === 'ERROR'
              ? {
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
                }
              : {
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
                })
        }}
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
                      sx={{ marginTop: '-16px' }}
                    >
                      <FingerprintOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
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
                    sx={{ marginTop: '-16px' }}
                  >
                    <SystemUpdateAltIcon />
                  </IconButton>
                </Tooltip>
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 'larger',
              fontFamily: 'monospace'
            }}
          >
            {source.name}&nbsp;
          </span>
          <span style={{ fontFamily: 'monospace' }}>({source.uri})&nbsp;</span>
          {source.git_branch && (
            <span>
              <DiGitBranch style={{ verticalAlign: 'text-bottom' }}></DiGitBranch>
              <span style={{ fontFamily: 'monospace' }}>{source.git_branch}</span>
            </span>
          )}
          {showDetails && (
            <>
              <div>
                <CardCaption>{t('update.label.last_successful')}:&nbsp;</CardCaption>
                {source.status.last_successful_update !== '1970-01-01T00:00:00Z' ? (
                  <Tooltip title={source.status.last_successful_update}>
                    <CardCaption>
                      <Moment variant="fromNow">{source.status.last_successful_update}</Moment>
                    </CardCaption>
                  </Tooltip>
                ) : (
                  <CardCaption>{t('update.never')}</CardCaption>
                )}
              </div>
              <Tooltip title={`${source.status.message} @ ${source.status.ts}`}>
                <CardCaption>
                  {t('update.label.status')}: {source.status.message}
                </CardCaption>
              </Tooltip>
            </>
          )}
        </div>
        <Grid container size="grow">
          {source.pattern && (
            <>
              <Grid size={{ xs: 5, sm: 4, md: 2 }} sx={{ fontWeight: 500 }}>{`${t('pattern')}:`}</Grid>
              <Grid size={{ xs: 7, sm: 8, md: 10 }} style={{ fontFamily: 'monospace' }}>
                {source.pattern}
              </Grid>
            </>
          )}
          {c12nDef.enforce && (
            <>
              <Grid size={{ xs: 5, sm: 4, md: 2 }} sx={{ fontWeight: 500 }}>{`${t('classification')}:`}</Grid>
              <Grid size={{ xs: 7, sm: 8, md: 10 }}>
                <Classification type="text" c12n={source.default_classification || c12nDef.UNRESTRICTED} />
              </Grid>
            </>
          )}
        </Grid>
      </Card>
    </div>
  );
};

type ServiceDetailProps = {
  service: string;
  sources: UpdateConfig['sources'];
  generatesSignatures: UpdateConfig['generates_signatures'];
  updateIntervalSeconds: UpdateConfig['update_interval_seconds'];
  defaultPattern: UpdateConfig['default_pattern'];
};

const ServiceDetail = ({
  service,
  sources,
  generatesSignatures,
  updateIntervalSeconds,
  defaultPattern
}: ServiceDetailProps) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { apiCall } = useMyAPI();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const { showSuccessMessage } = useMySnackbar();

  const [open, setOpen] = useState<boolean>(true);

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

  const openDrawer = useCallback((currentService: string, source, defaults) => {
    setGlobalDrawer(
      <SourceDetailDrawer
        service={currentService}
        base={source}
        defaults={defaults}
        generatesSignatures={generatesSignatures}
        onClose={closeGlobalDrawer}
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
              onClick={() => {
                setOpen(!open);
              }}
              sx={{
                cursor: 'pointer',
                '&:hover, &:focus': {
                  color: theme.palette.text.secondary
                }
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
                onClick={() =>
                  openDrawer(
                    service,
                    {
                      ...DEFAULT_SOURCE,
                      update_interval: updateIntervalSeconds,
                      default_classification: c12nDef.UNRESTRICTED,
                      pattern: defaultPattern
                    },
                    {
                      update_interval: updateIntervalSeconds,
                      default_classification: c12nDef.UNRESTRICTED,
                      pattern: defaultPattern
                    }
                  )
                }
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
                  onClick={() => openDrawer(service, source, source)}
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
    [generatesSignatures, open, openDrawer, service, sources, t, theme, triggerSourceUpdateAll, updateIntervalSeconds]
  );
};

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [sources, setSources] = useState<Record<string, UpdateConfig>>(null);

  const reload = useCallback(() => {
    if (currentUser.roles.includes('signature_manage')) {
      apiCall<Record<string, UpdateConfig>>({
        url: '/api/v4/signature/sources/',
        onSuccess: ({ api_response }) => setSources(api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles]);

  useEffect(() => {
    reload();

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
        <PageHeader
          primary={t('title')}
          secondary={`${Object.keys(sources || {}).length} ${t('caption')}`}
          loading={!sources}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(2) } }
          }}
        />

        {sources
          ? Object.keys(sources).map((key, id) => (
              <ServiceDetail
                key={id}
                service={key}
                sources={sources[key].sources}
                generatesSignatures={sources[key].generates_signatures}
                updateIntervalSeconds={sources[key].update_interval_seconds}
                defaultPattern={sources[key].default_pattern}
              />
            ))
          : Array.from({ length: 2 }).map((item, i) => (
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
