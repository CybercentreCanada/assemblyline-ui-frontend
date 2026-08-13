import CheckIcon from '@mui/icons-material/Check';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Badge from '@mui/material/Badge';
import { useAppBlocker, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { EnvironmentVariable, UpdateConfig, UpdateSource, UpdateSourceCommon } from 'models/base/service';
import { DEFAULT_SOURCE, FETCH_METHODS } from 'models/base/service';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showReset } from 'routes/admin-service-detail/components/service.utils';
import { IconButton } from 'ui/buttons/IconButton';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import { CheckboxInput } from 'ui/inputs/CheckboxInput';
import { ClassificationInput } from 'ui/inputs/ClassificationInput';
import { JSONInput } from 'ui/inputs/JSONInput';
import { NumberInput } from 'ui/inputs/NumberInput';
import { SelectInput } from 'ui/inputs/SelectInput';
import { SliderInput } from 'ui/inputs/SliderInput';
import { TextAreaInput } from 'ui/inputs/TextAreaInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageHeader } from 'ui/layouts/PageHeader';
import Moment from 'ui/Moment';
import { TabContainer } from 'ui/TabContainer';

export type SourceDetailProps = {
  source: UpdateSource;
  defaults: Partial<UpdateSource>;
  addMode: boolean;
  showDetails: boolean;
  setSource: React.Dispatch<React.SetStateAction<UpdateSource>>;
  setModified: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SourceDetail = memo(
  ({ source, defaults, setSource, addMode = false, setModified = null, showDetails = true }: SourceDetailProps) => {
    const { t } = useTranslation(['manageSignatureSources']);
    const theme = useTheme();
    const { c12nDef } = useALContext();

    const gitFetch = useMemo<boolean>(() => source.fetch_method === 'GIT', [source.fetch_method]);
    const postFetch = useMemo<boolean>(() => source.fetch_method === 'POST', [source.fetch_method]);

    const noManagedIdentity = useCallback(
      (
        src: Partial<UpdateSource>
      ): src is UpdateSourceCommon & { use_managed_identity: false; username?: string; password?: string } => true,
      []
    );

    return (
      source && (
        <>
          {c12nDef.enforce && (
            <Grid size={{ xs: 12 }}>
              <ClassificationInput
                label={t('classification')}
                loading={!source}
                value={!source ? null : source.default_classification}
                defaultValue={!defaults ? undefined : defaults?.default_classification}
                reset={showReset(source, defaults, 'default_classification')}
                onChange={(e, v) => {
                  if (source?.default_classification !== v) setModified(true);
                  setSource(s => ({ ...s, default_classification: v }));
                }}
              />
            </Grid>
          )}

          <TabContainer
            paper
            centered
            variant="standard"
            tabs={{
              general: {
                label: t('general'),
                icon: (
                  <Badge color="error" variant="dot" invisible={source.name !== ''}>
                    <InfoOutlinedIcon />
                  </Badge>
                ),
                iconPosition: 'start',
                inner: (
                  <>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextInput
                          label={t('name')}
                          loading={!source}
                          disabled={!addMode}
                          coercers={c => c.required()}
                          validators={v => v.required()}
                          value={!source ? null : source.name}
                          defaultValue={!defaults ? undefined : defaults?.name}
                          onChange={(e, v) => {
                            if (source?.name !== v) setModified(true);
                            setSource(s => ({ ...s, name: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextInput
                          label={t('pattern')}
                          loading={!source}
                          value={!source ? null : source.pattern}
                          defaultValue={!defaults ? undefined : defaults?.pattern}
                          reset={showReset(source, defaults, 'pattern')}
                          monospace
                          onChange={(e, v) => {
                            if (source?.pattern !== v) setModified(true);
                            setSource(s => ({ ...s, pattern: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 9 }}>
                        <SliderInput
                          label={t('update_interval')}
                          loading={!source}
                          value={!source ? null : source.update_interval}
                          defaultValue={!defaults ? undefined : (defaults?.update_interval ?? 3600)}
                          reset={showReset(source, defaults, 'update_interval')}
                          min={3600}
                          max={86400}
                          valueLabelDisplay="off"
                          step={null}
                          marks={
                            [
                              { value: 3600, label: '1h' },
                              { value: 14400, label: '4h' },
                              { value: 21600, label: '6h' },
                              { value: 43200, label: '12h' },
                              { value: 86400, label: '24h' }
                            ] as const
                          }
                          onChange={(e, v) => {
                            if (source?.update_interval !== v) setModified(true);
                            setSource(s => ({ ...s, update_interval: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 3 }}>
                        <NumberInput
                          id="update-interval-time"
                          loading={!source}
                          value={!source ? null : source.update_interval}
                          defaultValue={!defaults ? undefined : (defaults?.update_interval ?? 3600)}
                          reset={showReset(source, defaults, 'update_interval')}
                          endAdornment="sec"
                          min={60}
                          max={86400}
                          validators={v => v.inRange().isInteger()}
                          coercers={c => c.inRange().floor()}
                          onChange={(e, v) => {
                            if (source?.update_interval !== v) setModified(true);
                            setSource(s => ({ ...s, update_interval: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <JSONInput
                          label={t('configuration')}
                          loading={!source}
                          value={!source ? null : source.configuration}
                          onChange={(e, v) => {
                            if (source?.configuration !== v) setModified(true);
                            setSource(s => ({ ...s, configuration: v }));
                          }}
                        />
                      </Grid>

                      {(['ignore_cache', 'override_classification', 'sync'] as const).map(field => (
                        <Grid key={field} size={{ xs: 12, sm: 6 }}>
                          <CheckboxInput
                            label={t(field)}
                            loading={!source}
                            value={!source ? null : source[field]}
                            defaultValue={!defaults ? undefined : defaults?.[field]}
                            reset={showReset(source, defaults, field)}
                            onChange={(e, v) => {
                              if (source?.[field] !== v) setModified(true);
                              setSource(s => ({ ...s, [field]: v }));
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )
              },
              network: {
                label: t('network'),
                icon: (
                  <Badge color="error" variant="dot" invisible={source.uri !== ''}>
                    <SettingsEthernetIcon />
                  </Badge>
                ),
                iconPosition: 'start',
                inner: (
                  <>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <SelectInput
                          label={t('fetch_method')}
                          loading={!source}
                          value={!source ? null : source.fetch_method}
                          defaultValue={!defaults ? undefined : defaults?.fetch_method}
                          reset={showReset(source, defaults, 'fetch_method')}
                          options={FETCH_METHODS.map(method => ({ value: method, primary: method }))}
                          onChange={(e, v) => {
                            if (source?.fetch_method !== v) setModified(true);
                            setSource(s => ({ ...s, fetch_method: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: gitFetch ? 7 : 10 }}>
                        <TextInput
                          label={t('uri')}
                          loading={!source}
                          coercers={c => c.required()}
                          validators={v => v.required()}
                          value={!source ? null : source.uri}
                          defaultValue={!defaults ? undefined : defaults?.uri}
                          reset={showReset(source, defaults, 'uri')}
                          onChange={(e, v) => {
                            if (source?.uri !== v) setModified(true);
                            setSource(s => ({ ...s, uri: v }));
                          }}
                        />
                      </Grid>

                      {gitFetch && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextInput
                            label={t('git_branch')}
                            loading={!source}
                            value={!source ? null : source.git_branch}
                            onChange={(e, v) => {
                              if (source?.git_branch !== v) setModified(true);
                              setSource(s => ({ ...s, git_branch: v }));
                            }}
                          />
                        </Grid>
                      )}

                      {gitFetch && (
                        <Grid size={{ xs: 12 }}>
                          <CheckboxInput
                            label={t('use_managed_identity')}
                            loading={!source}
                            value={!source ? null : source.use_managed_identity}
                            defaultValue={!defaults ? undefined : defaults?.use_managed_identity}
                            reset={showReset(source, defaults, 'use_managed_identity')}
                            onChange={(e, v) => {
                              if (source?.use_managed_identity !== v) setModified(true);
                              setSource(s => ({ ...s, use_managed_identity: v }));
                            }}
                          />
                        </Grid>
                      )}

                      {source.use_managed_identity === false && noManagedIdentity(defaults) && (
                        <>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label={t('username')}
                              loading={!source}
                              value={!source ? null : source.username}
                              defaultValue={!defaults ? undefined : defaults?.username}
                              reset={showReset(source, defaults, 'username')}
                              onChange={(e, v) => {
                                if (source?.username !== v) setModified(true);
                                setSource(s => ({ ...s, username: v }));
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label={t('password')}
                              loading={!source}
                              value={!source ? null : source.password}
                              defaultValue={!defaults ? undefined : defaults?.password}
                              reset={showReset(source, defaults, 'password')}
                              password
                              onChange={(e, v) => {
                                if (source?.password !== v) setModified(true);
                                setSource(s => ({ ...s, password: v }));
                              }}
                            />
                          </Grid>
                        </>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <TextAreaInput
                          label={t('private_key')}
                          loading={!source}
                          value={!source ? null : source.private_key}
                          defaultValue={!defaults ? undefined : defaults?.private_key}
                          reset={showReset(source, defaults, 'private_key')}
                          autoComplete="new-password"
                          rows={6}
                          password
                          monospace
                          onChange={(e, v) => {
                            if (source?.private_key !== v) setModified(true);
                            setSource(s => ({ ...s, private_key: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <JSONInput
                          label={t('headers')}
                          loading={!source}
                          value={!source ? null : Object.fromEntries(source.headers.map(x => [x.name, x.value]))}
                          onChange={(e, v) => {
                            if (source?.headers !== v) setModified(true);
                            setSource(s => ({
                              ...s,
                              headers: Object.entries(v).map(
                                header => ({ name: header[0], value: header[1] }) as EnvironmentVariable
                              )
                            }));
                          }}
                        />
                      </Grid>

                      {postFetch && (
                        <Grid size={{ xs: 12 }}>
                          <TextAreaInput
                            label={t('post_data')}
                            loading={!source}
                            value={!source ? null : source.data}
                            monospace
                            rows={6}
                            onChange={(e, v) => {
                              if (source?.data !== v) setModified(true);
                              setSource(s => ({ ...s, data: v }));
                            }}
                          />
                        </Grid>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          label={t('proxy')}
                          loading={!source}
                          value={!source ? null : source.proxy}
                          defaultValue={!defaults ? undefined : defaults?.proxy}
                          reset={showReset(source, defaults, 'proxy')}
                          placeholder={t('proxy.placeholder')}
                          onChange={(e, v) => {
                            if (source?.proxy !== v) setModified(true);
                            setSource(s => ({ ...s, proxy: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextAreaInput
                          label={t('ca')}
                          loading={!source}
                          value={!source ? null : source.ca_cert}
                          defaultValue={!defaults ? undefined : defaults?.ca_cert}
                          reset={showReset(source, defaults, 'ca_cert')}
                          monospace
                          password
                          rows={6}
                          onChange={(e, v) => {
                            if (source?.ca_cert !== v) setModified(true);
                            setSource(s => ({ ...s, ca_cert: v }));
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <CheckboxInput
                          label={t('ignore_ssl')}
                          loading={!source}
                          value={!source ? null : source.ssl_ignore_errors}
                          defaultValue={!defaults ? undefined : defaults?.ssl_ignore_errors}
                          reset={showReset(source, defaults, 'ssl_ignore_errors')}
                          onChange={(e, v) => {
                            if (source?.ssl_ignore_errors !== v) setModified(true);
                            setSource(s => ({ ...s, ssl_ignore_errors: v }));
                          }}
                        />
                      </Grid>

                      {showDetails && (
                        <div style={{ textAlign: 'center', paddingTop: theme.spacing(3), flexGrow: 1 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {`${t('update.label.last_successful')}: `}
                            {source.status.last_successful_update !== '1970-01-01T00:00:00Z' ? (
                              <Moment variant="fromNow">{source.status.last_successful_update}</Moment>
                            ) : (
                              t('update.never')
                            )}
                          </Typography>
                          <Typography variant="subtitle2" color="textSecondary">
                            {`${t('update.label.status')}: ${source.status.message}`}
                          </Typography>
                        </div>
                      )}
                    </Grid>
                  </>
                )
              }
            }}
          />
        </>
      )
    );
  }
);

const isSourceUpdating = (source: UpdateSource) => source.status.state === 'UPDATING';
const queueSourceUpdate = (source: UpdateSource) => ({
  ...source,
  status: { ...source.status, state: 'UPDATING', message: 'Queued for update..' }
});

export const ManageSignatureSourceDetailPage = memo(() => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/source/:id'>();
  const service = useAppPathParams<'/manage/source/:id'>()?.id;
  const search = useAppSearchSnapshot<'/manage/source/:id'>();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [source, setSource] = useState<UpdateSource>(null);
  const [modified, setModified] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  useAppBlocker(() => (modified ? 'unsaved_changes' : null), [modified]);

  const base = search.get('base');
  const defaults = search.get('defaults');
  const generatesSignatures = search.get('generatesSignatures');

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
        if (!base || !isXL) navigate.here().closePanel(true);
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadUpdateSources')), 1000);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const deleteSource = () => setDeleteDialog(true);

  const executeDeleteSource = () => {
    navigate.here().closePanel(true);
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
      <AppPageCenter>
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
                    nav={nav =>
                      nav.to().create({
                        route: '/manage/signatures',
                        search: {
                          query: `type:${service.toLowerCase()} AND source:${source.name}`
                        }
                      })
                    }
                    style={{
                      color: theme.palette.mode === 'dark' ? '#F' : '#0'
                    }}
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
      </AppPageCenter>
    )
  );
});

export const ManageSignatureSourceDetailRoute = createAppRoute({
  component: ManageSignatureSourceDetailPage,

  path: '/manage/source/:id',
  params: s => ({
    id: s.string()
  }),
  search: s => ({
    base: s.object(null as Partial<UpdateSource>).source('transient'),
    defaults: s.object(null as Partial<UpdateSource>).source('transient'),
    generatesSignatures: s.boolean(null as UpdateConfig['generates_signatures']).source('transient')
  }),

  ancestor: '/manage/sources',
  shortname: location => ({ i18nKey: location?.path?.id ?? 'drawer.manage.source', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.manage.source', ns: 'app' }),
  shorticon: () => null,
  fullicon: () => null,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('signature_manage')
});
