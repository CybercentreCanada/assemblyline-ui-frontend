import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const InterfaceSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration, settings } = useALContext();

  const profileOptions = useMemo<{ value: string; primary: string }[]>(() => {
    if (!configuration || !settings) return [];
    return getProfileNames(settings).map(profileValue => {
      const profile = configuration.submission.profiles?.[profileValue];
      return {
        value: profileValue,
        primary: profileValue === 'default' ? t('profile.custom') : (profile?.display_name ?? profileValue),
        secondary: profileValue === 'default' ? t('profile.custom_desc') : (profile?.description ?? '')
      };
    });
  }, [settings, configuration, t]);

  const downloadEncodingOptions = useMemo<{ value: string; primary: string }[]>(() => {
    if (!configuration) return [];
    return [
      ...(configuration.ui.allow_raw_downloads ? [{ value: 'raw', primary: t('interface.encoding_raw') }] : []),
      { value: 'cart', primary: t('interface.encoding_cart') },
      ...(configuration.ui.allow_zip_downloads ? [{ value: 'zip', primary: t('interface.encoding_zip') }] : [])
    ];
  }, [configuration, t]);

  if (!configuration || !settings) return null;

  return (
    <form.Subscribe selector={state => [state.values.state.loading, state.values.state.disabled] as const}>
      {([loading, disabled]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.5) }}>
          <ListHeader
            id="interface"
            data-anchor="interface"
            primary={t('interface')}
            slotProps={{ primary: { className: 'Anchor', variant: 'h6' } }}
          />

          <List>
            {/* Preferred Submission Profile */}
            <form.Subscribe selector={state => [state.values.settings.preferred_submission_profile.value] as const}>
              {([value]) => (
                <SelectListInput
                  primary={t('settings:submissions.submission_profile')}
                  secondary={t('settings:submissions.submission_profile_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={profileOptions}
                  onChange={(_, v) => form.setFieldValue('settings.preferred_submission_profile.value', v)}
                />
              )}
            </form.Subscribe>

            {/* Submission View */}
            <form.Subscribe selector={state => [state.values.settings.submission_view.value] as const}>
              {([value]) => (
                <SelectListInput
                  primary={t('interface.view')}
                  secondary={t('interface.view_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    { value: 'report', primary: t('interface.view_report') },
                    { value: 'details', primary: t('interface.view_details') }
                  ]}
                  onChange={(_, v) => form.setFieldValue('settings.submission_view.value', v as 'report' | 'details')}
                />
              )}
            </form.Subscribe>

            {/* Download Encoding */}
            <form.Subscribe selector={state => [state.values.settings.download_encoding.value] as const}>
              {([value]) => (
                <SelectListInput
                  primary={t('interface.encoding')}
                  secondary={t('interface.encoding_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={downloadEncodingOptions}
                  onChange={(_, v) =>
                    form.setFieldValue('settings.download_encoding.value', v as 'raw' | 'cart' | 'zip')
                  }
                />
              )}
            </form.Subscribe>

            {/* Zip Password */}
            <form.Subscribe
              selector={state =>
                [
                  state.values.settings.default_zip_password.value,
                  state.values.settings.download_encoding.value !== 'zip'
                ] as const
              }
            >
              {([default_zip_password, preventRender]) => (
                <TextListInput
                  primary={t('interface.encoding_password')}
                  value={default_zip_password}
                  loading={loading}
                  disabled={disabled}
                  preventRender={preventRender}
                  onChange={(_, v) => form.setFieldValue('settings.default_zip_password.value', v)}
                />
              )}
            </form.Subscribe>

            {/* Expand Min Score */}
            <form.Subscribe selector={state => [state.values.settings.expand_min_score.value] as const}>
              {([value]) => (
                <SelectListInput
                  primary={t('interface.score')}
                  secondary={t('interface.score_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    { value: -1000000, primary: t('interface.score_-1000000') },
                    { value: 0, primary: t('interface.score_0') },
                    { value: 100, primary: t('interface.score_100') },
                    { value: 500, primary: t('interface.score_500') },
                    { value: 2000, primary: t('interface.score_2000') },
                    { value: 100000000, primary: t('interface.score_100000000') }
                  ]}
                  onChange={(_, v) => form.setFieldValue('settings.expand_min_score.value', v as unknown as number)}
                />
              )}
            </form.Subscribe>

            {/* Executive Summary Toggle (AI feature) */}
            {configuration.ui.ai.enabled && (
              <form.Subscribe selector={state => [state.values.settings.executive_summary.value] as const}>
                {([value]) => (
                  <BooleanListInput
                    primary={t('interface.executive_summary')}
                    secondary={t('interface.executive_summary_desc')}
                    value={value}
                    loading={loading}
                    disabled={disabled}
                    onChange={(_, v) => form.setFieldValue('settings.executive_summary.value', v)}
                  />
                )}
              </form.Subscribe>
            )}
          </List>
        </div>
      )}
    </form.Subscribe>
  );
});

InterfaceSection.displayName = 'InterfaceSection';
