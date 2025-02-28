import { Fade, useMediaQuery, useTheme } from '@mui/material';
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
import { useLocation } from 'react-router';
import { AnalysisConfirmation } from './components/Confirmation';
import { Customize } from './components/Customize';
import { Landing } from './components/Landing';
import { useForm } from './submit.form';
import { getDefaultExternalSources, getDefaultMetadata, getPreferredSubmissionProfile } from './submit.utils';

const WrappedSubmitRoute = () => {
  const location = useLocation();
  const theme = useTheme();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();

  const form = useForm();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    closeSnackbar();
    form.setFieldValue('settings', initializeSettings({ ...settings, ...MOCK_SETTINGS }));
    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('submission_create'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));
    const profile = getPreferredSubmissionProfile(settings);
    form.setFieldValue('state.profile', profile);
    if (profile === 'default') form.setFieldValue('settings', s => loadDefaultProfile(s, settings));
    else
      form.setFieldValue('settings', s =>
        loadSubmissionProfile(s, settings, configuration.submission.profiles, profile)
      );
    form.setFieldValue('settings.default_external_sources', getDefaultExternalSources(settings, configuration));
    const submitParams = new URLSearchParams(location.search);
    const hashParam = submitParams.get('hash');
    if (hashParam) {
      const [type, value] = getSubmitType(hashParam, configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
    }
    const classification = submitParams.get('classification');
    if (classification) form.setFieldValue('settings.classification.value', classification);
    const metadata = JSON.parse(submitParams.get('metadata')) as Record<string, unknown>;
    form.setFieldValue('metadata', v => getDefaultMetadata(v, configuration, metadata));
    form.setFieldValue('state.loading', false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration, currentUser, form, settings]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <AnalysisConfirmation />

      <form.Subscribe
        selector={state => [state.values.state.adjust, state.values.state.loading]}
        children={([adjust]) => (
          <div style={{ position: 'relative', height: '200px' }}>
            <Fade in={!adjust} mountOnEnter>
              <Landing hidden={adjust} />
            </Fade>
            <Fade in={adjust} mountOnEnter>
              <Customize hidden={!adjust} />
            </Fade>
          </div>
        )}
      />
    </PageCenter>
  );
};

export const SubmitRoute = React.memo(WrappedSubmitRoute);
