import type { PaperProps, TypographyProps } from '@mui/material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Grid,
  ListItemText,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { APIResponseProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/config';
import type { Submission } from 'components/models/base/submission';
import { applySubmissionProfile } from 'components/routes/submit/submit.utils';
import type { SubmitStore } from 'components/routes/submit2/submit.form';
import { FLOW, useForm } from 'components/routes/submit2/submit.form';
import { isSubmissionValid, isValidJSON } from 'components/routes/submit2/submit.utils';
import { ByteNumber } from 'components/visual/ByteNumber';
import Classification from 'components/visual/Classification';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import type { NumberInputProps } from 'components/visual/Inputs/NumberInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import type { SelectInputProps } from 'components/visual/Inputs/SelectInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import type { SwitchInputProps } from 'components/visual/Inputs/SwitchInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import type { TextInputProps } from 'components/visual/Inputs/TextInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import { isURL } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

type SectionProps = PaperProps & {
  primary: TypographyProps['children'];
  primaryProps?: TypographyProps;
};

const Section = React.memo(({ primary, primaryProps, children, ...props }: SectionProps) => {
  const theme = useTheme();

  return (
    <div>
      <Typography color="textSecondary" variant="body2" {...primaryProps}>
        {primary}
      </Typography>
      <Paper
        variant="outlined"
        {...props}
        sx={{
          backgroundColor: theme.palette.background.default,
          overflow: 'hidden',
          wordBreak: 'break-word',
          ...props?.sx
        }}
      >
        {children}
      </Paper>
    </div>
  );
});

const Title = React.memo(() => {
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, state.values.file, state.values.hash.type, state.values.hash.value]}
      children={props => {
        const tab = props[0] as SubmitStore['state']['tab'];
        const file = props[1] as SubmitStore['file'];
        const type = props[2] as SubmitStore['hash']['type'];
        const hash = props[3] as SubmitStore['hash']['value'];

        return (
          <DialogTitle>
            <ListItemText
              primary={
                <>
                  {tab === 'file' ? 'File' : <span style={{ textTransform: 'uppercase' }}>{type}</span>}
                  <span>{' Analysis Confirmation'}</span>
                </>
              }
              secondary={
                tab === 'file' ? (
                  <>
                    {file.name}
                    {' ('}
                    <ByteNumber component="span" bytes={file.size} variant="body2" />
                    {')'}
                  </>
                ) : (
                  hash
                )
              }
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </DialogTitle>
        );
      }}
    />
  );
});

const ClassificationInfo = React.memo(() => {
  const { user: currentUser, c12nDef } = useALContext();
  const form = useForm();

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state => state.values?.settings?.classification?.value}
      children={c12n =>
        !c12n ? null : (
          <Classification
            format="long"
            type="picker"
            size="small"
            c12n={c12n}
            setClassification={v => form.setFieldValue('settings.classification.value', v)}
            disabled={!currentUser.roles.includes('submission_create')}
          />
        )
      }
    />
  );
});

const SubmissionOptions = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.customize]}
      children={([loading, disabled, customize]) => (
        <>
          <form.Subscribe
            selector={state => {
              const param = state.values.settings.description;
              return [param.value, param.default, param.editable];
            }}
            children={([value, defaultValue, editable]) => (
              <TextInput
                label={t('options.submission.desc')}
                value={value as string}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                reset={value !== defaultValue}
                error={v => (v ? null : t('options.submission.desc.error'))}
                onChange={(e, v) => form.setFieldValue('settings.description.value', v)}
                onReset={() => form.setFieldValue('settings.description.value', defaultValue as string)}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.priority;
                  return [param.value, param.default, param.editable];
                }}
                children={([value, defaultValue, editable]) => {
                  const options = [
                    { primary: t('options.submission.priority.low'), value: 500 },
                    { primary: t('options.submission.priority.medium'), value: 1000 },
                    { primary: t('options.submission.priority.high'), value: 1500 }
                  ];

                  return (
                    <SelectInput
                      label={t('options.submission.priority')}
                      value={value as number}
                      fullWidth
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      reset={value !== defaultValue}
                      options={options}
                      error={v =>
                        !v
                          ? t('options.submission.priority.error.empty')
                          : !options.some(o => o.value === v)
                          ? t('options.submission.priority.error.invalid')
                          : null
                      }
                      onChange={(e, v) => form.setFieldValue('settings.priority.value', v as number)}
                      onReset={() => form.setFieldValue('settings.priority.value', defaultValue as number)}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.ttl;
                  return [param.value, param.default, param.editable];
                }}
                children={([value, defaultValue, editable]) => (
                  <NumberInput
                    label={`${t('options.submission.ttl')} (${
                      configuration.submission.max_dtl !== 0
                        ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                        : t('options.submission.ttl.forever')
                    })`}
                    tooltip={t('settings:submissions.ttl_desc')}
                    endAdornment={t('settings:submissions.ttl_days')}
                    value={value as number}
                    loading={loading}
                    disabled={disabled || (!customize && !editable)}
                    reset={value !== defaultValue}
                    min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                    max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                    onChange={(e, v) => form.setFieldValue('settings.ttl.value', v)}
                    onReset={() => form.setFieldValue('settings.ttl.value', defaultValue as number)}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Section primary={t('settings:submissions')} sx={{ padding: `${theme.spacing(1)} 0` }}>
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.generate_alert;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.generate_alert')}
                  tooltip={t('settings:submissions.generate_alert_desc')}
                  value={value}
                  tiny
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.generate_alert.value', v)}
                  onReset={() => form.setFieldValue('settings.generate_alert.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_filtering;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_filtering')}
                  tooltip={t('settings:submissions.filtering_desc')}
                  value={value}
                  tiny
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_filtering.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_filtering.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_cache;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_cache')}
                  tooltip={t('settings:submissions.result_caching_desc')}
                  value={value}
                  tiny
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_cache.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_cache.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_recursion_prevention;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_recursion_prevention')}
                  tooltip={t('settings:submissions.recursion_prevention_desc')}
                  value={value}
                  tiny
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_recursion_prevention.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_recursion_prevention.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.deep_scan;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.deep_scan')}
                  tooltip={t('settings:submissions.deep_scan_desc')}
                  value={value}
                  tiny
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.deep_scan.value', v)}
                  onReset={() => form.setFieldValue('settings.deep_scan.value', defaultValue)}
                />
              )}
            />
          </Section>
        </>
      )}
    />
  );
});

const SupplementaryOptions = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.customize]}
      children={([loading, disabled, customize]) => (
        <Section primary={'Supplementary Options'} sx={{ padding: `${theme.spacing(1)} 0` }}>
          <form.Subscribe
            selector={state => [state.values.state.tab === 'file', state.values.settings.malicious.value]}
            children={([render, value]) => (
              <SwitchInput
                label={t('malicious')}
                labelProps={{ color: 'textPrimary' }}
                tooltip={t('malicious.tooltip')}
                value={value}
                tiny
                loading={loading}
                disabled={disabled}
                preventRender={!render}
                onChange={(e, v) => form.setFieldValue('settings.malicious.value', v)}
              />
            )}
          />

          <form.Subscribe
            selector={state => [
              state.values.state.tab === 'hash',
              ...((configuration.submission.file_sources?.[state.values.state.tab]?.sources || []) as string[])
            ]}
            children={([render, ...sources]) =>
              !render || sources.length === 0 ? null : (
                <>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                    margin={`${theme.spacing(0.5)} ${theme.spacing(1)}`}
                  >
                    {'Select the following external sources'}
                  </Typography>
                  {sources.map((source: string, i) => (
                    <form.Subscribe
                      key={`${source}-${i}`}
                      selector={state =>
                        state.values?.settings?.default_external_sources?.value?.indexOf(source) !== -1
                      }
                      children={value => (
                        <CheckboxInput
                          key={i}
                          id={`source-${source.replace('_', ' ')}`}
                          label={source.replace('_', ' ')}
                          labelProps={{ color: 'textPrimary' }}
                          value={value}
                          loading={loading}
                          disabled={disabled}
                          tiny
                          onChange={() => {
                            if (!form.getFieldValue('settings')) return;

                            const newSources = form.getFieldValue('settings.default_external_sources.value');
                            if (newSources.indexOf(source) === -1) newSources.push(source);
                            else newSources.splice(newSources.indexOf(source), 1);

                            form.setFieldValue('settings.default_external_sources.value', newSources);
                          }}
                        />
                      )}
                    />
                  ))}
                </>
              )
            }
          />

          <form.Subscribe
            selector={state => [
              state.values.settings.services,
              state.values.state.tab === 'hash' &&
                state.values.hash.type === 'url' &&
                state.values.settings.services.some(cat =>
                  cat.services.some(svr => configuration?.ui?.url_submission_auto_service_selection?.includes(svr.name))
                )
            ]}
            children={([services, render]) =>
              !render ? null : (
                <>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                    margin={`${theme.spacing(0.5)} ${theme.spacing(1)}`}
                  >
                    {t('options.submission.url_submission_auto_service_selection')}
                  </Typography>
                  {(services as SubmitStore['settings']['services'])
                    .reduce((prev: [number, number][], category, i) => {
                      category.services.forEach((service, j) => {
                        if (configuration?.ui?.url_submission_auto_service_selection?.includes(service.name))
                          prev.push([i, j]);
                      });
                      return prev;
                    }, [])
                    .map(([cat, svr], i) => (
                      <form.Subscribe
                        key={i}
                        selector={state => {
                          const service = state.values.settings.services[cat].services[svr];
                          return [service.name, service.selected];
                        }}
                        children={([name, selected]) => (
                          <CheckboxInput
                            key={i}
                            id={`url_submission_auto_service_selection-${(name as string).replace('_', ' ')}`}
                            label={(name as string).replace('_', ' ')}
                            labelProps={{ textTransform: 'capitalize', color: 'textPrimary' }}
                            value={selected as boolean}
                            loading={loading}
                            disabled={disabled || !customize}
                            tiny
                            onChange={() => {
                              form.setFieldValue('settings', s => {
                                s.services[cat].services[svr].selected = !selected;
                                s.services[cat].selected = s.services[cat].services.every(val => val.selected);
                                return s;
                              });
                            }}
                          />
                        )}
                      />
                    ))}
                </>
              )
            }
          />
        </Section>
      )}
    />
  );
});

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  loading?: boolean;
  disabled?: boolean;
};

const MetadataParam: React.FC<MetadataParamParam> = React.memo(
  ({ name, metadata, loading = false, disabled = false }) => {
    const { t } = useTranslation(['submit', 'settings']);
    const form = useForm();
    const { apiCall } = useMyAPI();

    const [options, setOptions] = useState([...new Set(metadata.suggestions)].sort());

    const handleValid = useCallback(
      (value: unknown): string => {
        if (!value) return metadata.required ? t('required') : null;

        if (metadata.validator_type === 'uri' && !isURL((value || '') as string)) return t('invalid_url');

        if (
          metadata.validator_type === 'regex' &&
          !((value || '') as string).match(new RegExp(metadata.validator_params.validation_regex as string))
        )
          return t('invalid_regex');

        return null;
      },
      [metadata.required, metadata.validator_params.validation_regex, metadata.validator_type, t]
    );

    const handleChange = useCallback(
      (value: unknown) => {
        form.setFieldValue(`metadata.config`, m => (!value ? _.omit(m || {}, name) : { ...m, [name]: value }));
      },
      [form, name]
    );

    const handleReset = useCallback(() => {
      form.setFieldValue(`metadata.config`, m => _.omit(m || {}, name));
    }, [form, name]);

    useEffect(() => {
      if (disabled || metadata.validator_type in ['enum', 'boolean', 'integer', 'date']) return;
      apiCall<string[]>({
        url: `/api/v4/search/facet/submission/metadata.${name}/`,
        onSuccess: api_data => setOptions(o => [...new Set([...o, ...Object.keys(api_data.api_response)])].sort()),
        onFailure: () => null
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadata.validator_type, name, disabled]);

    const props = useMemo<unknown>(
      () => ({
        disabled: disabled,
        id: `metadata-${name.replace('_', ' ')}`,
        loading: loading,
        label: `${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`,
        labelProps: { textTransform: 'capitalize' },
        width: '60%',
        tiny: true,
        onChange: (e, v) => handleChange(v),
        onReset: () => handleReset()
      }),
      [disabled, handleChange, handleReset, loading, metadata.validator_type, name]
    );

    return (
      <form.Subscribe
        selector={state => state.values?.metadata?.config?.[name]}
        children={value => {
          switch (metadata.validator_type) {
            case 'boolean':
              return (
                <SwitchInput {...(props as SwitchInputProps)} value={(value as boolean) || false} reset={!!value} />
              );
            case 'date':
              return (
                <DateInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={value as string}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
            case 'enum':
              return (
                <SelectInput
                  {...(props as SelectInputProps)}
                  value={(value as string) || ''}
                  options={(metadata.validator_params.values as string[])
                    .map(key => ({ primary: key.replaceAll('_', ' '), value: key }))
                    .sort()}
                  reset={!!value}
                />
              );
            case 'integer':
              return (
                <NumberInput
                  {...(props as NumberInputProps)}
                  value={value as number}
                  min={metadata?.validator_params?.min}
                  max={metadata?.validator_params?.max}
                  reset={!!value}
                />
              );
            case 'regex':
              return (
                <TextInput
                  {...(props as TextInputProps)}
                  value={(value as string) || ''}
                  options={options}
                  reset={!!value}
                  error={v => handleValid(v)}
                  tooltip={metadata?.validator_params?.validation_regex || null}
                  tooltipProps={{ placement: 'right' }}
                />
              );
            default:
              return (
                <TextInput
                  {...(props as TextInputProps)}
                  value={(value as string) || ''}
                  options={options}
                  reset={!!value}
                  error={v => handleValid(v)}
                />
              );
          }
        }}
      />
    );
  }
);

const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.customize,
        state.values.state.confirmation
      ]}
      children={([loading, disabled, customize]) => {
        return !open ? null : (
          <Section primary={t('options.submission.metadata')} sx={{}}>
            <div
              style={{ padding: theme.spacing(1), display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}
            >
              {Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
                <MetadataParam key={name} name={name} metadata={metadata} loading={loading} disabled={disabled} />
              ))}

              <form.Subscribe
                selector={state => [state.values.metadata.extra, isValidJSON(state.values.metadata.extra)]}
                children={([data, error]) => (
                  <div style={{ minHeight: `${8 * 19 + 20}px`, display: 'flex', flexDirection: 'column' }}>
                    <Typography color={error ? 'error' : 'textSecondary'} variant="body2">
                      {'Extra'}
                    </Typography>
                    <MonacoEditor
                      language="json"
                      value={data}
                      error={!!error}
                      options={{ readOnly: disabled || !customize }}
                      onChange={v => form.setFieldValue('metadata.extra', v)}
                    />
                    {error && (
                      <FormHelperText variant="outlined" sx={{ color: theme.palette.error.main }}>
                        {error}
                      </FormHelperText>
                    )}
                  </div>
                )}
              />
            </div>
          </Section>
        );
      }}
    />
  );
});

const SelectedServices = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <Section
      primary={'Selected Services'}
      sx={{
        padding: theme.spacing(1),
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(0.5)
      }}
    >
      <form.Subscribe
        selector={state => state.values.settings.services}
        children={categories =>
          !open
            ? null
            : categories.map((cat, i) => (
                <form.Subscribe
                  key={`${cat.name}-${i}`}
                  selector={state => [state.values.settings.services[i].selected]}
                  children={([catSelected]) =>
                    !catSelected ? null : (
                      <div key={`${cat.name}-${i}`} style={{ display: 'contents' }}>
                        <Typography color="textSecondary" variant="body2">
                          {cat.name}
                        </Typography>
                        <Typography variant="body2">
                          <form.Subscribe
                            key={`${cat.name}-${i}`}
                            selector={state =>
                              state.values.settings.services[i].services
                                .filter(svr => svr.selected)
                                .map(svr => svr.name)
                            }
                            children={services => services.join(', ')}
                          />
                        </Typography>
                      </div>
                    )
                  }
                />
              ))
        }
      />
    </Section>
  );
});

const ServiceParameters = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <Section
      primary={'Modified Service Parameters'}
      sx={{
        padding: theme.spacing(1),
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(1)
      }}
    >
      <form.Subscribe
        selector={state => state.values.settings.service_spec}
        children={specs =>
          !open
            ? null
            : specs.map((spec, i) => (
                <form.Subscribe
                  key={`${spec.name}-${i}`}
                  selector={state =>
                    state.values.settings.service_spec[i].params.some(param => param.value !== param.default)
                  }
                  children={hasParams =>
                    !hasParams ? null : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography color="textSecondary" variant="body2">
                          {spec.name}
                        </Typography>

                        {spec.params.map((param, j) => (
                          <form.Subscribe
                            key={`${spec.name}-${param.name}-${j}`}
                            selector={state => {
                              const p = state.values.settings.service_spec[i].params[j];
                              return p.value !== p.default;
                            }}
                            children={hasParam =>
                              !hasParam ? null : (
                                <div key={`${param.name}-${j}`}>
                                  <Typography component="span" variant="body2" textTransform="capitalize">
                                    {`${param.name.replace(/_/g, ' ')}: `}
                                  </Typography>

                                  {(() => {
                                    switch (param.type) {
                                      case 'bool':
                                        return (
                                          <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                              color:
                                                theme.palette.mode === 'dark'
                                                  ? theme.palette.info.light
                                                  : theme.palette.info.dark
                                            }}
                                          >
                                            {param.value ? 'true' : 'false'}
                                          </Typography>
                                        );
                                      case 'int':
                                        return (
                                          <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                              color:
                                                theme.palette.mode === 'dark'
                                                  ? theme.palette.success.light
                                                  : theme.palette.success.dark
                                            }}
                                          >
                                            {param.value}
                                          </Typography>
                                        );
                                      case 'str':
                                        return (
                                          <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                              color:
                                                theme.palette.mode === 'dark'
                                                  ? theme.palette.warning.light
                                                  : theme.palette.warning.dark
                                            }}
                                          >
                                            {`"${param.value}"`}
                                          </Typography>
                                        );
                                      case 'list':
                                        return (
                                          <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                              color:
                                                theme.palette.mode === 'dark'
                                                  ? theme.palette.warning.dark
                                                  : theme.palette.warning.light
                                            }}
                                          >
                                            {`"${param.value}"`}
                                          </Typography>
                                        );
                                    }
                                  })()}
                                </div>
                              )
                            }
                          />
                        ))}
                      </div>
                    )
                  }
                />
              ))
        }
      />
    </Section>
  );
});

const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <DialogContentText variant="body2" sx={{ textAlign: 'center' }}>
      {t('terms1')}
      <i>{t('urlHash.button')}</i>
      {t('terms2')}
      <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
        {t('terms3')}
      </Link>
      .
    </DialogContentText>
  );
});

const AnalyzeButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { user: currentUser, configuration } = useALContext();

  const handleCancel = useCallback(() => {
    form.setStore(s => {
      s.file = null;
      s.state.isUploading = false;
      s.state.uploadProgress = null;
      s.state.uuid = generateUUID();
      return s;
    });
    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  const handleSubmitFile = useCallback(
    () => {
      const file = form.getFieldValue('file');
      const metadata = form.getFieldValue('metadata');
      const settings = form.getFieldValue('settings');
      const size = form.getFieldValue('file.size');
      const submissionProfile = form.getFieldValue('state.profile');
      const uuid = form.getFieldValue('state.uuid');

      form.setStore(s => {
        s.state.disabled = true;
        s.state.isUploading = true;
        s.state.uploadProgress = 0;
        return s;
      });

      FLOW.opts.generateUniqueIdentifier = selectedFile => {
        const relativePath =
          selectedFile?.relativePath ||
          selectedFile?.file?.webkitRelativePath ||
          selectedFile?.file?.name ||
          selectedFile?.name;
        return `${uuid}_${size}_${relativePath.replace(/[^0-9a-zA-Z_-]/gim, '')}`;
      };

      FLOW.on('fileError', (event, api_data) => {
        try {
          const data = JSON.parse(api_data) as APIResponseProps<unknown>;
          if ('api_status_code' in data) {
            if (
              data.api_status_code === 401 ||
              (data.api_status_code === 503 &&
                data.api_error_message.includes('quota') &&
                data.api_error_message.includes('daily') &&
                data.api_error_message.includes('API'))
            ) {
              window.location.reload();
            } else {
              // Unexpected error occurred, cancel upload and show error message
              handleCancel();
              showErrorMessage(t('submit.file.upload_fail'));
            }
          }
        } catch (ex) {
          handleCancel();
          showErrorMessage(t('submit.file.upload_fail'));
        }
      });

      FLOW.on('progress', () => {
        form.setStore(s => {
          s.state.uploadProgress = Math.trunc(FLOW.progress() * 100);
          return s;
        });
      });

      FLOW.on('complete', () => {
        if (FLOW.files.length === 0) {
          return;
        }

        for (let x = 0; x < FLOW.files.length; x++) {
          if (FLOW.files[x].error) {
            return;
          }
        }
        apiCall<{ started: boolean; sid: string }>({
          url: `/api/v4/ui/start/${uuid}/`,
          method: 'POST',
          body: {
            ...applySubmissionProfile(settings, submissionProfile),
            submission_profile: submissionProfile,
            filename: file.path,
            metadata: metadata
          },
          onSuccess: ({ api_response }) => {
            showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
            setTimeout(() => {
              navigate(`/submission/detail/${api_response.sid}`);
            }, 500);
          },
          onFailure: ({ api_status_code, api_error_message }) => {
            if (api_status_code === 400 && api_error_message.includes('metadata')) {
              form.setStore(s => {
                s.state.disabled = false;
                s.state.tab = 'options';
                return s;
              });
            }

            if ([400, 403, 404, 503].includes(api_status_code)) {
              showErrorMessage(api_error_message);
            } else {
              showErrorMessage(t('submit.file.failure'));
            }

            handleCancel();
          }
        });
      });

      FLOW.addFile(file);
      FLOW.upload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, handleCancel, t]
  );

  const handleSubmitHash = useCallback(
    (store: SubmitStore) => {
      if (store.hash.hasError) {
        showErrorMessage(t(`submit.${configuration.ui.allow_url_submissions ? 'urlhash' : 'hash'}.error`));
        return;
      }

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: applySubmissionProfile(store.settings, store.state.profile),
          submission_profile: store.state.profile,
          [store.hash.type]: store.hash.value,
          metadata: store.metadata
        },
        onSuccess: ({ api_response }) => {
          showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
          form.setStore(s => {
            s.state.disabled = false;
            s.state.isUploading = false;
            s.state.isConfirmationOpen = false;
            return s;
          });
          setTimeout(() => {
            navigate(`/submission/detail/${api_response.sid}`);
          }, 500);
        },
        onFailure: ({ api_status_code, api_error_message }) => {
          showErrorMessage(api_error_message);
          if (api_status_code === 400 && api_error_message.includes('metadata')) {
            form.setStore(s => {
              s.state.tab = 'options';
              return s;
            });
          }

          form.setStore(s => {
            s.hash.hasError = true;
            s.state.disabled = false;
            s.state.isUploading = false;
            s.state.isConfirmationOpen = false;
            return s;
          });
        },
        onEnter: () => {
          form.setStore(s => {
            s.state.disabled = true;
            s.state.isUploading = true;
            return s;
          });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuration.ui.allow_url_submissions, currentUser, form, t]
  );

  return (
    <form.Subscribe
      selector={state => [isSubmissionValid(state.values, configuration)]}
      children={([valid]) => (
        <Button disabled={!valid} onClick={() => {}}>
          {t('analyze')}
        </Button>
      )}
    />
  );
});

export const AnalysisConfirmation = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.confirmation]}
      children={([open]) => {
        return (
          <Dialog fullWidth maxWidth="md" open={open} onClose={() => form.setFieldValue('state.confirmation', false)}>
            <Title />

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1.5) }}>
              <ClassificationInfo />
              <SubmissionOptions />
              <SupplementaryOptions />
              <SubmissionMetadata />
              <SelectedServices />
              <ServiceParameters />
            </DialogContent>

            <ToS />

            <DialogActions>
              <Button onClick={() => form.setFieldValue('state.confirmation', false)}>{t('cancel')}</Button>
              <AnalyzeButton />
            </DialogActions>
          </Dialog>
        );
      }}
    />
  );
});
