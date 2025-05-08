import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const LeftNav = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { configuration, settings } = useALContext();

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, state.values.state.loading] as const}
      children={([tab, loading]) => (
        <PageNavigation
          subheader={loading ? null : t('settings')}
          loading={loading}
          variant="left"
          options={[
            {
              primary: t('interface'),
              active: !tab,
              to: `/settings/interface`
            },
            { primary: t('profiles'), subheader: true, readOnly: true },
            ...getProfileNames(settings).map(name => ({
              primary:
                name === 'interface'
                  ? t('profile.interface')
                  : name === 'default'
                    ? t('profile.custom')
                    : configuration.submission.profiles[name].display_name,
              active: name === tab,
              to: `/settings/${name}`
            }))
          ]}
        />
      )}
    />
  );
});
