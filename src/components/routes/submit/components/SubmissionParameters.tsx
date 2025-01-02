import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/submit/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
};

const WrappedSubmissionParameters = ({ profile = null, loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        marginTop: theme.spacing(2),
        rowGap: theme.spacing(1)
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t('options.submission')}
      </Typography>

      <form.Subscribe
        selector={state => [loading ? null : state.values.settings.description]}
        children={([description]) => (
          <TextInput
            label={t('options.submission.desc')}
            value={description}
            loading={loading}
            disabled={disabled}
            onChange={(event, value) => {
              form.setStore(s => {
                s.settings.description = value;
                return s;
              });
            }}
          />
        )}
      />

      <form.Subscribe
        selector={state => [loading ? null : state.values.settings.priority]}
        children={([priority]) => (
          <SliderInput
            label={t('options.submission.priority')}
            value={priority}
            loading={loading}
            disabled={disabled}
            step={null}
            min={500}
            max={1500}
            marks={[
              { label: t('options.submission.priority.low'), value: 500 },
              { label: t('options.submission.priority.medium'), value: 1000 },
              { label: t('options.submission.priority.high'), value: 1500 }
            ]}
            onChange={(event, value: number) => {
              form.setStore(s => {
                s.settings.priority = value;
                return s;
              });
            }}
          />
        )}
      />

      <div>
        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profiles[profile].generate_alert]}
          children={([generate_alert]) => (
            <CheckboxInput
              label={t('options.submission.generate_alert')}
              value={generate_alert?.value}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profiles[profile].generate_alert = {
                    ...s.settings.profiles[profile].generate_alert,
                    value: !s.settings.profiles[profile].generate_alert.value
                  };
                  return s;
                });
              }}
            />
          )}
        />

        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profiles[profile].ignore_filtering]}
          children={([ignore_filtering]) => (
            <CheckboxInput
              label={t('options.submission.ignore_filtering')}
              value={ignore_filtering?.value}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profiles[profile].ignore_filtering = {
                    ...s.settings.profiles[profile].ignore_filtering,
                    value: !s.settings.profiles[profile].ignore_filtering.value
                  };
                  return s;
                });
              }}
            />
          )}
        />

        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profiles[profile].ignore_cache]}
          children={([ignore_cache]) => (
            <CheckboxInput
              label={t('options.submission.ignore_cache')}
              value={ignore_cache?.value}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profiles[profile].ignore_cache = {
                    ...s.settings.profiles[profile].ignore_cache,
                    value: !s.settings.profiles[profile].ignore_cache.value
                  };
                  return s;
                });
              }}
            />
          )}
        />

        <form.Subscribe
          selector={state => [
            loading ? null : state.values.settings.profiles[profile].ignore_dynamic_recursion_prevention
          ]}
          children={([ignore_dynamic_recursion_prevention]) => (
            <CheckboxInput
              label={t('options.submission.ignore_dynamic_recursion_prevention')}
              value={ignore_dynamic_recursion_prevention?.value}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profiles[profile].ignore_dynamic_recursion_prevention = {
                    ...s.settings.profiles[profile].ignore_dynamic_recursion_prevention,
                    value: !s.settings.profiles[profile].ignore_dynamic_recursion_prevention.value
                  };
                  return s;
                });
              }}
            />
          )}
        />

        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profile]}
          children={([profiling]) => (
            <CheckboxInput
              label={t('options.submission.profile')}
              value={profiling}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profile = !s.settings.profile;
                  return s;
                });
              }}
            />
          )}
        />

        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profiles[profile].deep_scan]}
          children={([deep_scan]) => (
            <CheckboxInput
              label={t('options.submission.deep_scan')}
              value={deep_scan?.value}
              loading={loading}
              disabled={disabled}
              onChange={() => {
                form.setStore(s => {
                  s.settings.profiles[profile].deep_scan = {
                    ...s.settings.profiles[profile].deep_scan,
                    value: !s.settings.profiles[profile].deep_scan.value
                  };
                  return s;
                });
              }}
            />
          )}
        />
      </div>

      <form.Subscribe
        selector={state => [loading ? null : state.values.settings.profiles[profile].ttl]}
        children={([ttl]) => (
          <NumberInput
            label={`${t('options.submission.ttl')} (${
              configuration.submission.max_dtl !== 0
                ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                : t('options.submission.ttl.forever')
            })`}
            endAdornment={t('settings:submissions.ttl_days')}
            value={ttl?.value}
            loading={loading}
            disabled={disabled}
            min={configuration.submission.max_dtl !== 0 ? 1 : 0}
            max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
            onChange={(event, value) => {
              form.setStore(s => {
                s.settings.profiles[profile].ttl = {
                  ...s.settings.profiles[profile].ttl,
                  value: value
                };
                return s;
              });
            }}
          />
        )}
      />
    </div>
  );
};

export const SubmissionParameters = React.memo(WrappedSubmissionParameters);
