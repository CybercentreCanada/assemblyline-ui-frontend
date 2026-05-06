import { useAppConfig } from 'core/config';
import { createAppRoute, useAppPathParams, useAppRoute } from 'core/routes';
import { TableOfContentProvider, useTableOfContent } from 'features/table-of-content/TableOfContent';
import { memo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { ForbiddenRedirect } from 'ui/layouts/ForbiddenRedirect';
import { PageLayout } from 'ui/layouts/PageLayout';
import { DefaultMetadataSection } from './components/DefaultMetadata';
import { ExternalSourcesSection } from './components/ExternalSources';
import { HeaderSection } from './components/Header';
import { InterfaceSection } from './components/Interface';
import { LeftNav } from './components/LeftNav';
import { RightNav } from './components/RightNav';
import { ServicesSection } from './components/Services';
import { SubmissionOptionsSection, SubmissionProfileDescription } from './components/Submission';
import type { SettingsStore } from './settings.form';
import { FormProvider, useForm } from './settings.form';
import { initializeSettings, loadDefaultProfile, loadSubmissionProfile } from './settings.utils';

type Params = {
  tab: SettingsStore['state']['tab'];
};

const WrappedSettingsRoute = memo(() => {
  const form = useForm();
  const { rootRef, headerRef } = useTableOfContent();
  const { tab: tabParam2 } = useParams<Params>();
  const currentUser = useAppConfig(s => s.user);
  const configuration = useAppConfig(s => s.configuration);
  const settings = useAppConfig(s => s.settings);

  const tabParam = useAppPathParams('/settings/:tab', s => s.tab);

  const route = useAppRoute('/settings/:tab', s => s);

  console.log(tabParam2, route);

  const handleProfileChange = useCallback(() => {
    let s = form.getFieldValue('settings');
    const tab = form.getFieldValue('state.tab');
    const userSettings = form.getFieldValue('user');

    if (!s || !tab || !userSettings) return;

    if (tab === 'interface') s = form.getFieldValue('settings');
    else if (tab === 'default') s = loadDefaultProfile(s, userSettings, currentUser);
    else s = loadSubmissionProfile(s, userSettings, configuration.submission.profiles, currentUser, tab);

    form.setFieldValue('settings', s);
    form.setFieldValue('state.tab', tab);
  }, [configuration.submission.profiles, currentUser, form]);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;
    form.setFieldValue('state.tab', tabParam);
    handleProfileChange();
  }, [form, handleProfileChange, tabParam]);

  useEffect(() => {
    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('self_manage'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    form.setFieldValue('user', settings);
    form.setFieldValue('settings', initializeSettings(settings));
    handleProfileChange();
  }, [currentUser.is_admin, currentUser.roles, form, handleProfileChange, settings]);

  return !currentUser.is_admin && !currentUser.roles.includes('self_manage') ? (
    <ForbiddenRedirect />
  ) : (
    <form.Subscribe
      selector={state => [state.values.state.tab, !!state.values.settings] as const}
      children={([tab, hasSettings]) => (
        <PageLayout
          rootRef={rootRef}
          headerRef={headerRef}
          header={!hasSettings ? null : <HeaderSection />}
          leftNav={!hasSettings ? null : <LeftNav />}
          rightNav={!hasSettings ? null : <RightNav />}
        >
          {!hasSettings ? null : tab in settings.submission_profiles ? (
            <>
              <SubmissionProfileDescription />
              <SubmissionOptionsSection />
              <ServicesSection />
            </>
          ) : (
            <>
              <InterfaceSection />
              <ExternalSourcesSection />
              <DefaultMetadataSection />
            </>
          )}
        </PageLayout>
      )}
    />
  );
});
WrappedSettingsRoute.displayName = 'WrappedSettingsRoute';

const SettingsPage = memo(() => (
  <TableOfContentProvider>
    <FormProvider>
      <WrappedSettingsRoute />
    </FormProvider>
  </TableOfContentProvider>
));
SettingsPage.displayName = 'SettingsPage';

export const SettingsRoute = createAppRoute({
  component: SettingsPage,
  path: '/settings/:tab',
  params: s => ({
    tab: s.string()
  })
});
