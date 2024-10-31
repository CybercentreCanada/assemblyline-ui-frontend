import Flow from '@flowjs/flow.js';
import { Alert, Grid, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import { UserSettings } from 'components/models/base/user_settings';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { MetadataParameters } from './components/MetadataParameters';
import { ServiceSelection } from './components/ServiceSelection';
import { SubmissionParameters } from './components/SubmissionParameters';
import { FormProvider, useForm } from './contexts/form';
import { DEFAULT_SETTINGS } from './mock/settings';
import { FileSubmit } from './tabs/file';
import { HashSubmit } from './tabs/hash';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overFLOWX: 'hidden',
    whiteSpace: 'nowrap',
    textOverFLOW: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const FLOW = new Flow({
  target: '/api/v4/ui/FLOWjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

const TABS = ['file', 'hash', 'options'] as const;
type Tabs = (typeof TABS)[number];

type SubmitState = {
  hash: string;
  tabContext: Tabs; // Ensure this is set correct elsewhere
  c12n: string;
  metadata?: Metadata;
};

type SubmitProps = {
  none: boolean;
};

const WrappedSubmitContent = () => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const form = useForm();

  const [tab, setTab] = useState<Tabs>('file');

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const submitState = useMemo<SubmitState>(() => location.state as SubmitState, [location.state]);
  const submitParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const handleValidateServiceSelection = useCallback(() => {
    // to do
    console.log(form.store.state.values);
  }, []);

  const handleCancelUpload = useCallback(() => {
    form.setStore(s => ({ ...s, file: null, allowClick: true, uploadProgress: null, uuid: generateUUID() }));
    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  useEffect(() => {
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setStore(s => {
          s.settings = { ...api_response } as any;

          // Check if some file sources should auto-select and do so
          s.settings.default_external_sources = Array.from(
            new Set(
              Object.entries(configuration.submission.file_sources).reduce(
                (prev, [, fileSource]) => [...prev, ...fileSource.auto_selected],
                api_response?.default_external_sources || []
              )
            )
          );

          s.settings.service_spec.sort((a, b) => a.name.localeCompare(b.name));
          s.settings.services.sort((a, b) => a.name.localeCompare(b.name));

          Object.keys(s.settings.services).forEach(key => {
            s.settings.services[key].services.sort((a, b) => a.name.localeCompare(b.name));
          });

          if (!currentUser.roles.includes('submission_customize')) {
            s.submissionProfile = api_response.preferred_submission_profile;
          }

          s.settings = DEFAULT_SETTINGS;

          return s;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser]);

  useEffect(() => {
    // Question :  do we want to unselect those services when
    if (!form.state.values.settings || form.state.values.input.type !== 'url') return;
    form.setStore(s => {
      s.settings.services.forEach((category, i) => {
        category.services.forEach((service, j) => {
          if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
            s.settings.services[i].services[j].selected = true;
          }
        });
        s.settings.services[i].selected = s.settings.services[i].services.every(svr => svr.selected);
      });
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration.ui.url_submission_auto_service_selection, form.state.values.input.type]);

  useEffect(() => {
    const inputParam = submitParams.get('input') || '';
    if (inputParam) {
      const [type, value] = getSubmitType(inputParam, configuration);
      setTab('hash');
      form.setStore(s => ({ ...s, input: { ...s.input, type, value, hasError: false } }));
      closeSnackbar();
    }

    const classification = submitParams.get('classification');
    if (classification) {
      form.setStore(s => ({ ...s, settings: { ...s.settings, classification } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration, submitParams]);

  useEffect(() => {
    if (submitState) {
      const [type, value] = getSubmitType(submitState.hash, configuration);
      setTab(submitState.tabContext);
      form.setStore(s => ({
        ...s,
        input: { ...s.input, type, value, hasError: false },
        settings: { ...s.settings, classification: submitState.c12n },
        submissionMetadata: submitState.metadata
      }));
      closeSnackbar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration, submitState]);

  useEffect(() => {
    if (!configuration?.submission?.metadata?.submit) return;
    form.setStore(s => ({
      ...s,
      submissionMetadata: {
        ...Object.fromEntries(
          Object.entries(configuration.submission.metadata.submit).reduce((prev: [string, unknown][], [key, value]) => {
            if (value.default) prev.push([key, value]);
            return prev;
          }, [])
        ),
        ...s.submissionMetadata
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <form.Subscribe
        selector={state => [state.canSubmit, state.isSubmitting, state.values.validate]}
        children={([canSubmit, isSubmitting, validate]) => (
          <ConfirmationDialog
            open={validate}
            // handleClose={event => setValidate(false)}
            handleClose={() => form.store.setState(s => ({ ...s, validate: false }))}
            // handleCancel={cleanupServiceSelection}
            // handleAccept={executeCB}
            handleAccept={() => {}}
            title={t('validate.title')}
            cancelText={t('validate.cancelText')}
            acceptText={t('validate.acceptText')}
            text={t('validate.text')}
          />
        )}
      />

      <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}

      {c12nDef.enforce ? (
        <form.Field
          name="settings.classification"
          children={({ state, handleBlur, handleChange }) => (
            <div style={{ paddingBottom: theme.spacing(4) }}>
              <div style={{ padding: theme.spacing(1), fontSize: 16 }}>{t('classification')}</div>
              <Classification
                format="long"
                type="picker"
                c12n={state.value ? state.value : null}
                setClassification={classification => handleChange(classification)}
                disabled={!currentUser.roles.includes('submission_create')}
              />
            </div>
          )}
        />
      ) : null}

      <TabContainer
        indicatorColor="primary"
        textColor="primary"
        paper
        centered
        variant="standard"
        style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
        value={tab}
        onChange={(event, value) => setTab(value)}
        tabs={{
          file: {
            label: t('file'),
            disabled: !currentUser.roles.includes('submission_create'),
            inner: (
              <FileSubmit
                onValidateServiceSelection={handleValidateServiceSelection}
                onCancelUpload={handleCancelUpload}
              />
            )
          },
          hash: {
            label: `${t('urlHash.input_title')}${t('urlHash.input_suffix')}`,
            disabled: !currentUser.roles.includes('submission_create'),
            inner: <HashSubmit onValidateServiceSelection={handleValidateServiceSelection} />
          },
          options: {
            label: t('options'),
            disabled: !currentUser.roles.includes('submission_create'),
            inner: (
              <Grid container columnGap={2}>
                <Grid item xs={12} md>
                  <ServiceSelection />
                </Grid>
                <Grid item xs={12} md>
                  <SubmissionParameters />
                  <MetadataParameters />
                </Grid>
              </Grid>
            )
          }
        }}
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
