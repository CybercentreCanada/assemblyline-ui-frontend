import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { ClassificationInput } from 'components/routes/settings/inputs/ClassificationInput';
import { InputContainer, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { useTranslation } from 'react-i18next';

type Props = {
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const SubmissionSection = ({
  customize = false,
  disabled = false,
  hidden = false,
  loading = false,
  profile = 'interface'
}: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <form.Subscribe
      selector={state =>
        state.values.next.profiles[profile].classification.editable ||
        state.values.next.profiles[profile].ttl.editable ||
        state.values.next.profiles[profile].deep_scan.editable ||
        state.values.next.profiles[profile].ignore_dynamic_recursion_prevention.editable ||
        state.values.next.profiles[profile].ignore_filtering.editable ||
        state.values.next.profiles[profile].generate_alert.editable ||
        state.values.next.profiles[profile].ignore_cache.editable
      }
      children={hasParams => {
        return !customize && hidden && !hasParams ? null : (
          <InputContainer style={{ rowGap: theme.spacing(1) }}>
            <InputHeader
              primary={{ children: t('submissions'), id: 'submissions', className: 'Anchor' }}
              secondary={{ children: t('submissions.description') }}
            />

            <InputList>
              <form.Field
                name={`next.profiles[${profile}].classification` as `next.profiles.profile.classification`}
                children={({ state, handleChange }) => (
                  <ClassificationInput
                    id="settings:submissions.classification"
                    primary={t('settings:submissions.classification')}
                    secondary={t('settings:submissions.classification_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onChange={value => handleChange(prev => ({ ...prev, value: value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ttl` as `next.profiles.profile.ttl`}
                children={({ state, handleBlur, handleChange }) => (
                  <NumberInput
                    id="settings:submissions.ttl"
                    primary={t('settings:submissions.ttl')}
                    secondary={t('settings:submissions.ttl_desc')}
                    endAdornment={t('settings:submissions.ttl_days')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                    max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                    onBlur={handleBlur}
                    onChange={event => handleChange(prev => ({ ...prev, value: parseInt(event.target.value) }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].deep_scan` as `next.profiles.profile.deep_scan`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    id="settings:submissions.deep_scan"
                    primary={t('settings:submissions.deep_scan')}
                    secondary={t('settings:submissions.deep_scan_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={
                  `next.profiles[${profile}].ignore_dynamic_recursion_prevention` as `next.profiles.profile.ignore_dynamic_recursion_prevention`
                }
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    id="settings:submissions.dynamic_recursion"
                    primary={t('settings:submissions.dynamic_recursion')}
                    secondary={t('settings:submissions.dynamic_recursion_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ignore_filtering` as `next.profiles.profile.ignore_filtering`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    id="settings:submissions.filtering"
                    primary={t('settings:submissions.filtering')}
                    secondary={t('settings:submissions.filtering_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].generate_alert` as `next.profiles.profile.generate_alert`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    id="settings:submissions.generate_alert"
                    primary={t('settings:submissions.generate_alert')}
                    secondary={t('settings:submissions.generate_alert_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ignore_cache` as `next.profiles.profile.ignore_cache`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanInput
                    id="settings:submissions.result_caching"
                    primary={t('settings:submissions.result_caching')}
                    secondary={t('settings:submissions.result_caching_desc')}
                    value={state.value.value}
                    defaultValue={state.value.default}
                    loading={loading}
                    disabled={disabled || (!customize && !state.value.editable)}
                    hidden={hidden}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />
            </InputList>
          </InputContainer>
        );
      }}
    />
  );
};
