import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { List } from 'components/visual/List/List';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { ClassificationListInput } from 'components/visual/ListInputs/ClassificationListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const SubmissionSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration, c12nDef } = useALContext();

  return (
    <form.Subscribe
      selector={state =>
        [state.values.state.customize, state.values.state.disabled, state.values.state.loading] as const
      }
      children={([customize, disabled, loading]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.5) }}>
          <PageSection
            id="submissions"
            primary={t('submissions')}
            secondary={t('submissions.description')}
            primaryProps={{ variant: 'h6' }}
            subheader
            anchor
          />

          <List>
            {c12nDef.enforce && (
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.classification;
                  return [param.value, param.default, param.editable] as const;
                }}
                children={([value, defaultValue, editable]) => (
                  <ClassificationListInput
                    id="settings:submissions.classification"
                    primary={t('settings:submissions.classification')}
                    secondary={t('settings:submissions.classification_desc')}
                    value={value || defaultValue}
                    loading={loading}
                    disabled={disabled || !(customize || editable)}
                    onChange={v => form.setFieldValue(`settings.classification.value`, v)}
                  />
                )}
              />
            )}

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ttl;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <NumberListInput
                  id="settings:submissions.ttl"
                  primary={t('settings:submissions.ttl')}
                  secondary={t('settings:submissions.ttl_desc')}
                  endAdornment={t('settings:submissions.ttl_days')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                  max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                  onChange={(event, v) => form.setFieldValue(`settings.ttl.value`, v)}
                  onReset={() => form.setFieldValue(`settings.ttl.value`, defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.deep_scan;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <BooleanListInput
                  id="settings:submissions.deep_scan"
                  primary={t('settings:submissions.deep_scan')}
                  secondary={t('settings:submissions.deep_scan_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.deep_scan.value`, v)}
                  onReset={() => form.setFieldValue(`settings.deep_scan.value`, defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_recursion_prevention;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <BooleanListInput
                  id="settings:submissions.recursion_prevention"
                  primary={t('settings:submissions.recursion_prevention')}
                  secondary={t('settings:submissions.recursion_prevention_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_recursion_prevention.value`, v)}
                  onReset={() => form.setFieldValue(`settings.ignore_recursion_prevention.value`, defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_filtering;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <BooleanListInput
                  id="settings:submissions.filtering"
                  primary={t('settings:submissions.filtering')}
                  secondary={t('settings:submissions.filtering_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_filtering.value`, v)}
                  onReset={() => form.setFieldValue(`settings.ignore_filtering.value`, defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.generate_alert;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <BooleanListInput
                  id="settings:submissions.generate_alert"
                  primary={t('settings:submissions.generate_alert')}
                  secondary={t('settings:submissions.generate_alert_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.generate_alert.value`, v)}
                  onReset={() => form.setFieldValue(`settings.generate_alert.value`, defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_cache;
                return [param.value, param.default, param.editable] as const;
              }}
              children={([value, defaultValue, editable]) => (
                <BooleanListInput
                  id="settings:submissions.result_caching"
                  primary={t('settings:submissions.result_caching')}
                  secondary={t('settings:submissions.result_caching_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_cache.value`, v)}
                  onReset={() => form.setFieldValue(`settings.ignore_cache.value`, defaultValue)}
                />
              )}
            />
          </List>
        </div>
      )}
    />
  );
});
