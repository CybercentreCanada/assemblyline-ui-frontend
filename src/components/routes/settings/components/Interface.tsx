import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const InterfaceSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration, settings } = useALContext();

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading, state.values.state.disabled]}
      children={([loading, disabled]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <ListHeader
            id="interface"
            data-anchor="interface"
            primary={t('interface')}
            primaryProps={{ className: 'Anchor', variant: 'h6' }}
          />

          <List>
            <form.Subscribe
              selector={state => state.values.settings.preferred_submission_profile.value}
              children={value => (
                <SelectListInput
                  primary={t('settings:submissions.submission_profile')}
                  secondary={t('settings:submissions.submission_profile_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={getProfileNames(settings).map(profileValue => ({
                    value: profileValue,
                    primary:
                      profileValue === 'default'
                        ? t(`profile.custom`)
                        : configuration.submission.profiles[profileValue].display_name,
                    secondary:
                      profileValue === 'default'
                        ? t(`profile.custom`)
                        : configuration.submission.profiles[profileValue].description
                  }))}
                  onChange={(event, v) => form.setFieldValue('settings.preferred_submission_profile.value', v)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.settings.submission_view.value}
              children={value => (
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
                  onChange={(event, v) =>
                    form.setFieldValue('settings.submission_view.value', v as 'report' | 'details')
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.settings.download_encoding.value}
              children={download_encoding => (
                <SelectListInput
                  primary={t('interface.encoding')}
                  secondary={t('interface.encoding_desc')}
                  value={download_encoding}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    ...(configuration.ui.allow_raw_downloads && [
                      { value: 'raw', primary: t('interface.encoding_raw') }
                    ]),
                    { value: 'cart', primary: t('interface.encoding_cart') },
                    ...(configuration.ui.allow_zip_downloads && [
                      { value: 'zip', primary: t('interface.encoding_zip') }
                    ])
                  ]}
                  onChange={(event, v) =>
                    form.setFieldValue('settings.download_encoding.value', v as 'raw' | 'cart' | 'zip')
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => [
                state.values.settings.default_zip_password.value,
                state.values.settings.download_encoding.value !== 'zip'
              ]}
              children={([default_zip_password, preventRender]) => (
                <TextListInput
                  primary={t('interface.encoding_password')}
                  value={default_zip_password as string}
                  loading={loading}
                  disabled={disabled}
                  preventRender={preventRender as boolean}
                  onChange={(event, v) => form.setFieldValue('settings.default_zip_password.value', v)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.settings.expand_min_score.value}
              children={value => (
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
                  onChange={(event, v) => form.setFieldValue('settings.expand_min_score.value', v as unknown as number)}
                />
              )}
            />
            {configuration.ui.ai.enabled && (
              <form.Subscribe
                selector={state => state.values.settings.executive_summary.value}
                children={value => (
                  <BooleanListInput
                    primary={t('interface.executive_summary')}
                    secondary={t('interface.executive_summary_desc')}
                    value={value}
                    loading={loading}
                    disabled={disabled}
                    onChange={(event, v) => form.setFieldValue('settings.executive_summary.value', v)}
                  />
                )}
              />
            )}
          </List>
        </div>
      )}
    />
  );
});
