import { Typography, useTheme } from '@mui/material';
import { useForm } from 'components/routes/submit/submit.form';
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
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
          (state.values.settings.initial_data.value?.passwords ?? []) as string[]
        ] as const
      }
    >
      {([loading, disabled, isEditing, passwords]) => (
        <ChipsInput
          label={t('data.password.label')}
          tooltip={t('data.password.tooltip')}
          value={passwords}
          loading={loading}
          disabled={disabled || !isEditing}
          allowEmptyStrings
          onChange={(e, v) => {
            form.setFieldValue('settings.initial_data.value', s => {
              s.passwords = v;
              return s;
            });
          }}
          rootProps={{ style: { margin: theme.spacing(1) } }}
        />
      )}
    </form.Subscribe>
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
