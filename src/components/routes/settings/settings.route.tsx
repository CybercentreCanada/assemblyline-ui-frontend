import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { UserSettings } from 'components/models/base/user_settings';
import ForbiddenPage from 'components/routes/403';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ExternalSourcesSection } from './components/ExternalSources';
import { HeaderSection } from './components/Header';
import { InterfaceSection } from './components/Interface';
import { LeftNav } from './components/LeftNav';
import { RightNav } from './components/RightNav';
import { ServicesSection } from './components/Services';
import { SubmissionSection } from './components/Submission';
import type { SettingsStore } from './settings.form';
import { useForm } from './settings.form';
import type { ProfileSettings } from './settings.utils';
import { initializeSettings, loadDefaultProfile, loadSubmissionProfile } from './settings.utils';

type Params = {
  tab: SettingsStore['state']['tab'];
};

const WrappedSettingsRoute = () => {
  const form = useForm();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { rootRef, headerRef } = useTableOfContent();
  const { tab: tabParam } = useParams<Params>();
  const { user: currentUser, configuration, settings } = useALContext();

  const [userSettings, setUserSettings] = useState<UserSettings>(null);

  useEffect(() => {
    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('self_manage'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        setUserSettings(api_response);

        const s = initializeSettings(api_response);
        form.setFieldValue('settings', s);
      },
      onEnter: () => form.setFieldValue('state.loading', true),
      onExit: () => form.setFieldValue('state.loading', false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, currentUser.roles, currentUser.username, form]);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;
    const nextTab = ['interface', ...Object.keys(settings.submission_profiles)].includes(tabParam)
      ? tabParam
      : 'interface';
    navigate(`/settings/${nextTab}`);
  }, [form, navigate, settings.submission_profiles, tabParam]);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab') || !userSettings) return;

    let s: ProfileSettings = form.getFieldValue('settings');
    if (tabParam === 'interface') s = form.getFieldValue('settings');
    else if (tabParam === 'default') s = loadDefaultProfile(s, userSettings);
    else s = loadSubmissionProfile(s, userSettings, configuration.submission.profiles, tabParam);

    form.setFieldValue('state.tab', tabParam);
    form.setFieldValue('settings', s);
  }, [configuration.submission.profiles, form, tabParam, userSettings]);

  if (!currentUser.is_admin && !currentUser.roles.includes('self_manage')) return <ForbiddenPage />;
  else
    return (
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
                <SubmissionSection />
                <ExternalSourcesSection />
                <ServicesSection />
              </>
            ) : (
              <InterfaceSection />
            )}
          </PageLayout>
        )}
      />
    );
};

export const SettingsRoute = React.memo(WrappedSettingsRoute);
