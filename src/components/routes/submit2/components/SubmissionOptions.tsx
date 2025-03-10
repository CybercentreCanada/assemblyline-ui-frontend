import { Grid, Paper, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/submit2/submit.form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import React from 'react';
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
