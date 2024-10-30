import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { NumberInput } from 'components/routes/submit/inputs/NumberInput';
import { SliderInput } from 'components/routes/submit/inputs/SliderInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

const WrappedSubmissionParameters = () => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser, configuration } = useALContext();

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
            loading={!form.state.values.settings}
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
            loading={!form.state.values.settings}
            value={state.value}
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
            // disabled={
            //   !currentUser.roles.includes('submission_customize') &&
            //   form.state.values.submissionProfile?.priority !== undefined
            // }
          />
        )}
      />

      <div style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
        <form.Field
          name="settings.generate_alert"
          children={({ state, handleBlur, handleChange }) => (
            <BooleanInput
              label={t('options.submission.generate_alert')}
              loading={!form.state.values.settings}
              value={state.value}
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
              loading={!form.state.values.settings}
              value={state.value}
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
              loading={!form.state.values.settings}
              value={state.value}
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
              loading={!form.state.values.settings}
              value={state.value}
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
              loading={!form.state.values.settings}
              value={state.value}
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
              loading={!form.state.values.settings}
              value={state.value}
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
            loading={!form.state.values.settings}
            min={configuration.submission.max_dtl !== 0 ? 1 : 0}
            max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
            value={state.value}
            onBlur={handleBlur}
            onChange={event => handleChange(Number(event.target.value))}
          />
        )}
      />
    </div>
  );
};

export const SubmissionParameters = React.memo(WrappedSubmissionParameters);
