import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { UserSettings } from 'components/models/base/user_settings';
import ForbiddenPage from 'components/routes/403';
import { ExternalSourcesSection } from 'components/routes/settings/components/ExternalSources';
import { HeaderSection } from 'components/routes/settings/components/Header';
import { InterfaceSection } from 'components/routes/settings/components/Interface';
import { LeftNav } from 'components/routes/settings/components/LeftNav';
import { RightNav } from 'components/routes/settings/components/RightNav';
import { ServicesSection } from 'components/routes/settings/components/Services';
import { SubmissionSection } from 'components/routes/settings/components/Submission';
import type { SettingsStore } from 'components/routes/settings/settings.form';
import { useForm } from 'components/routes/settings/settings.form';
import {
  initializeSettings,
  loadDefaultProfile,
  loadSubmissionProfile
} from 'components/routes/settings/settings.utils';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

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

    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setFieldValue('user', api_response);
        form.setFieldValue('settings', initializeSettings(api_response));
        handleProfileChange();
      },
      onEnter: () => form.setFieldValue('state.loading', true),
      onExit: () => form.setFieldValue('state.loading', false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, currentUser.roles, currentUser.username, form]);

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
