import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission, SubmissionProfileParams } from 'components/models/base/config';
import { UserSettings } from 'components/models/base/user_settings';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { NumberInput } from 'components/routes/submit/inputs/NumberInput';
import { SliderInput } from 'components/routes/submit/inputs/SliderInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const WrappedSubmissionParameters = () => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser, configuration } = useALContext();

  const getProfile = useCallback(
    (settings: UserSettings, profileKey: keyof Submission['profiles']): SubmissionProfileParams => {
      const profile = configuration.submission.profiles[profileKey];
      if (!profile) return null;
      else return profile;
    },
    [configuration.submission.profiles]
  );

  return (
    <form.Subscribe
      selector={state => [
        state.values.submit.isFetchingSettings,
        getProfile(state.values.settings, state.values.profile)
      ]}
      children={props => {
        const loading = props[0] as boolean;
        const profile = props[1] as SubmissionProfileParams;
        const customize = currentUser.roles.includes('submission_customize');

        return (
          <div style={{ textAlign: 'left', marginTop: theme.spacing(2) }}>
            <Typography variant="h6" gutterBottom>
              {t('options.submission')}
            </Typography>

            <form.Field
              name="settings.description"
              children={({ state, handleBlur, handleChange }) => (
                <TextInput
                  label={t('options.submission.desc')}
                  loading={loading}
                  value={state.value}
                  onBlur={handleBlur}
                  onChange={v => handleChange(v)}
                />
              )}
            />

            <form.Field
              name="settings.priority"
              children={({ state, handleBlur, handleChange }) => (
                <SliderInput
                  label={t('options.submission.priority')}
                  value={!customize && !!profile?.priority ? profile?.priority : state.value}
                  loading={loading}
                  disabled={!customize && !!profile?.priority}
                  valueLabelDisplay={'auto'}
                  size="small"
                  min={500}
                  max={1500}
                  marks={[
                    { label: t('options.submission.priority.low'), value: 500 },
                    { label: t('options.submission.priority.medium'), value: 1000 },
                    { label: t('options.submission.priority.high'), value: 1500 }
                  ]}
                  step={null}
                  onBlur={handleBlur}
                  onChange={(_, value: number) => handleChange(value)}
                />
              )}
            />

            <div style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
              <form.Field
                name="settings.generate_alert"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.generate_alert')}
                    value={!customize && !!profile?.generate_alert ? profile?.generate_alert : state.value}
                    loading={loading}
                    disabled={!customize && !!profile?.generate_alert}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />

              <form.Field
                name="settings.ignore_filtering"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.ignore_filtering')}
                    value={!customize && !!profile?.ignore_filtering ? profile?.ignore_filtering : state.value}
                    loading={loading}
                    disabled={!customize && !!profile?.ignore_filtering}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />

              <form.Field
                name="settings.ignore_cache"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.ignore_cache')}
                    value={!customize && !!profile?.ignore_cache ? profile?.ignore_cache : state.value}
                    loading={loading}
                    disabled={!customize && !!profile?.ignore_cache}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />

              <form.Field
                name="settings.ignore_dynamic_recursion_prevention"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.ignore_dynamic_recursion_prevention')}
                    value={
                      !customize && !!profile?.ignore_dynamic_recursion_prevention
                        ? profile?.ignore_dynamic_recursion_prevention
                        : state.value
                    }
                    loading={loading}
                    disabled={!customize && !!profile?.ignore_dynamic_recursion_prevention}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />

              <form.Field
                name="settings.profile"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.profile')}
                    value={!customize && !!profile?.profile ? profile?.profile : state.value}
                    loading={loading}
                    disabled={!customize && !!profile?.profile}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />

              <form.Field
                name="settings.deep_scan"
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    label={t('options.submission.deep_scan')}
                    value={!customize && !!profile?.deep_scan ? profile?.deep_scan : state.value}
                    loading={loading}
                    disabled={!customize && !!profile?.deep_scan}
                    onBlur={handleBlur}
                    onClick={() => handleChange(!state.value)}
                  />
                )}
              />
            </div>

            <form.Field
              name="settings.ttl"
              children={({ state, handleBlur, handleChange }) => (
                <NumberInput
                  label={`${t('options.submission.ttl')} (${
                    configuration.submission.max_dtl !== 0
                      ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                      : t('options.submission.ttl.forever')
                  })`}
                  endAdornment={t('settings:submissions.ttl_days')}
                  value={!customize && 'ttl' in profile ? profile?.ttl : state.value}
                  loading={loading}
                  disabled={!customize && !!profile?.ttl}
                  min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                  max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                  onBlur={handleBlur}
                  onChange={event => handleChange(Number(event.target.value))}
                />
              )}
            />
          </div>
        );
      }}
    />
  );
};

export const SubmissionParameters = React.memo(WrappedSubmissionParameters);
