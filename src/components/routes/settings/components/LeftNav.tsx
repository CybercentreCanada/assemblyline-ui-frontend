import { useForm } from 'components/routes/settings/contexts/form';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import { useTranslation } from 'react-i18next';

export const LeftNav = () => {
  const { t } = useTranslation(['settings']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values?.next?.profiles,
        state.values.state.tab,
        state.values.state.loading,
        state.values.state.customize
      ]}
      children={([profiles, tab, loading, customize]) => (
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
            ...Object.keys(profiles || {})
              .filter(name => (customize ? true : name !== 'default'))
              .sort()
              .map(name => ({
                primary: t(`profile.${name}`),
                active: name === tab,
                to: `/settings/${name}`
              }))
          ]}
        />
      )}
    />
  );
};
