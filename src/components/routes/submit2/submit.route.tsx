import { Alert, useMediaQuery, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import {
  initializeSettings,
  loadDefaultProfile,
  loadSubmissionProfile
} from 'components/routes/settings/settings.utils';
import { MOCK_SETTINGS } from 'components/routes/settings/utils/data3';
import { getSubmitType } from 'helpers/utils';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { SubmissionMetadata, SubmissionOptions } from './components/Configuration';
import { AnalysisConfirmation } from './components/Confirmation';
import {
  AdjustButton,
  AnalyzeButton,
  CancelButton,
  ClassificationInput,
  FindButton,
  SubmissionProfileInput,
  TabInput,
  ToS
} from './components/Landing';
import { ServiceParameters } from './components/ServiceParameters';
import type { SubmitState } from './submit.form';
import { useForm } from './submit.form';
import {
  getDefaultExternalSources,
  getDefaultMetadata,
  getPreferredSubmissionProfile,
  isValidJSON
} from './submit.utils';

const WrappedSubmitRoute = () => {
  const { i18n } = useTranslation(['submit2']);
  const theme = useTheme();
  const banner = useAppBanner();
  const location = useLocation();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();

  const form = useForm();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    closeSnackbar();

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('submission_create'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    // to do: Remove the mock settings
    form.setFieldValue('settings', initializeSettings({ ...settings, ...MOCK_SETTINGS }));
    const profile = getPreferredSubmissionProfile(settings);
    form.setFieldValue('state.profile', profile);
    if (profile === 'default') form.setFieldValue('settings', s => loadDefaultProfile(s, settings));
    else
      form.setFieldValue('settings', s =>
        loadSubmissionProfile(s, settings, configuration.submission.profiles, profile)
      );
    form.setFieldValue('settings.default_external_sources', getDefaultExternalSources(settings, configuration));

    const search = new URLSearchParams(location.search);
    const state = location.state as SubmitState;

    if (state?.c12n) {
      form.setFieldValue('settings.classification.value', state.c12n);
    } else if (search.get('classification')) {
      form.setFieldValue('settings.classification.value', search.get('classification'));
    }

    if (state?.hash) {
      const [type, value] = getSubmitType(state?.hash || '', configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
    } else if (search.get('hash')) {
      const [type, value] = getSubmitType(search.get('hash'), configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
    }

    if (state?.metadata && typeof state.metadata === 'object' && Object.keys(state.metadata).length > 0) {
      form.setFieldValue('metadata', getDefaultMetadata(state.metadata, configuration));
    } else if (isValidJSON(search.get('metadata'))) {
      const metadata = JSON.parse(search.get('metadata')) as object;
      form.setFieldValue('metadata', getDefaultMetadata(metadata, configuration));
    }

    form.setFieldValue('state.loading', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser, settings]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <AnalysisConfirmation />

      {banner}

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}

      <form.Subscribe
        selector={state => [state.values.state.adjust, state.values.state.loading]}
        children={([adjust, loading]) => (
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: theme.spacing(3) }}>
            <div
              style={{
                paddingRight: '0px',
                width: '100%',
                transition: theme.transitions.create(['width', 'padding-left'], {
                  duration: theme.transitions.duration.shortest
                }),
                ...(adjust && {
                  width: '50%',
                  paddingRight: theme.spacing(1)
                })
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: theme.spacing(3),
                  justifyContent: 'start'
                }}
              >
                <ClassificationInput />
                <TabInput />
                <SubmissionProfileInput />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: theme.spacing(1),
                    textAlign: 'left'
                  }}
                >
                  <CancelButton />
                  <div style={{ flex: 1 }} />
                  <FindButton />
                  <AdjustButton />
                  <AnalyzeButton />
                </div>

                <ToS />
              </div>
            </div>

            <div
              style={{
                paddingLeft: '0px',
                overflow: 'hidden',
                width: '0%',
                maxHeight: '0px',
                transition: theme.transitions.create(['width', 'max-height', 'padding-left'], {
                  duration: theme.transitions.duration.shortest
                }),
                ...(adjust && {
                  width: '50%',
                  maxHeight: 'fit-content',
                  paddingLeft: theme.spacing(1)
                })
              }}
            >
              {loading ? null : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: theme.spacing(3),
                    justifyContent: 'start',
                    textAlign: 'start'
                  }}
                >
                  <SubmissionOptions />
                  <SubmissionMetadata />
                  <ServiceParameters />
                </div>
              )}

              {/* <Customize /> */}
            </div>
          </div>
        )}
      />

      <div style={{ height: '200px' }} />
    </PageCenter>
  );
};

export const SubmitRoute = React.memo(WrappedSubmitRoute);
