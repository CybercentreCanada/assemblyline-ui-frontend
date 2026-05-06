import { useAppConfig } from 'core/config';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigation } from 'ui/layouts/PageNavigation';
import { useForm } from '../settings.form';
import { getProfileNames } from '../settings.utils';

export const LeftNav = memo(() => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const configuration = useAppConfig(s => s.configuration);
  const settings = useAppConfig(s => s.settings);

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
        to: {
          path: `/settings/:tab`,
          params: { tab: name },
          variant: 'replace'
        }
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
            to: {
              path: '/settings/:tab',
              params: { tab: 'interface' },
              variant: 'replace'
            }
          },
          { primary: t('profiles'), subheader: true, readOnly: true },
          ...profileOptions.map(opt => ({ ...opt, active: opt.to.params.tab.endsWith(tab) }))
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
