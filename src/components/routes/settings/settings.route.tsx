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
import { initializeProfile, loadDefaultProfile, loadSubmissionProfile } from './settings.utils';
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
    if (!!form.getFieldValue('next')) return;

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('self_manage'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    // const defaults = loadDefaultProfile(settings);
    const defaults = initializeProfile(MOCK_SETTINGS);
    form.setFieldValue('prev', defaults);
    form.setFieldValue('next', defaults);
  }, [currentUser.is_admin, currentUser.roles, form]);

  // useEffect(() => {
  //   form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('self_manage'));
  //   form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

  //   const nextTab = ['interface', ...Object.keys(settings.submission_profiles)].includes(tabParam)
  //     ? tabParam
  //     : 'interface';
  //   form.setFieldValue('state.tab', nextTab);
  //   navigate(`/settings/${nextTab}`);

  //   const data = loadSubmissionProfiles(MOCK_SETTINGS as any, configuration.submission.profiles);
  //   form.setFieldValue('next', _.cloneDeep(data));
  //   form.setFieldValue('prev', _.cloneDeep(data));

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;
    const nextTab = ['interface', ...Object.keys(settings.submission_profiles)].includes(tabParam)
      ? tabParam
      : 'interface';
    navigate(`/settings/${nextTab}`);
  }, [form, navigate, settings.submission_profiles, tabParam]);

  // to add
  useEffect(() => {
    if (tabParam === form.getFieldValue('state.tab')) return;

    let data: ProfileSettings = form.getFieldValue('next');
    if (tabParam === 'interface') data = form.getFieldValue('next');
    else if (tabParam === 'default') data = loadDefaultProfile(data, MOCK_SETTINGS);
    else data = loadSubmissionProfile(data, MOCK_SETTINGS, configuration.submission.profiles, tabParam);

    console.log(data, MOCK_SETTINGS, configuration.submission.profiles);

    form.setFieldValue('state.tab', tabParam);
    form.setFieldValue('next', data);
    form.setFieldValue('prev', structuredClone(data));
  }, [configuration.submission.profiles, form, tabParam]);

  // useEffect(() => {
  //   form.setStore(s => {
  //     if (!s.next) return s;
  //     s.state.tab = ['interface', ...Object.keys(s.next.submission_profiles)].includes(tabParam)
  //       ? tabParam
  //       : 'interface';
  //     return s;
  //   });
  // }, [form, tabParam]);

  if (!currentUser.is_admin && !currentUser.roles.includes('self_manage')) return <ForbiddenPage />;
  else
    return (
      <form.Subscribe
        selector={state => [state.values.state.tab, !!state.values.next]}
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
