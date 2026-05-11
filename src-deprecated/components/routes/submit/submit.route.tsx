import { Alert, Collapse, styled, useMediaQuery, useTheme } from '@mui/material';
import { useAppBanner } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import {
  initializeSettings,
  loadDefaultProfile,
  loadSubmissionProfile
} from 'components/routes/settings/settings.utils';
import { ServiceParameters } from 'components/routes/submit/components/ServiceParameters';
import { SubmissionData } from 'components/routes/submit/components/SubmissionData';
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
  RawInput,
  SubmissionProfileInput,
  ToS
} from 'components/routes/submit/components/SubmissionInputs';
import { SubmissionMetadata } from 'components/routes/submit/components/SubmissionMetadata';
import { SubmissionOptions } from 'components/routes/submit/components/SubmissionOptions';
import type { SubmitState, SubmitStore } from 'components/routes/submit/submit.form';
import { FLOW, useForm } from 'components/routes/submit/submit.form';
import {
  calculateFileHash,
  getDefaultExternalSources,
  getPreferredSubmissionProfile,
  isValidJSON,
  switchProfile,
  useAutoURLServicesSelection
} from 'components/routes/submit/submit.utils';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

type AdjustProps = { adjust: boolean };

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
  paddingRight: 0,
  width: adjust ? '50%' : '100%',
  transition: theme.transitions.create(['width', 'padding-left'], {
    duration: theme.transitions.duration.shortest
  }),
  ...(adjust && { paddingRight: theme.spacing(1) }),
  [theme.breakpoints.down('md')]: {
    display: 'contents',
    width: '100%'
  }
}));

const LeftInnerPanel = styled('div')<AdjustProps>(({ theme }) => ({
  position: 'sticky',
  top: '64px',
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
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
  paddingLeft: 0,
  overflow: 'hidden',
  width: adjust ? '50%' : '0%',
  transition: theme.transitions.create(['width', 'max-height', 'padding-left'], {
    duration: theme.transitions.duration.shortest
  }),
  ...(adjust && { paddingLeft: theme.spacing(1) }),
  [theme.breakpoints.down('md')]: {
    width: '100%',
    paddingLeft: 0
  }
}));

const WrappedSubmitRoute = () => {
  const { t, i18n } = useTranslation(['submit']);
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const banner = useAppBanner();
  const location = useLocation();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();
  const form = useForm();

  const applyAutoURLServicesSelection = useAutoURLServicesSelection();

  const setClassificationFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      if (state?.c12n) {
        form.setFieldValue('settings.classification.value', state.c12n);
      } else {
        const c12 = search.get('classification');
        if (c12) form.setFieldValue('settings.classification.value', c12);
      }
    },
    [form]
  );

  const setHashFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const raw = state?.hash || search.get('hash');
      if (!raw) return;

      const [type, value] = getSubmitType(raw, configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
    },
    [configuration, form]
  );

  const setMetadataFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      if (state?.metadata && typeof state.metadata === 'object' && Object.keys(state.metadata).length > 0) {
        form.setFieldValue('metadata.data', state.metadata);
        return;
      }

      const raw = search.get('metadata');
      if (isValidJSON(raw)) {
        const metadata = JSON.parse(raw) as Metadata;
        form.setFieldValue('metadata.data', metadata);
      }
    },
    [form]
  );

  const setProfileFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const name = state?.profile || search.get('profile');
      if (!name || !(name in settings.submission_profiles)) return;

      form.setFieldValue('state.profile', name);
      form.setFieldValue('settings', s => switchProfile(s, configuration, settings, currentUser, name));
    },
    [configuration, settings, currentUser, form]
  );

  const setRawFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const raw = state?.raw || search.get('raw');
      if (!raw) return;

      const encoder = new TextEncoder();
      const tempFile = new File([encoder.encode(raw)], 'file.txt', { type: 'text/plain;charset=utf-8' });

      form.setFieldValue('state.tab', 'raw');
      form.setFieldValue('raw.value', raw);
      calculateFileHash(tempFile)
        .then(hash => form.setFieldValue('raw.hash', hash))
        // eslint-disable-next-line no-console
        .catch(console.error);
    },
    [form]
  );

  const setDescriptionFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const desc = state?.description || search.get('description');
      if (!desc) return;
      form.setFieldValue('settings.description.value', desc);
    },
    [form]
  );

  const setPriorityFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const priority = state?.priority || search.get('priority');
      if (!priority) return;
      const val = Number.parseInt(priority, 10);
      if (val === 500 || val === 1000 || val === 1500) {
        form.setFieldValue('settings.priority.value', val);
      }
    },
    [form]
  );

  const setTTLFromURL = useCallback(
    (state: SubmitState, search: URLSearchParams) => {
      const ttl = state?.ttl || search.get('ttl');
      if (!ttl) return;

      const val = Number.parseInt(ttl, 10);
      if (Number.isNaN(val)) return;

      const maxDTL = configuration.submission.max_dtl;
      const max = maxDTL !== 0 ? maxDTL : 365;
      const min = maxDTL !== 0 ? 1 : 0;

      if (val >= min && val <= max) {
        form.setFieldValue('settings.ttl.value', val);
      }
    },
    [configuration, form]
  );

  useEffect(() => {
    closeSnackbar();

    form.reset();
    form.setFieldValue('state.uuid', generateUUID());

    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('submission_create'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));
    form.setFieldValue('settings', initializeSettings(settings));
    const profile = getPreferredSubmissionProfile(settings);
    form.setFieldValue('state.profile', profile);
    form.setFieldValue('settings', s =>
      profile === 'default'
        ? loadDefaultProfile(s, settings, currentUser)
        : loadSubmissionProfile(s, settings, configuration.submission?.profiles, currentUser, profile)
    );
    form.setFieldValue('settings.default_external_sources', getDefaultExternalSources(settings, configuration));

    const search = new URLSearchParams(location.search);
    const state = location.state as SubmitState;

    setClassificationFromURL(state, search);
    setHashFromURL(state, search);
    setMetadataFromURL(state, search);
    setProfileFromURL(state, search);
    setRawFromURL(state, search);
    setDescriptionFromURL(state, search);
    setPriorityFromURL(state, search);
    setTTLFromURL(state, search);

    form.setFieldValue('state.phase', 'editing');

    applyAutoURLServicesSelection();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser, settings]);

  return (
    <PageCenter maxWidth={downMD ? '100%' : `${theme.breakpoints.values.md}px`} margin={3.5} width="100%">
      {banner}

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level}>
          {configuration.ui.banner[i18n.language] ?? configuration.ui.banner.en}
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
                  selector={s => [s.values.state.tab, s.values.state.phase === 'editing'] as const}
                  children={([tab, editing]) => (
                    <TabContainer
                      paper
                      centered
                      variant="standard"
                      style={{ margin: 0 }}
                      value={tab}
                      onChange={(e, v: SubmitStore['state']['tab']) => form.setFieldValue('state.tab', v)}
                      tabs={{
                        file: {
                          label: t('tab.label.file'),
                          disabled: disabled || !editing
                        },
                        hash: {
                          label: configuration.ui.allow_url_submissions ? t('tab.label.url') : t('tab.label.hash'),
                          disabled: disabled || !editing
                        },
                        raw: {
                          label: t('tab.label.raw'),
                          disabled: disabled || !editing
                        }
                      }}
                      sx={{
                        '.MuiTabs-indicator': { display: 'none' }
                      }}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => [state.values.state.tab] as const}
                  children={([tab]) =>
                    tab === 'file' ? (
                      <FileInput />
                    ) : tab === 'hash' ? (
                      <HashInput />
                    ) : tab === 'raw' ? (
                      <RawInput />
                    ) : null
                  }
                />

                <SubmissionProfileInput />

                <LeftPanelAction adjust={adjust}>
                  <CancelButton />
                  <div style={{ flex: 1 }} />
                  <FindButton />
                  <AdjustButton />
                  <AnalyzeSubmission />
                </LeftPanelAction>

                {!loading && (
                  <>
                    <MaliciousInput />
                    <ExternalSources />
                    <ExternalServices />
                  </>
                )}

                <ToS />
              </LeftInnerPanel>
            </LeftPanel>

            <RightPanel adjust={adjust}>
              {!loading && (
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
