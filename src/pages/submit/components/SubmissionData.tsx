import { Typography, useTheme } from '@mui/material';
import { useForm } from 'pages/submit/submit.form';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipsInput } from 'ui/inputs/ChipsInput';

export const PasswordInput = memo(() => {
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
          slotProps={{ root: { style: { margin: theme.spacing(1) } } }}
        />
      )}
    </form.Subscribe>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const SubmissionData = memo(() => {
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
SubmissionData.displayName = 'SubmissionData';
