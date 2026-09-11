import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const LeftNav = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { configuration, settings } = useALContext();

  const profileOptions = useMemo(() => {
    if (!settings || !configuration?.submission) return [];

    return getProfileNames(settings).map(name => {
      let displayName = '';
      if (name === 'interface') displayName = t('profile.interface');
      else if (name === 'default') displayName = t('profile.custom');
      else displayName = configuration.submission.profiles[name]?.display_name ?? name;

      return {
        primary: displayName,
        active: false,
        to: `/settings/${name}`
      };
    });
  }, [settings, configuration, t]);

  return (
    <form.Subscribe selector={state => [state.values.state.tab, state.values.state.loading] as const}>
      {([tab, loading]) => {
        const options = [
          {
            primary: t('interface'),
            active: !tab || tab === 'interface',
            to: `/settings/interface`
          },
          { primary: t('profiles'), subheader: true, readOnly: true },
          ...profileOptions.map(opt => ({ ...opt, active: opt.to.endsWith(tab) }))
        ];

        return (
          <PageNavigation
            subheader={loading ? null : t('settings')}
            loading={loading}
            variant="left"
            options={options}
          />
        );
      }}
    </form.Subscribe>
  );
});

LeftNav.displayName = 'LeftNav';
