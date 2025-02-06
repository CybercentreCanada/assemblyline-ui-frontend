import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/contexts/form';
import type { SubmitSettings } from 'components/routes/settings/utils/utils';
import { getProfileNames } from 'components/routes/settings/utils/utils';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import { useTranslation } from 'react-i18next';

export const LeftNav = () => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <form.Subscribe
      selector={state => [state.values?.next, state.values.state.tab, state.values.state.loading]}
      children={([profiles, tab, loading]) => (
        <PageNavigation
          subheader={loading ? null : t('settings')}
          loading={loading as boolean}
          variant="left"
          options={[
            {
              primary: t('interface'),
              active: 'interface' === tab,
              to: `/settings/interface`
            },
            { primary: t('profiles'), subheader: true, readOnly: true },
            ...getProfileNames(profiles as SubmitSettings).map(name => ({
              primary: ['interface', 'default'].includes(name)
                ? t(`profile.${name}`)
                : configuration.submission.profiles[name].display_name,
              active: name === tab,
              to: `/settings/${name}`
            }))
          ]}
        />
      )}
    />
  );
};
