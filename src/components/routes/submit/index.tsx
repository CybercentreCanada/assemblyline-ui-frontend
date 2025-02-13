import Flow from '@flowjs/flow.js';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Alert, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import { loadSubmissionProfiles } from 'components/routes/submit/utils/utils';
import Classification from 'components/visual/Classification';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { FileSubmit } from './components/File';
import { HashSubmit } from './components/Hash';
import { MetadataParameters } from './components/MetadataParameters';
import { ServiceSelection } from './components/ServiceSelection';
import { SubmissionParameters } from './components/SubmissionParameters';
import { SubmissionProfile } from './components/SubmissionProfile';
import type { TabKey } from './contexts/form';
import { DEFAULT_SUBMIT_FORM, FormProvider, useForm } from './contexts/form';

export const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

const drawerPadding = 40;

const WrappedSubmitContent = () => {
  const { t, i18n } = useTranslation(['submit']);
  const banner = useAppBanner();
  const location = useLocation();
  const theme = useTheme();
  const { closeSnackbar } = useMySnackbar();
  const { user: currentUser, c12nDef, configuration, settings } = useALContext();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const form = useForm();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    closeSnackbar();
    const submitParams = new URLSearchParams(location.search);
    form.setStore(s => {
      s = { ...s, ...structuredClone(DEFAULT_SUBMIT_FORM) };

      const hashParam = submitParams.get('hash');
      if (hashParam) {
        const [type, value] = getSubmitType(hashParam, configuration);
        s.state.tab = 'hash';
        s.hash.type = type;
        s.hash.value = value;
        s.hash.hasError = false;
      }

      const classification = submitParams.get('classification');
      if (classification) {
        s.settings = { ...s.settings, classification };
      }

      const metadata = JSON.parse(submitParams.get('metadata')) as Record<string, unknown>;
      if (metadata) {
        s.metadata = metadata;
      }

      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration]);

  useEffect(() => {
    form.setStore(s => {
      // Check if the user is allowed to customize their submission and load profiles accordingly
      s.state.customize = currentUser.is_admin || currentUser.roles.includes('submission_customize');
      s.settings = loadSubmissionProfiles(settings, configuration.submission.profiles);

      // Determine the profile that gets auto-selected on page load
      const profileKeys = Object.keys(settings.submission_profiles);
      s.state.profile = profileKeys.includes(settings.preferred_submission_profile)
        ? settings.preferred_submission_profile
        : profileKeys[0];

      // // Assign properties of the preferred profile to what will be sent to the API
      // Object.entries(s.settings.profiles[s.state.profile]).forEach(([k, v]) => (s.settings[k] = v.value));
      s.settings.classification = s.settings.profiles[s.state.profile].classification.value;

      // Check if some file sources should auto-select and do so
      s.settings.default_external_sources = [
        ...new Set(
          Object.entries(configuration.submission.file_sources).reduce(
            (prev, [, fileSource]) => [...prev, ...fileSource.auto_selected],
            settings?.default_external_sources || []
          )
        )
      ].sort();
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser]);

  useEffect(() => {
    if (!configuration?.submission?.metadata?.submit) return;
    form.setStore(s => ({
      ...s,
      metadata: {
        ...(Object.fromEntries(
          Object.entries(configuration.submission.metadata.submit).reduce((prev: [string, unknown][], [key, value]) => {
            if (value.default) prev.push([key, value]);
            return prev;
          }, [])
        ) as Metadata),
        ...s.metadata
      }
    }));
  }, [configuration, form]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}

      <form.Subscribe
        selector={state => [
          state.values.state.profile,
          !state.values.settings,
          state.values.state.disabled,
          state.values.state.customize
        ]}
        children={([profile, loading, disabled, customize]) => (
          <>
            {!c12nDef?.enforce ? null : (
              <form.Field
                name="settings.classification"
                children={({ state, handleChange }) => (
                  <div style={{ paddingBottom: theme.spacing(4) }}>
                    <div style={{ padding: theme.spacing(1), fontSize: 16 }}>{t('classification')}</div>
                    <Classification
                      format="long"
                      type="picker"
                      c12n={state.value}
                      setClassification={classification => handleChange(classification)}
                      disabled={!currentUser.roles.includes('submission_create')}
                    />
                  </div>
                )}
              />
            )}
            <SubmissionProfile
              loading={loading as boolean}
              disabled={disabled as boolean}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />

            <form.Subscribe
              selector={state => [state.values.state.tab]}
              children={([tab]) => (
                <TabContainer
                  indicatorColor="primary"
                  textColor="primary"
                  paper
                  centered
                  variant="standard"
                  style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
                  value={tab}
                  onChange={(event, value: TabKey) => {
                    form.setStore(s => {
                      s.state.tab = value;
                      return s;
                    });
                  }}
                  tabs={{
                    file: {
                      label: t('file'),
                      disabled: !currentUser.roles.includes('submission_create'),
                      inner: (
                        <FileSubmit
                          profile={profile as string}
                          loading={loading as boolean}
                          disabled={disabled as boolean}
                        />
                      )
                    },
                    hash: {
                      label: t('urlHash.input_title'),
                      disabled: !currentUser.roles.includes('submission_create'),
                      inner: (
                        <HashSubmit
                          profile={profile as string}
                          loading={loading as boolean}
                          disabled={disabled as boolean}
                        />
                      )
                    }
                  }}
                />
              )}
            />
            {profile && (
              <Drawer
                onClose={() => setDrawerOpen(false)}
                anchor="right"
                open={drawerOpen}
                variant={drawerOpen ? 'persistent' : 'temporary'}
              >
                <>
                  <IconButton
                    onClick={() => setDrawerOpen(false)}
                    style={{ justifyContent: 'left', width: 'min-content' }}
                  >
                    <CloseOutlinedIcon />
                  </IconButton>
                  <div
                    style={{
                      paddingRight: `${drawerPadding}px`,
                      paddingLeft: `${drawerPadding}px`,
                      marginTop: '-20px'
                    }}
                  >
                    <ServiceSelection
                      profile={profile as string}
                      loading={loading as boolean}
                      disabled={disabled as boolean}
                      customize={customize as boolean}
                      filterServiceParams={true}
                    />
                    <SubmissionParameters
                      profile={profile as string}
                      loading={loading as boolean}
                      disabled={disabled as boolean}
                      customize={customize as boolean}
                    />
                    <MetadataParameters
                      profile={profile as string}
                      loading={loading as boolean}
                      disabled={disabled as boolean}
                      customize={customize as boolean}
                    />
                  </div>
                </>
              </Drawer>
            )}
          </>
        )}
      />
    </PageCenter>
  );
};

const SubmitContent = React.memo(WrappedSubmitContent);

const WrappedSubmitPage = () => (
  <FormProvider>
    <SubmitContent />
  </FormProvider>
);

export const SubmitPage = React.memo(WrappedSubmitPage);
export default SubmitPage;
