import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import { useTranslation } from 'react-i18next';

export const InterfaceSection = () => {
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

          <List inset>
            <form.Subscribe
              selector={state => state.values.next.preferred_submission_profile}
              children={value => (
                <SelectListInput
                  primary={t('settings:submissions.submission_profile')}
                  secondary={t('settings:submissions.submission_profile_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={getProfileNames(settings).map(profileValue => ({
                    value: profileValue,
                    label:
                      profileValue === 'default'
                        ? t(`profile.custom`)
                        : configuration.submission.profiles[profileValue].display_name
                  }))}
                  onChange={(event, v) => {
                    form.setStore(s => {
                      s.next.preferred_submission_profile = v;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.next.submission_view}
              children={value => (
                <SelectListInput
                  primary={t('interface.view')}
                  secondary={t('interface.view_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    { value: 'report', label: t('interface.view_report') },
                    { value: 'details', label: t('interface.view_details') }
                  ]}
                  onChange={(event, v) => {
                    form.setStore(s => {
                      s.next.submission_view = v as 'report' | 'details';
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.next.download_encoding}
              children={download_encoding => (
                <SelectListInput
                  primary={t('interface.encoding')}
                  secondary={t('interface.encoding_desc')}
                  value={download_encoding}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    ...(configuration.ui.allow_raw_downloads && [{ value: 'raw', label: t('interface.encoding_raw') }]),
                    { value: 'cart', label: t('interface.encoding_cart') },
                    ...(configuration.ui.allow_zip_downloads && [{ value: 'zip', label: t('interface.encoding_zip') }])
                  ]}
                  onChange={(event, v) => {
                    form.setStore(s => {
                      s.next.download_encoding = v as 'raw' | 'cart' | 'zip';
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => [
                state.values.next.default_zip_password,
                state.values.next.download_encoding !== 'zip'
              ]}
              children={([default_zip_password, preventRender]) => (
                <TextListInput
                  primary={t('interface.encoding_password')}
                  value={default_zip_password as string}
                  loading={loading}
                  disabled={disabled}
                  preventRender={preventRender as boolean}
                  onChange={(event, v) => {
                    form.setStore(s => {
                      s.next.default_zip_password = v;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.next.expand_min_score}
              children={value => (
                <SelectListInput
                  primary={t('interface.score')}
                  secondary={t('interface.score_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={[
                    { value: '-1000000', label: t('interface.score_-1000000') },
                    { value: '0', label: t('interface.score_0') },
                    { value: '100', label: t('interface.score_100') },
                    { value: '500', label: t('interface.score_500') },
                    { value: '2000', label: t('interface.score_2000') },
                    { value: '100000000', label: t('interface.score_100000000') }
                  ]}
                  onChange={(event, v) => {
                    form.setStore(s => {
                      s.next.expand_min_score = v as unknown as number;
                      return s;
                    });
                  }}
                />
              )}
            />
            {configuration.ui.ai.enabled && (
              <form.Subscribe
                selector={state => state.values.next.executive_summary}
                children={value => (
                  <BooleanListInput
                    primary={t('interface.executive_summary')}
                    secondary={t('interface.executive_summary_desc')}
                    value={value}
                    loading={loading}
                    disabled={disabled}
                    onChange={(event, v) => {
                      form.setStore(s => {
                        s.next.executive_summary = v;
                        return s;
                      });
                    }}
                  />
                )}
              />
            )}
          </List>
        </div>
      )}
    />
  );
};
