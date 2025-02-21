import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import ForbiddenPage from 'components/routes/403';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import React, { useEffect } from 'react';
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
import { MOCK_SETTINGS } from './utils/data3';

type Params = {
  tab: SettingsStore['state']['tab'];
};

const WrappedSettingsRoute = () => {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams<Params>();
  const { user: currentUser, configuration, settings } = useALContext();

  const form = useForm();
  const { rootRef, headerRef } = useTableOfContent();

  useEffect(() => {
    if (!!form.getFieldValue('settings')) return;

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('self_manage'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    const s = initializeSettings(MOCK_SETTINGS);
    form.setFieldValue('settings', s);
  }, [currentUser.is_admin, currentUser.roles, form]);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;
    const nextTab = ['interface', ...Object.keys(settings.submission_profiles)].includes(tabParam)
      ? tabParam
      : 'interface';
    navigate(`/settings/${nextTab}`);
  }, [form, navigate, settings.submission_profiles, tabParam]);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;

    let s: ProfileSettings = form.getFieldValue('settings');
    if (tabParam === 'interface') s = form.getFieldValue('settings');
    else if (tabParam === 'default') s = loadDefaultProfile(s, MOCK_SETTINGS);
    else s = loadSubmissionProfile(s, MOCK_SETTINGS, configuration.submission.profiles, tabParam);

    form.setFieldValue('state.tab', tabParam);
    form.setFieldValue('settings', s);
  }, [configuration.submission.profiles, form, tabParam]);

  if (!currentUser.is_admin && !currentUser.roles.includes('self_manage')) return <ForbiddenPage />;
  else
    return (
      <form.Subscribe
        selector={state => [state.values.state.tab, !!state.values.settings]}
        children={([tab, hasNext]) => (
          <PageLayout
            rootRef={rootRef}
            headerRef={headerRef}
            header={!hasNext ? null : <HeaderSection />}
            leftNav={!hasNext ? null : <LeftNav />}
            rightNav={!hasNext ? null : <RightNav />}
          >
            {!hasNext ? null : tab === 'interface' ? (
              <InterfaceSection />
            ) : (
              <>
                <SubmissionSection />
                <ExternalSourcesSection />
                <ServicesSection />
              </>
            )}
          </PageLayout>
        )}
      />
    );
};

export const SettingsRoute = React.memo(WrappedSettingsRoute);
