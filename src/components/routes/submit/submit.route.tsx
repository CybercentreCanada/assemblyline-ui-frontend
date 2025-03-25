import { Alert, Collapse, styled, useMediaQuery, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import type { UserSettings } from 'components/models/base/user_settings';
import {
  initializeSettings,
  loadDefaultProfile,
  loadSubmissionProfile
} from 'components/routes/settings/settings.utils';
import type { SubmitStore } from 'components/routes/submit/submit.form';
import { useForm } from 'components/routes/submit/submit.form';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { ServiceParameters } from './components/ServiceParameters';
import { SubmissionData } from './components/SubmissionData';
import {
  AdjustButton,
  AnalyzeSubmission,
  CancelButton,
  ClassificationInput,
  CustomizabilityAlert,
  ExternalServices,
  ExternalSources,
  FileInput,
  FindButton,
  HashInput,
  MaliciousInput,
  SubmissionProfileInput,
  ToS
} from './components/SubmissionInputs';
import { SubmissionMetadata } from './components/SubmissionMetadata';
import { SubmissionOptions } from './components/SubmissionOptions';
import type { SubmitState } from './submit.form';
import { getDefaultExternalSources, getPreferredSubmissionProfile, isValidJSON } from './submit.utils';

type AdjustProps = {
  adjust: boolean;
};

const Container = styled('div')<AdjustProps>(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    rowGap: theme.spacing(3)
  }
}));

const LeftPanel = styled('div')<AdjustProps>(({ theme, adjust }) => ({
  paddingRight: '0px',
  width: '100%',
  transition: theme.transitions.create(['width', 'padding-left'], {
    duration: theme.transitions.duration.shortest
  }),
  ...(adjust && {
    width: '50%',
    paddingRight: theme.spacing(1)
  }),
  [theme.breakpoints.down('md')]: {
    display: 'contents',
    ...(adjust && {
      width: '100%'
    })
  }
}));

const LeftInnerPanel = styled('div')<AdjustProps>(({ theme }) => ({
  position: 'sticky',
  top: '64px',
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(3),
  justifyContent: 'start',
  [theme.breakpoints.down('md')]: {
    position: 'initial',
    display: 'contents'
  }
}));

const LeftPanelAction = styled('div')<AdjustProps>(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    position: 'sticky',
    top: '63px',
    backgroundColor: theme.palette.background.default,
    zIndex: 1
  }
}));

const RightPanel = styled('div')<AdjustProps>(({ theme, adjust }) => ({
  paddingLeft: '0px',
  overflow: 'hidden',
  width: '0%',
  transition: theme.transitions.create(['width', 'max-height', 'padding-left'], {
    duration: theme.transitions.duration.shortest
  }),
  ...(adjust && {
    width: '50%',
    paddingLeft: theme.spacing(1)
  }),
  [theme.breakpoints.down('md')]: {
    width: '100%',
    paddingLeft: theme.spacing(0)
  }
}));

const WrappedSubmitRoute = () => {
  const { t, i18n } = useTranslation(['submit']);
  const theme = useTheme();
  const banner = useAppBanner();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration } = useALContext();

  const form = useForm();

  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    closeSnackbar();

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('submission_create'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response: settings }) => {
        form.setFieldValue('settings', initializeSettings(settings));
        const profile = getPreferredSubmissionProfile(settings);
        form.setFieldValue('state.profile', profile);
        if (profile === 'default') form.setFieldValue('settings', s => loadDefaultProfile(s, settings, currentUser));
        else
          form.setFieldValue('settings', s =>
            loadSubmissionProfile(s, settings, configuration.submission.profiles, currentUser, profile)
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
          form.setFieldValue('metadata.data', state.metadata);
        } else if (isValidJSON(search.get('metadata'))) {
          const metadata = JSON.parse(search.get('metadata')) as Metadata;
          form.setFieldValue('metadata.data', metadata);
        }

        form.setFieldValue('state.phase', 'editing');
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser]);

  return (
    <PageCenter maxWidth={downMD ? '100%' : `${theme.breakpoints.values.md}px`} margin={4} width="100%">
      {banner}

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}

      <form.Subscribe
        selector={state =>
          [state.values.state.adjust, state.values.state.phase === 'loading', state.values.state.disabled] as const
        }
        children={([adjust, loading, disabled]) => (
          <Container adjust={adjust}>
            <LeftPanel adjust={adjust}>
              <LeftInnerPanel adjust={adjust}>
                <ClassificationInput />

                <form.Subscribe
                  selector={state => [state.values.state.tab, state.values.state.phase === 'editing'] as const}
                  children={([type, editing]) => (
                    <TabContainer
                      paper
                      centered
                      variant="standard"
                      style={{ margin: '0px' }}
                      value={type}
                      onChange={(e, v: SubmitStore['state']['tab']) => form.setFieldValue('state.tab', v)}
                      tabs={{
                        file: {
                          label: t('tab.label.file'),
                          disabled: disabled || !editing
                        },
                        hash: {
                          label: configuration.ui.allow_url_submissions ? t('tab.label.url') : t('tab.label.hash'),
                          disabled: disabled || !editing
                        }
                      }}
                      sx={{
                        '.MuiTabs-indicator': {
                          display: 'none'
                        }
                      }}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => [state.values.state.tab] as const}
                  children={([tab]) => (tab === 'file' ? <FileInput /> : tab === 'hash' ? <HashInput /> : null)}
                />

                <SubmissionProfileInput />

                {loading ? null : (
                  <>
                    <MaliciousInput />
                    <ExternalSources />
                    <ExternalServices />
                  </>
                )}

                <LeftPanelAction adjust={adjust}>
                  <CancelButton />
                  <div style={{ flex: 1 }} />
                  <FindButton />
                  <AdjustButton />
                  <AnalyzeSubmission />
                </LeftPanelAction>

                <ToS />
              </LeftInnerPanel>
            </LeftPanel>

            <RightPanel adjust={adjust}>
              {loading ? null : (
                <Collapse
                  in={adjust}
                  sx={{
                    '& .MuiCollapse-wrapperInner': {
                      display: 'flex',
                      flexDirection: 'column',
                      rowGap: theme.spacing(2),
                      flex: 1,
                      justifyContent: 'start',
                      textAlign: 'start'
                    }
                  }}
                >
                  <CustomizabilityAlert />
                  <SubmissionOptions />
                  <SubmissionData />
                  <ServiceParameters />
                  <SubmissionMetadata />
                </Collapse>
              )}
            </RightPanel>
          </Container>
        )}
      />

      <div style={{ height: '200px' }} />
    </PageCenter>
  );
};

export const SubmitRoute = React.memo(WrappedSubmitRoute);
