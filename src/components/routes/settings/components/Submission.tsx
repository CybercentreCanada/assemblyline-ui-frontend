import { List, ListItem, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { ClassificationInput } from 'components/routes/settings/inputs/ClassificationInput';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { useTranslation } from 'react-i18next';

type Props = {
  loading?: boolean;
  disabled?: boolean;
};

export const Submission = ({ loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <List
      disablePadding
      sx={{
        bgcolor: 'background.paper',
        '&>:not(:last-child)': {
          borderBottom: `thin solid ${theme.palette.divider}`
        }
      }}
    >
      <ListItem alignItems="flex-start">
        <Typography id="submissions" className="Anchor" variant="h6">
          {t('submissions')}
        </Typography>
      </ListItem>

      <form.Field
        name="next.generate_alert"
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.generate_alert')}
            secondary={t('settings:submissions.generate_alert_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onBlur={handleBlur}
            onClick={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        name="next.ignore_dynamic_recursion_prevention"
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.dynamic_recursion')}
            secondary={t('settings:submissions.dynamic_recursion_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onBlur={handleBlur}
            onClick={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        name="next.ignore_filtering"
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.filtering')}
            secondary={t('settings:submissions.filtering_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onBlur={handleBlur}
            onClick={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        name="next.ignore_cache"
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.result_caching')}
            secondary={t('settings:submissions.result_caching_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onBlur={handleBlur}
            onClick={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        name="next.deep_scan"
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.deep_scan')}
            secondary={t('settings:submissions.deep_scan_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onBlur={handleBlur}
            onClick={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        name="next.preferred_submission_profile"
        children={({ state, handleBlur, handleChange }) => (
          <SelectInput
            primary={t('settings:submissions.submission_profile')}
            secondary={t('settings:submissions.submission_profile_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            options={Object.keys(configuration?.submission?.profiles || {}).map(profile => ({
              value: profile,
              label: profile
            }))}
            onChange={e => handleChange(e.target.value as string)}
            onBlur={handleBlur}
          />
        )}
      />

      <form.Field
        name="next.ttl"
        children={({ state, handleBlur, handleChange }) => (
          <NumberInput
            primary={t('settings:submissions.ttl')}
            secondary={t('settings:submissions.ttl_desc')}
            endAdornment={t('settings:submissions.ttl_days')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            min={configuration.submission.max_dtl !== 0 ? 1 : 0}
            max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
            onChange={e => handleChange(parseInt(e.target.value))}
            onBlur={handleBlur}
          />
        )}
      />

      <form.Field
        name="next.classification"
        children={({ state, handleChange }) => (
          <ClassificationInput
            primary={t('settings:submissions.classification')}
            secondary={t('settings:submissions.classification_desc')}
            value={state.value}
            loading={loading}
            disabled={disabled}
            onChange={value => handleChange(value)}
          />
        )}
      />
    </List>
  );
};
