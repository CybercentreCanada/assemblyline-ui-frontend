import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanListInput } from 'components/visual/List/inputs/BooleanListInput';
import { ClassificationListInput } from 'components/visual/List/inputs/ClassificationListInput';
import { NumberListInput } from 'components/visual/List/inputs/NumberListInput';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
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
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <ListHeader
              primaryProps={{ children: t('submissions'), id: 'submissions', className: 'Anchor', variant: 'h6' }}
              secondaryProps={{ children: t('submissions.description') }}
            />

            <List checkboxPadding>
              <form.Field
                name={`next.profiles[${profile}].classification` as `next.profiles.profile.classification`}
                children={({ state, handleChange }) => (
                  <ClassificationListInput
                    id="settings:submissions.classification"
                    primary={t('settings:submissions.classification')}
                    secondary={t('settings:submissions.classification_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
                    onChange={value => handleChange(prev => ({ ...prev, value: value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ttl` as `next.profiles.profile.ttl`}
                children={({ state, handleBlur, handleChange }) => (
                  <NumberListInput
                    id="settings:submissions.ttl"
                    primary={t('settings:submissions.ttl')}
                    secondary={t('settings:submissions.ttl_desc')}
                    endAdornment={t('settings:submissions.ttl_days')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
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
                  <BooleanListInput
                    id="settings:submissions.deep_scan"
                    primary={t('settings:submissions.deep_scan')}
                    secondary={t('settings:submissions.deep_scan_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
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
                  <BooleanListInput
                    id="settings:submissions.dynamic_recursion"
                    primary={t('settings:submissions.dynamic_recursion')}
                    secondary={t('settings:submissions.dynamic_recursion_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ignore_filtering` as `next.profiles.profile.ignore_filtering`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanListInput
                    id="settings:submissions.filtering"
                    primary={t('settings:submissions.filtering')}
                    secondary={t('settings:submissions.filtering_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].generate_alert` as `next.profiles.profile.generate_alert`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanListInput
                    id="settings:submissions.generate_alert"
                    primary={t('settings:submissions.generate_alert')}
                    secondary={t('settings:submissions.generate_alert_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />

              <form.Field
                name={`next.profiles[${profile}].ignore_cache` as `next.profiles.profile.ignore_cache`}
                children={({ state, handleBlur, handleChange }) => (
                  <BooleanListInput
                    id="settings:submissions.result_caching"
                    primary={t('settings:submissions.result_caching')}
                    secondary={t('settings:submissions.result_caching_desc')}
                    value={state.value.value}
                    loading={loading}
                    hidden={hidden}
                    disabled={disabled || (!customize && !state.value.editable)}
                    showReset={state.value.default !== null && state.value.value !== state.value.default}
                    onBlur={handleBlur}
                    onClick={() => handleChange(prev => ({ ...prev, value: !prev.value }))}
                    onReset={() => handleChange(prev => ({ ...prev, value: prev.default }))}
                  />
                )}
              />
            </List>
          </div>
        );
      }}
    />
  );
};
