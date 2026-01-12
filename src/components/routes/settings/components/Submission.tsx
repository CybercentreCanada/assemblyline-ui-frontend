import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { List } from 'components/visual/List/List';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const SubmissionSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  const maxTTL = useMemo<number>(() => {
    if (!configuration?.submission) return 365;
    return configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365;
  }, [configuration]);

  if (!configuration) return null;

  return (
    <form.Subscribe
      selector={state =>
        [state.values.state.customize, state.values.state.disabled, state.values.state.loading] as const
      }
    >
      {([customize, disabled, loading]) => (
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
            {/* TTL */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ttl;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <NumberListInput
                  id="settings:submissions.ttl"
                  primary={t('settings:submissions.ttl')}
                  secondary={t('settings:submissions.ttl_desc')}
                  endAdornment={t('settings:submissions.ttl_days')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  min={maxTTL !== 0 ? 1 : 0}
                  max={maxTTL}
                  required
                  onChange={(event, v) => form.setFieldValue(`settings.ttl.value`, v)}
                  onBlur={() => {
                    if (value === null) form.setFieldValue(`settings.ttl.value`, defaultValue);
                  }}
                />
              )}
            </form.Subscribe>

            {/* Deep Scan */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.deep_scan;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <BooleanListInput
                  id="settings:submissions.deep_scan"
                  primary={t('settings:submissions.deep_scan')}
                  secondary={t('settings:submissions.deep_scan_desc')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.deep_scan.value`, v)}
                />
              )}
            </form.Subscribe>

            {/* Ignore Recursion Prevention */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_recursion_prevention;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <BooleanListInput
                  id="settings:submissions.ignore_recursion_prevention"
                  primary={t('settings:submissions.ignore_recursion_prevention')}
                  secondary={t('settings:submissions.ignore_recursion_prevention_desc')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_recursion_prevention.value`, v)}
                />
              )}
            </form.Subscribe>

            {/* Ignore Filtering */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_filtering;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <BooleanListInput
                  id="settings:submissions.ignore_filtering"
                  primary={t('settings:submissions.ignore_filtering')}
                  secondary={t('settings:submissions.ignore_filtering_desc')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_filtering.value`, v)}
                />
              )}
            </form.Subscribe>

            {/* Generate Alert */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.generate_alert;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <BooleanListInput
                  id="settings:submissions.generate_alert"
                  primary={t('settings:submissions.generate_alert')}
                  secondary={t('settings:submissions.generate_alert_desc')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.generate_alert.value`, v)}
                />
              )}
            </form.Subscribe>

            {/* Ignore Cache */}
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_cache;
                return [param.value, param.default, param.restricted] as const;
              }}
            >
              {([value, defaultValue, restricted]) => (
                <BooleanListInput
                  id="settings:submissions.ignore_cache"
                  primary={t('settings:submissions.ignore_cache')}
                  secondary={t('settings:submissions.ignore_cache_desc')}
                  value={value}
                  defaultValue={defaultValue}
                  loading={loading}
                  disabled={disabled || (!customize && restricted)}
                  reset={defaultValue !== null && value !== defaultValue}
                  onChange={(event, v) => form.setFieldValue(`settings.ignore_cache.value`, v)}
                />
              )}
            </form.Subscribe>
          </List>
        </div>
      )}
    </form.Subscribe>
  );
});

SubmissionSection.displayName = 'SubmissionSection';
