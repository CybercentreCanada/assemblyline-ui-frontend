import Flow from '@flowjs/flow.js';
import { Alert, Grid, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import type { APIResponseProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata, Submission } from 'components/models/base/submission';
import type { UserSettings } from 'components/models/base/user_settings';
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

  const handleUploadFile = useCallback(() => {
    form.setStore(s => ({ ...s, allowClick: false, uploadProgress: 0 }));
    FLOW.opts.generateUniqueIdentifier = file => {
      const relativePath = file.relativePath || file.file.webkitRelativePath || file.file.name || file.name;
      return `${form.state.values.uuid}_${form.state.values.file.size}_${relativePath.replace(
        /[^0-9a-zA-Z_-]/gim,
        ''
      )}`;
    };

    FLOW.on('fileError', (event, api_data) => {
      try {
        const data = JSON.parse(api_data) as APIResponseProps<unknown>;
        if ('api_status_code' in data) {
          if (
            data.api_status_code === 401 ||
            (data.api_status_code === 503 &&
              data.api_error_message.includes('quota') &&
              data.api_error_message.includes('daily') &&
              data.api_error_message.includes('API'))
          ) {
            window.location.reload();
          } else {
            // Unexpected error occurred, cancel upload and show error message
            handleCancelUpload();
            showErrorMessage(t('submit.file.upload_fail'));
          }
        }
      } catch (ex) {
        handleCancelUpload();
        showErrorMessage(t('submit.file.upload_fail'));
      }
    });

    FLOW.on('progress', () => {
      form.setStore(s => ({ ...s, uploadProgress: Math.trunc(FLOW.progress() * 100) }));
    });

    FLOW.on('complete', () => {
      if (FLOW.files.length === 0) {
        return;
      }

      for (let x = 0; x < FLOW.files.length; x++) {
        if (FLOW.files[x].error) {
          return;
        }
      }
      apiCall<{ started: boolean; sid: string }>({
        url: `/api/v4/ui/start/${form.state.values.uuid}/`,
        method: 'POST',
        body: {
          ...form.state.values.settings,
          filename: form.state.values.file.path,
          metadata: form.state.values.submissionMetadata
        },
        onSuccess: api_data => {
          showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
          setTimeout(() => {
            navigate(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        },
        onFailure: api_data => {
          if (api_data.api_status_code === 400 && api_data.api_error_message.includes('metadata')) {
            setTab('options');
          }

          if (
            api_data.api_status_code === 503 ||
            api_data.api_status_code === 403 ||
            api_data.api_status_code === 404 ||
            api_data.api_status_code === 400
          ) {
            showErrorMessage(api_data.api_error_message);
          } else {
            showErrorMessage(t('submit.file.failure'));
          }

          handleCancelUpload();
        }
      });
    });

    FLOW.addFile(form.state.values.file);
    FLOW.upload();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, handleCancelUpload, t]);

  const handleUploadUrlHash = useCallback(() => {
    if (form.state.values.input.hasError) {
      showErrorMessage(t(`submit.${configuration.ui.allow_url_submissions ? 'urlhash' : 'hash'}.error`));
      return;
    }

    apiCall<Submission>({
      url: '/api/v4/submit/',
      method: 'POST',
      body: {
        ui_params: form.state.values.settings,
        [form.state.values.input.type]: form.state.values.input.value,
        metadata: form.state.values.submissionMetadata
      },
      onSuccess: ({ api_response }) => {
        showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
        setTimeout(() => {
          navigate(`/submission/detail/${api_response.sid}`);
        }, 500);
      },
      onFailure: ({ api_status_code, api_error_message }) => {
        showErrorMessage(api_error_message);
        if (api_status_code === 400 && api_error_message.includes('metadata')) {
          setTab('options');
        }
      },
      onEnter: () => {
        form.setStore(s => ({ ...s, uploading: true }));
      },
      onExit: () => {
        form.setStore(s => ({ ...s, uploading: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration.ui.allow_url_submissions, form, t]);

  useEffect(() => {
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setStore(s => {
          s.settings = { ...api_response } as any;
          s.settings = DEFAULT_SETTINGS;

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
        ...(Object.fromEntries(
          Object.entries(configuration.submission.metadata.submit).reduce((prev: [string, unknown][], [key, value]) => {
            if (value.default) prev.push([key, value]);
            return prev;
          }, [])
        ) as Metadata),
        ...s.submissionMetadata
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <form.Subscribe
        selector={state => [state.values.confirmation.open]}
        children={([open]) => (
          <ConfirmationDialog
            open={open}
            handleClose={() => form.setStore(s => ({ ...s, confirmation: { ...s.confirmation, open: false } }))}
            handleCancel={() => {
              form.setStore(s => {
                s.settings.services.forEach((category, i) => {
                  category.services.forEach((service, j) => {
                    if (service.selected && service.is_external) {
                      s.settings.services[i].services[j].selected = false;
                    }
                  });
                  s.settings.services[i].selected = s.settings.services[i].services.every(svr => svr.selected);
                });
                return s;
              });
            }}
            handleAccept={() => {
              const type = form.state.values.confirmation.type;
              if (type === 'file') handleUploadFile();
              else if (type === 'urlHash') handleUploadUrlHash();
            }}
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
                onSubmit={() => handleUploadFile()}
              />
            )
          },
          hash: {
            label: `${t('urlHash.input_title')}${t('urlHash.input_suffix')}`,
            disabled: !currentUser.roles.includes('submission_create'),
            inner: <HashSubmit onSubmit={() => handleUploadUrlHash()} />
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
