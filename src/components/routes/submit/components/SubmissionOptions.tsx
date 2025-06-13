import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/submit/submit.form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const SubmissionOptions = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  const priorityOptions = useMemo(
    () => [
      { primary: t('options.submission.priority.low'), value: 500 },
      { primary: t('options.submission.priority.medium'), value: 1000 },
      { primary: t('options.submission.priority.high'), value: 1500 }
    ],
    [t]
  );

  return (
    <div>
      <Typography variant="h6">{t('options.submission.title')}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column', padding: theme.spacing(1), paddingBottom: 0 }}>
        <form.Subscribe
          selector={state =>
            [
              state.values.state.phase === 'loading',
              state.values.state.disabled,
              state.values.state.customize,
              state.values.state.phase === 'editing'
            ] as const
          }
          children={([loading, disabled, customize, isEditing]) => (
            <>
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.description;
                  return [
                    state.values.state.tab,
                    state.values.file,
                    state.values.hash.type,
                    state.values.hash.value,
                    param.value,
                    param.default,
                    param.restricted
                  ] as const;
                }}
                children={([tab, file, hashType, hashValue, value, defaultValue, restricted]) => (
                  <TextInput
                    label={t('options.submission.description.label')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
                    reset={value !== defaultValue}
                    placeholder={
                      tab === 'file' && file
                        ? `Inspection of file: ${file?.name}`
                        : tab === 'hash' && hashType
                          ? `Inspection of ${hashType.toUpperCase()}: ${hashValue}`
                          : null
                    }
                    rootProps={{ style: { marginBottom: theme.spacing(1) } }}
                    onChange={(e, v) => form.setFieldValue('settings.description.value', v)}
                    onReset={() => form.setFieldValue('settings.description.value', defaultValue)}
                  />
                )}
              />

              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', columnGap: theme.spacing(1) }}>
                <form.Subscribe
                  selector={state => {
                    const param = state.values.settings.priority;
                    return [param.value, param.default, param.restricted] as const;
                  }}
                  children={([value, defaultValue, restricted]) => (
                    <SelectInput
                      label={t('options.submission.priority.label')}
                      value={value}
                      fullWidth
                      loading={loading}
                      disabled={disabled || !isEditing || (!customize && restricted)}
                      preventRender={!customize && restricted}
                      reset={value !== defaultValue}
                      options={priorityOptions}
                      error={v =>
                        !v
                          ? t('options.submission.priority.error.empty')
                          : !priorityOptions.some(o => o.value === v)
                            ? t('options.submission.priority.error.invalid')
                            : null
                      }
                      rootProps={{ style: { marginBottom: theme.spacing(1), flex: 1 } }}
                      onChange={(e, v) => form.setFieldValue('settings.priority.value', v)}
                      onReset={() => form.setFieldValue('settings.priority.value', defaultValue)}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => {
                    const param = state.values.settings.ttl;
                    return [param.value, param.default, param.restricted] as const;
                  }}
                  children={([value, defaultValue, restricted]) => (
                    <NumberInput
                      label={`${t('options.submission.ttl.label')} (${
                        configuration.submission.max_dtl !== 0
                          ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                          : t('options.submission.ttl.forever')
                      })`}
                      tooltip={t('options.submission.ttl.tooltip')}
                      endAdornment={t('options.submission.ttl.endAdornment')}
                      value={value}
                      loading={loading}
                      disabled={disabled || !isEditing || (!customize && restricted)}
                      preventRender={!customize && restricted}
                      reset={value !== defaultValue}
                      min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                      max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                      rootProps={{ style: { marginBottom: theme.spacing(1), flex: 1 } }}
                      onChange={(e, v) => form.setFieldValue('settings.ttl.value', v)}
                      onReset={() => form.setFieldValue('settings.ttl.value', defaultValue)}
                    />
                  )}
                />
              </div>

              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.generate_alert;
                  return [param.value, param.default, param.restricted] as const;
                }}
                children={([value, defaultValue, restricted]) => (
                  <CheckboxInput
                    label={t('options.submission.generate_alert.label')}
                    tooltip={t('options.submission.generate_alert.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
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
                  return [param.value, param.default, param.restricted] as const;
                }}
                children={([value, defaultValue, restricted]) => (
                  <CheckboxInput
                    label={t('options.submission.ignore_filtering.label')}
                    tooltip={t('options.submission.ignore_filtering.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
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
                  return [param.value, param.default, param.restricted] as const;
                }}
                children={([value, defaultValue, restricted]) => (
                  <CheckboxInput
                    label={t('options.submission.ignore_cache.label')}
                    tooltip={t('options.submission.ignore_cache.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
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
                  return [param.value, param.default, param.restricted] as const;
                }}
                children={([value, defaultValue, restricted]) => (
                  <CheckboxInput
                    label={t('options.submission.ignore_recursion_prevention.label')}
                    tooltip={t('options.submission.ignore_recursion_prevention.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
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
                  return [param.value, param.default, param.restricted] as const;
                }}
                children={([value, defaultValue, restricted]) => (
                  <CheckboxInput
                    label={t('options.submission.deep_scan.label')}
                    tooltip={t('options.submission.deep_scan.tooltip')}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    preventRender={!customize && restricted}
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
      </div>
    </div>
  );
});
