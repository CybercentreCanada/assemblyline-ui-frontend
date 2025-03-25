import { Typography, useTheme } from '@mui/material';
import { useForm } from 'components/routes/submit/submit.form';
import { TextInput } from 'components/visual/Inputs/TextInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const PasswordInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.settings.initial_data.value?.password || ''
        ] as const
      }
      children={([loading, disabled, isEditing, password]) => (
        <TextInput
          label={t('data.password.label')}
          tooltip={t('data.password.tooltip')}
          value={password as string}
          loading={loading}
          disabled={disabled || !isEditing}
          onChange={(e, v) => {
            form.setFieldValue('settings.initial_data.value', s => {
              s.password = v;
              return s;
            });
          }}
          rootProps={{ style: { margin: theme.spacing(1) } }}
        />
      )}
    />
  );
});

export const SubmissionData = React.memo(() => {
  const { t } = useTranslation(['submit']);

  return (
    <div>
      <Typography variant="h6">{t('data.title')}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <PasswordInput />
      </div>
    </div>
  );
});
