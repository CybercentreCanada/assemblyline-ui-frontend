import { makeStyles } from '@mui/styles';
import type { FormApi, Validator } from '@tanstack/react-form';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { UserSettings } from 'components/models/base/user_settings';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalSourcesSection } from './components/ExternalSources';
import { InterfaceSection } from './components/Interface';
import { Navigation } from './components/Navigation';
import { ProfileSection } from './components/Profile';
import { SaveSettings } from './components/Save';
import { ServicesSection } from './components/Services';
import { SubmissionSection } from './components/Submission';
import type { SettingsStore } from './contexts/form';
import { FormProvider, useForm } from './contexts/form';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    maxHeight: 'calc(100vh-64px)',
    overflowY: 'auto'
  },
  wrap: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center'
  },
  container: {
    maxWidth: theme.breakpoints.only('md') ? '800px' : theme.breakpoints.down('md') ? '100%' : '1024px',
    padding: theme.spacing(4),
    height: '2000px'
  },
  navigation: {
    position: 'sticky',
    top: '0px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    scrollbarWidth: 'none'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(2)
  }
}));

const SettingsContent = () => {
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { user: currentUser } = useALContext();

  const form = useForm();

  const rootRef = useRef();

  useEffect(() => {
    form.setStore(s => {
      s.state.disabled = !currentUser.is_admin && !currentUser.roles.includes('self_manage');
      return s;
    });

    // Load user on start
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setStore(s => {
          const settings = { ...api_response, ...s.next };

          settings.services.sort((a, b) => a.name.localeCompare(b.name));
          settings.services.forEach((category, i) => {
            settings.services[i].services.sort((a, b) => a.name.localeCompare(b.name));
          });

          settings.service_spec.sort((a, b) => a.name.localeCompare(b.name));
          settings.service_spec.forEach((spec, i) => {
            settings.service_spec[i].params.sort((a, b) => a.name.localeCompare(b.name));
          });

          s.next = _.cloneDeep(settings);
          s.prev = _.cloneDeep(settings);

          s.state.profile = api_response.preferred_submission_profile;

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

  return (
    <>
      <div className={classes.root} ref={rootRef}>
        <div className={classes.wrap}>
          <PageCenter margin={4} width="100%" textAlign="start">
            <div className={classes.content}>
              <ProfileSection />
              <SubmissionSection />
              <InterfaceSection />
              <ExternalSourcesSection />
              <ServicesSection />
              <div style={{ height: window.innerHeight / 2 }} />
            </div>
            <SaveSettings />
          </PageCenter>
        </div>

        <div className={classes.navigation}>
          <div style={{ height: '2000px' }}>
            <Navigation rootElement={rootRef.current} />
          </div>
        </div>
      </div>
    </>
  );
};

const WrappedSettingsPage = () => {
  const { t } = useTranslation(['settings']);
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useCallback(
    ({
      value,
      formApi
    }: {
      value: SettingsStore;
      formApi: FormApi<SettingsStore, Validator<SettingsStore, string>>;
    }) => {
      if (value.next) {
        apiCall({
          url: `/api/v4/user/settings/${currentUser.username}/`,
          method: 'POST',
          body: value.next,
          onSuccess: () => {
            formApi.store.setState(s => {
              s.values.prev = _.cloneDeep(s.values.next);
              return s;
            });
            showSuccessMessage(t('success_save'));
          },
          onFailure: api_data => {
            if (api_data.api_status_code === 403) {
              showErrorMessage(api_data.api_error_message);
            }
          },
          onEnter: () =>
            formApi.store.setState(s => {
              s.values.state.submitting = true;
              return s;
            }),
          onExit: () =>
            formApi.store.setState(s => {
              s.values.state.submitting = false;
              return s;
            })
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.username, t]
  );

  return (
    <FormProvider onSubmit={handleSubmit}>
      <SettingsContent />
    </FormProvider>
  );
};

export const SettingsPage = React.memo(WrappedSettingsPage);
export default SettingsPage;
