import { useMediaQuery, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import {
  getProfileNames,
  initializeSettings,
  loadDefaultProfile,
  loadSubmissionProfile
} from 'components/routes/settings/settings.utils';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { MOCK_SETTINGS } from '../settings/utils/data3';
import {
  AdjustButton,
  AnalyzeButton,
  Banner,
  BannerAlert,
  CancelButton,
  FileInput,
  HashInput,
  SubmitClassification,
  ToS
} from './components/Components';
import { AnalysisConfirmation } from './components/Confirmation';
import { SelectSubmissionProfile } from './components/SubmissionProfile';
import type { TabKey } from './submit.form';
import { useForm } from './submit.form';

const WrappedSubmitRoute = () => {
  const { t } = useTranslation(['submit']);
  const location = useLocation();
  const theme = useTheme();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();

  const form = useForm();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    closeSnackbar();

    form.setFieldValue('settings', initializeSettings({ ...settings, ...MOCK_SETTINGS }) as any);

    form.setFieldValue('state.disabled', !currentUser.is_admin && !currentUser.roles.includes('submission_create'));
    form.setFieldValue('state.customize', currentUser.is_admin || currentUser.roles.includes('submission_customize'));

    const profile = getProfileNames(settings).includes(settings.preferred_submission_profile)
      ? settings.preferred_submission_profile
      : getProfileNames(settings)[0];

    form.setFieldValue('state.profile', profile);

    if (profile === 'default') form.setFieldValue('settings', s => loadDefaultProfile(s as any, settings) as any);
    else
      form.setFieldValue(
        'settings',
        s => loadSubmissionProfile(s as any, settings, configuration.submission.profiles, profile) as any
      );

    form.setFieldValue(
      'settings.default_external_sources',
      [
        ...new Set(
          Object.entries(configuration.submission.file_sources).reduce(
            (prev, [, fileSource]) => [...prev, ...fileSource.auto_selected],
            settings?.default_external_sources || []
          )
        )
      ].sort()
    );

    if (configuration?.submission?.metadata?.submit) {
      form.setFieldValue('metadata', metadata => ({
        ...(Object.fromEntries(
          Object.entries(configuration.submission.metadata.submit).reduce((prev: [string, unknown][], [key, value]) => {
            if (value.default) prev.push([key, value]);
            return prev;
          }, [])
        ) as Metadata),
        ...metadata
      }));
    }

    const submitParams = new URLSearchParams(location.search);

    const hashParam = submitParams.get('hash');
    if (hashParam) {
      const [type, value] = getSubmitType(hashParam, configuration);
      form.setFieldValue('state.tab', 'hash');
      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
      form.setFieldValue('hash.hasError', false);
    }

    // Add protection for that
    const classification = submitParams.get('classification');
    if (classification) form.setFieldValue('settings.classification.value', classification);

    const metadata = JSON.parse(submitParams.get('metadata')) as Record<string, unknown>;
    if (metadata) form.setFieldValue('metadata', metadata);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <AnalysisConfirmation />

      <Banner />
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(4) }}>
        <BannerAlert />

        <SubmitClassification />

        <form.Subscribe
          selector={state => [state.values.state.tab]}
          children={([tab]) => (
            <TabContainer
              paper
              centered
              variant="standard"
              style={{ margin: '0px' }}
              value={tab}
              onChange={(event, value: TabKey) => form.setFieldValue('state.tab', value)}
              tabs={{
                file: {
                  label: t('file'),
                  disabled: !currentUser.roles.includes('submission_create'),
                  inner: <FileInput />
                },
                hash: {
                  label: configuration.ui.allow_url_submissions ? t('url.input.title') : t('hash.input.title'),
                  disabled: !currentUser.roles.includes('submission_create'),
                  inner: <HashInput />
                }
              }}
            />
          )}
        />

        <SelectSubmissionProfile />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing(2),
            textAlign: 'left'
          }}
        >
          <div style={{ flex: 1 }}>
            <CancelButton />
          </div>

          <AdjustButton />
          <AnalyzeButton />
        </div>

        <ToS />
      </div>
    </PageCenter>
  );
};

export const SubmitRoute = React.memo(WrappedSubmitRoute);
