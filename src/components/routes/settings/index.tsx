import TableOfContentProvider, { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { UserSettings } from 'components/models/base/user_settings';
import ForbiddenPage from 'components/routes/403';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ExternalSourcesSection } from './components/ExternalSources';
import { HeaderSection } from './components/Header';
import { InterfaceSection } from './components/Interface';
import { LeftNav } from './components/LeftNav';
import { RightNav } from './components/RightNav';
import { ServicesSection } from './components/Services';
import { SubmissionSection } from './components/Submission';
import type { SettingsStore } from './contexts/form';
import { FormProvider, useForm } from './contexts/form';
import { loadSubmissionProfiles } from './utils/utils';

type Params = {
  tab: SettingsStore['state']['tab'];
};

const SettingsContent = () => {
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { tab: tabParam } = useParams<Params>();
  const { user: currentUser, configuration } = useALContext();

  const form = useForm();
  const { rootRef, headerRef } = useTableOfContent();

  useEffect(() => {
    form.setStore(s => {
      s.state.disabled = !currentUser.is_admin && !currentUser.roles.includes('self_manage');
      s.state.customize = currentUser.is_admin || currentUser.roles.includes('submission_customize');
      return s;
    });

    // Load user on start
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setStore(s => {
          const decompress = loadSubmissionProfiles(api_response, configuration.submission.profiles);

          s.next = _.cloneDeep(decompress);
          s.prev = _.cloneDeep(decompress);

          const nextTab = ['interface', ...Object.keys(s.next.profiles)].includes(tabParam) ? tabParam : 'interface';
          navigate(`/settings/${nextTab}`);

          return s;
        });
      },
      onEnter: () =>
        form.setStore(s => {
          s.state.loading = true;
          return s;
        }),
      onExit: () =>
        form.setStore(s => {
          s.state.loading = false;
          return s;
        })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    form.setStore(s => {
      if (!s.next) return s;
      s.state.tab = ['interface', ...Object.keys(s.next.profiles)].includes(tabParam) ? tabParam : 'interface';
      return s;
    });
  }, [form, tabParam]);

  if (!currentUser.is_admin && !currentUser.roles.includes('self_manage')) return <ForbiddenPage />;
  else
    return (
      <form.Subscribe
        selector={state => [state.values.state.tab]}
        children={([tab]) => (
          <PageLayout
            rootRef={rootRef}
            headerRef={headerRef}
            header={<HeaderSection />}
            leftNav={<LeftNav />}
            rightNav={<RightNav />}
          >
            {!tab ? null : tab === 'interface' ? (
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

const WrappedSettingsPage = () => (
  <TableOfContentProvider>
    <FormProvider>
      <SettingsContent />
    </FormProvider>
  </TableOfContentProvider>
);

export const SettingsPage = React.memo(WrappedSettingsPage);
export default SettingsPage;
