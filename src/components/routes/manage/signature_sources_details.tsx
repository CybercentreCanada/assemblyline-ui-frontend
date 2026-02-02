import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { Grid, Typography, useTheme } from '@mui/material';
import Badge from '@mui/material/Badge';
import useALContext from 'components/hooks/useALContext';
import type { EnvironmentVariable, UpdateSource, UpdateSourceCommon } from 'components/models/base/service';
import { FETCH_METHODS } from 'components/models/base/service';
import { showReset } from 'components/routes/admin/service_detail/service.utils';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { ClassificationInput } from 'components/visual/Inputs/ClassificationInput';
import { JSONInput } from 'components/visual/Inputs/JSONInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { TextAreaInput } from 'components/visual/Inputs/TextAreaInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import Moment from 'components/visual/Moment';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  source: UpdateSource;
  defaults: UpdateSource;
  addMode: boolean;
  showDetails: boolean;
  setSource: React.Dispatch<React.SetStateAction<UpdateSource>>;
  setModified: React.Dispatch<React.SetStateAction<boolean>>;
};

const WrappedSourceDetail = ({
  source,
  defaults,
  setSource,
  addMode = false,
  setModified = null,
  showDetails = true
}: Props) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const { c12nDef } = useALContext();

  const gitFetch = useMemo<boolean>(() => source.fetch_method === 'GIT', [source.fetch_method]);
  const postFetch = useMemo<boolean>(() => source.fetch_method === 'POST', [source.fetch_method]);

  const noManagedIdentity = useCallback(
    (
      src: UpdateSource
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
                        validate={value => (value !== '' ? null : { status: 'error', message: t('name.error') })}
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
                        coercers={c => c.required()}
                        validators={v => v.required()}
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
                        validate={value => (value !== '' ? null : { status: 'error', message: t('uri.error') })}
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
};

export const SourceDetail = React.memo(WrappedSourceDetail);
