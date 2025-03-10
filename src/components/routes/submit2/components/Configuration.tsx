import { FormHelperText, Grid, Paper, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import { useForm } from 'components/routes/submit2/submit.form';
import { isValidJSON } from 'components/routes/submit2/submit.utils';
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
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const SubmissionOptions = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <div>
      <Typography variant="h6">{t('options.submission.title')}</Typography>
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        <form.Subscribe
          selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.customize]}
          children={([loading, disabled, customize]) => (
            <>
              <form.Subscribe
                selector={state => {
                  let placeholder = '';
                  if (state.values.state.tab === 'file' && state.values.file) {
                    placeholder = `Inspection of file: ${state.values?.file?.name}`;
                  } else if (state.values.state.tab === 'hash' && state.values.hash.type) {
                    placeholder = `Inspection of ${state.values.hash.type.toUpperCase()}: ${state.values.hash.value}`;
                  }

                  const param = state.values.settings.description;
                  return [param.value, param.default, param.editable, placeholder];
                }}
                children={([value, defaultValue, editable, placeholder]) => (
                  <TextInput
                    label={t('options.submission.description.label')}
                    value={value as string}
                    loading={loading}
                    disabled={disabled || (!customize && !editable)}
                    reset={value !== defaultValue}
                    placeholder={placeholder as string}
                    rootProps={{ style: { margin: theme.spacing(1) } }}
                    onChange={(e, v) => form.setFieldValue('settings.description.value', v)}
                    onReset={() => form.setFieldValue('settings.description.value', defaultValue as string)}
                  />
                )}
              />

              <Grid container>
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
                          label={t('options.submission.priority.label')}
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
                          rootProps={{ style: { margin: theme.spacing(1) } }}
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
                        label={`${t('options.submission.ttl.label')} (${
                          configuration.submission.max_dtl !== 0
                            ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                            : t('options.submission.ttl.forever')
                        })`}
                        tooltip={t('options.submission.ttl.tooltip')}
                        endAdornment={t('options.submission.ttl.endAdornment')}
                        value={value as number}
                        loading={loading}
                        disabled={disabled || (!customize && !editable)}
                        reset={value !== defaultValue}
                        min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                        max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                        rootProps={{ style: { margin: theme.spacing(1) } }}
                        onChange={(e, v) => form.setFieldValue('settings.ttl.value', v)}
                        onReset={() => form.setFieldValue('settings.ttl.value', defaultValue as number)}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.generate_alert;
                  return [param.value, param.default, param.editable];
                }}
                children={([value, defaultValue, editable]) => (
                  <CheckboxInput
                    label={t('options.submission.generate_alert.label')}
                    tooltip={t('options.submission.generate_alert.tooltip')}
                    value={value}
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
                    label={t('options.submission.ignore_filtering.label')}
                    tooltip={t('options.submission.ignore_filtering.tooltip')}
                    value={value}
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
                    label={t('options.submission.ignore_cache.label')}
                    tooltip={t('options.submission.ignore_cache.tooltip')}
                    value={value}
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
                    label={t('options.submission.ignore_recursion_prevention.label')}
                    tooltip={t('options.submission.ignore_recursion_prevention.tooltip')}
                    value={value}
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
                    label={t('options.submission.deep_scan.label')}
                    tooltip={t('options.submission.deep_scan.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || (!customize && !editable)}
                    reset={value !== defaultValue}
                    labelProps={{ color: 'textPrimary' }}
                    onChange={(e, v) => form.setFieldValue('settings.deep_scan.value', v)}
                    onReset={() => form.setFieldValue('settings.deep_scan.value', defaultValue)}
                  />
                )}
              />
            </>
          )}
        />
      </Paper>
    </div>
  );
});

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  loading?: boolean;
  disabled?: boolean;
};

export const MetadataParam: React.FC<MetadataParamParam> = React.memo(
  ({ name, metadata, loading = false, disabled = false }) => {
    const { t } = useTranslation(['submit', 'settings']);
    const theme = useTheme();
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
        id: `metadata-${name.replace('_', ' ')}`,
        label: `${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`,
        labelProps: { textTransform: 'capitalize' },
        disabled: disabled,
        loading: loading,
        width: '60%',
        rootProps: { style: { margin: theme.spacing(1) } },
        onChange: (e, v) => handleChange(v),
        onReset: () => handleReset()
      }),
      [disabled, handleChange, handleReset, loading, metadata.validator_type, name, theme]
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
                  min={metadata?.validator_params?.min as number}
                  max={metadata?.validator_params?.max as number}
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
                  tooltip={(metadata?.validator_params?.validation_regex || null) as string}
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

export const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <div>
      <Typography variant="h6">{t('options.metadata.title')}</Typography>
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        {Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
          <MetadataParam key={name} name={name} metadata={metadata} />
        ))}

        <form.Subscribe
          selector={state => [
            state.values.state.disabled,
            state.values.metadata.extra,
            isValidJSON(state.values.metadata.extra)
          ]}
          children={([disabled, data, error]) => (
            <div
              style={{
                minHeight: `${8 * 19 + 20}px`,
                display: 'flex',
                flexDirection: 'column',
                margin: theme.spacing(1)
              }}
            >
              <Typography color={error ? 'error' : 'textSecondary'} variant="body2">
                {t('options.metadata.extra.label')}
              </Typography>
              <MonacoEditor
                language="json"
                value={data as string}
                error={!!error}
                options={{ readOnly: disabled as boolean }}
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
      </Paper>
    </div>
  );
});
