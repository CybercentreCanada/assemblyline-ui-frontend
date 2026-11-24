import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import { Alert, Collapse, styled, useMediaQuery, useTheme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import { createAppRoute, useAppSearchSnapshot } from 'core/router';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import { useAppBanner } from 'core/template/components/app/hooks';
import PageCenter from 'core/template/components/pages/PageCenter';
import type { Metadata } from 'models/base/submission';
import { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { initializeSettings, loadDefaultProfile, loadSubmissionProfile } from 'routes/settings/settings.utils';
import { ServiceParameters } from 'routes/submit/components/ServiceParameters';
import { SubmissionData } from 'routes/submit/components/SubmissionData';
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
} from 'routes/submit/components/SubmissionInputs';
import { SubmissionMetadata } from 'routes/submit/components/SubmissionMetadata';
import { SubmissionOptions } from 'routes/submit/components/SubmissionOptions';
import type { SubmitStore } from 'routes/submit/submit.form';
import { FLOW, FormProvider, useForm } from 'routes/submit/submit.form';
import {
  calculateFileHash,
  getDefaultExternalSources,
  getPreferredSubmissionProfile,
  switchProfile,
  useAutoURLServicesSelection
} from 'routes/submit/submit.utils';
import { getSubmitType } from 'shared/utils/utils';
import generateUUID from 'shared/utils/uuid';
import { TabContainer } from 'ui/TabContainer';

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

export const SubmitContent = memo(() => {
  const { t, i18n } = useTranslation(['submit']);
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const banner = useAppBanner();
  const search = useAppSearchSnapshot<'/submit'>();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();
  const form = useForm();

  const applyAutoURLServicesSelection = useAutoURLServicesSelection();

  const setClassificationFromURL = useCallback(
    (params: typeof search) => {
      const classification = params.get('classification');
      if (classification) form.setFieldValue('settings.classification.value', classification);
    },
    [form]
  );

  const setHashFromURL = useCallback(
    (params: typeof search) => {
      const raw = params.get('hash');
      if (!raw) return;

      const [type, value] = getSubmitType(raw, configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
    },
    [configuration, form]
  );

  const setMetadataFromURL = useCallback(
    (params: typeof search) => {
      const metadata = params.get('metadata');
      if (metadata) form.setFieldValue('metadata.data', metadata as Metadata);
    },
    [form]
  );

  const setProfileFromURL = useCallback(
    (params: typeof search) => {
      const name = params.get('profile');
      if (!name || !(name in settings.submission_profiles)) return;

      form.setFieldValue('state.profile', name);
      form.setFieldValue('settings', s => switchProfile(s, configuration, settings, currentUser, name));
    },
    [configuration, settings, currentUser, form]
  );

  const setRawFromURL = useCallback(
    (params: typeof search) => {
      const raw = params.get('raw');
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
    (params: typeof search) => {
      const desc = params.get('description');
      if (!desc) return;
      form.setFieldValue('settings.description.value', desc);
    },
    [form]
  );

  const setPriorityFromURL = useCallback(
    (params: typeof search) => {
      const priority = params.get('priority');
      if (priority === 500 || priority === 1000 || priority === 1500) {
        form.setFieldValue('settings.priority.value', priority);
      }
    },
    [form]
  );

  const setTTLFromURL = useCallback(
    (params: typeof search) => {
      const ttl = params.get('ttl');
      if (ttl === null) return;

      const maxDTL = configuration.submission.max_dtl;
      const max = maxDTL !== 0 ? maxDTL : 365;
      const min = maxDTL !== 0 ? 1 : 0;

      if (ttl >= min && ttl <= max) {
        form.setFieldValue('settings.ttl.value', ttl);
      }
    },
    [configuration, form]
  );

  const setFileTypeFromURL = useCallback(
    (params: typeof search) => {
      const fileType = params.get('filetypeOverride');
      if (!fileType) return;
      form.setFieldValue('settings.filetype_override.value', fileType);
    },
    [form]
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

    setClassificationFromURL(search);
    setHashFromURL(search);
    setMetadataFromURL(search);
    setProfileFromURL(search);
    setRawFromURL(search);
    setDescriptionFromURL(search);
    setPriorityFromURL(search);
    setTTLFromURL(search);
    setFileTypeFromURL(search);

    form.setFieldValue('state.phase', 'editing');

    applyAutoURLServicesSelection();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser, search?.toString(), settings]);

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
});

export const SubmitPage = memo(() => (
  <FormProvider>
    <SubmitContent />
  </FormProvider>
));

export const SubmitRoute = createAppRoute({
  component: SubmitPage,

  path: '/submit',
  search: s => ({
    classification: s.string(null).source('transient'),
    description: s.string('').source('transient'),
    filetypeOverride: s.string(null).source('transient'),
    hash: s.string(null),
    metadata: s.object(null).source('transient'),
    priority: s.enum(null, [500, 1000, 1500]).source('transient').nullable(),
    profile: s.string(null).source('transient'),
    raw: s.string('').source('transient'),
    ttl: s.number(null).source('transient')
  }),

  ancestor: null,
  shortname: () => ['app_route.submit.shortname', { ns: 'submit' }],
  fullname: () => ['app_route.submit.fullname', { ns: 'submit' }],
  shorticon: () => <PublishOutlinedIcon />,
  fullicon: () => <PublishOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});

export const SubmitRootRoute = createAppRoute({
  component: SubmitPage,

  path: '/',
  search: s => ({
    classification: s.string(null).source('transient').nullable(),
    description: s.string('').source('transient').nullable(),
    filetypeOverride: s.string(null).source('transient').nullable(),
    hash: s.string(null),
    metadata: s.object(null).source('transient').nullable(),
    priority: s.enum(null, [500, 1000, 1500]).source('transient').nullable(),
    profile: s.string(null).source('transient').nullable(),
    raw: s.string('').source('transient').nullable(),
    ttl: s.number(null).source('transient').nullable()
  }),

  ancestor: null,
  shortname: () => ['app_route.submit.shortname', { ns: 'submit' }],
  fullname: () => ['app_route.submit.fullname', { ns: 'submit' }],
  shorticon: () => <PublishOutlinedIcon />,
  fullicon: () => <PublishOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
