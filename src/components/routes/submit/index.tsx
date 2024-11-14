import Flow from '@flowjs/flow.js';
import { Alert, Grid, useMediaQuery, useTheme } from '@mui/material';
import type { FormApi, Validator } from '@tanstack/react-form';
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
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { MetadataParameters } from './components/MetadataParameters';
import { ServiceSelection } from './components/ServiceSelection';
import { SubmissionParameters } from './components/SubmissionParameters';
import { SubmissionProfile } from './components/SubmissionProfile';
import type { SubmitStore, Tabs } from './contexts/form';
import { FormProvider, useForm } from './contexts/form';
import { DEFAULT_SETTINGS } from './mock/settings';
import { FileSubmit } from './tabs/file';
import { HashSubmit } from './tabs/hash';

const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

type SubmitState = {
  hash: string;
  tabContext: Tabs; // Ensure this is set correct elsewhere
  c12n: string;
  metadata?: Metadata;
};

const WrappedSubmitContent = () => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { closeSnackbar } = useMySnackbar();

  const form = useForm();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const submitState = useMemo<SubmitState>(() => location.state as SubmitState, [location.state]);
  const submitParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  console.log(submitState);

  const handleCancelUpload = useCallback(() => {
    form.setStore(s => {
      s.file = null;
      s.submit.isUploading = false;
      s.submit.uploadProgress = null;
      s.submit.uuid = generateUUID();
      return s;
    });

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
          s.settings = { ...s.settings, ..._.omit({ ...api_response }, ['classification']) };
          s.settings = { ...s.settings, ..._.omit(DEFAULT_SETTINGS, ['classification']) };

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

          s.profile = api_response.preferred_submission_profile || null;

          return s;
        });
      },
      onEnter: () =>
        form.setStore(s => {
          s.submit.isFetchingSettings = true;
          return s;
        }),
      onExit: () =>
        form.setStore(s => {
          s.submit.isFetchingSettings = false;
          return s;
        })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser]);

  useEffect(() => {
    const inputParam = submitParams.get('input') || '';
    if (inputParam) {
      const [type, value] = getSubmitType(inputParam, configuration);
      form.setStore(s => {
        s.tab = 'hash';
        s.hash.type = type;
        s.hash.value = value;
        s.hash.hasError = false;
        return s;
      });
      closeSnackbar();
    }

    const classification = submitParams.get('classification');
    if (classification) {
      form.setStore(s => {
        s.settings.classification = classification;
        return s;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration, submitParams]);

  useEffect(() => {
    if (submitState) {
      const [type, value] = getSubmitType(submitState.hash, configuration);
      form.setStore(s => {
        s.tab = submitState.tabContext;
        s.hash.type = type;
        s.hash.value = value;
        s.hash.hasError = false;
        s.settings.classification = submitState.c12n;
        s.metadata = submitState.metadata;
        return s;
      });
      closeSnackbar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSnackbar, configuration, submitState]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <form.Subscribe
        selector={state => [state.values.submit.isConfirmationOpen, state.values.submit.isUploading]}
        children={([open, isUploading]) => (
          <ConfirmationDialog
            open={open}
            waiting={isUploading}
            handleClose={() =>
              form.setStore(s => {
                s.submit.isConfirmationOpen = false;
                return s;
              })
            }
            handleCancel={async () => {
              form.setStore(s => {
                s.submit.isConfirmationOpen = false;

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

              await form.handleSubmit();
            }}
            handleAccept={async () => {
              await form.handleSubmit();
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
          children={({ state, handleChange }) => (
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

      <form.Field
        name="tab"
        children={({ state, handleChange }) => (
          <TabContainer
            indicatorColor="primary"
            textColor="primary"
            paper
            centered
            variant="standard"
            style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
            value={state.value}
            onChange={(event, value) => handleChange(value)}
            tabs={{
              file: {
                label: t('file'),
                disabled: !currentUser.roles.includes('submission_create'),
                inner: <FileSubmit onCancelUpload={handleCancelUpload} />
              },
              hash: {
                label: t('urlHash.input_title'),
                disabled: !currentUser.roles.includes('submission_create'),
                inner: <HashSubmit />
              },
              options: {
                label: t('options'),
                disabled: !currentUser.roles.includes('submission_create'),
                inner: (
                  <Grid container columnGap={2}>
                    <Grid item xs={12}>
                      <SubmissionProfile />
                    </Grid>
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
        )}
      />
    </PageCenter>
  );
};

const SubmitContent = React.memo(WrappedSubmitContent);

const WrappedSubmitPage = () => {
  const { t } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const navigate = useNavigate();
  const { configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleCancelUpload = useCallback(
    ({ formApi }: { value: SubmitStore; formApi: FormApi<SubmitStore, Validator<SubmitStore, string>> }) => {
      formApi.store.setState(s => {
        s.values.file = null;
        s.values.submit.isUploading = false;
        s.values.submit.uploadProgress = null;
        s.values.submit.uuid = generateUUID();
        return s;
      });
      FLOW.cancel();
      FLOW.off('complete');
      FLOW.off('fileError');
      FLOW.off('progress');
    },
    []
  );

  const handleUploadFile = useCallback(
    ({ value, formApi }: { value: SubmitStore; formApi: FormApi<SubmitStore, Validator<SubmitStore, string>> }) => {
      formApi.store.setState(s => {
        s.values.submit.isUploading = true;
        s.values.submit.uploadProgress = 0;
        return s;
      });

      FLOW.opts.generateUniqueIdentifier = selectedFile => {
        const relativePath =
          selectedFile?.relativePath ||
          selectedFile?.file?.webkitRelativePath ||
          selectedFile?.file?.name ||
          selectedFile?.name;
        return `${value.submit.uuid}_${value.file.size}_${relativePath.replace(/[^0-9a-zA-Z_-]/gim, '')}`;
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
              handleCancelUpload({ value, formApi });
              showErrorMessage(t('submit.file.upload_fail'));
            }
          }
        } catch (ex) {
          handleCancelUpload({ value, formApi });
          showErrorMessage(t('submit.file.upload_fail'));
        }
      });

      FLOW.on('progress', () => {
        formApi.store.setState(s => {
          s.values.submit.uploadProgress = Math.trunc(FLOW.progress() * 100);
          return s;
        });
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
          url: `/api/v4/ui/start/${value.submit.uuid}/`,
          method: 'POST',
          body: {
            ...value.settings,
            filename: value.file.path,
            metadata: value.metadata
          },
          onSuccess: api_data => {
            showSuccessMessage(`${t('submit.success')} ${api_data.api_response.sid}`);
            setTimeout(() => {
              navigate(`/submission/detail/${api_data.api_response.sid}`);
            }, 500);
          },
          onFailure: api_data => {
            if (api_data.api_status_code === 400 && api_data.api_error_message.includes('metadata')) {
              formApi.store.setState(s => {
                s.values.tab = 'options';
                return s;
              });
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

            handleCancelUpload({ value, formApi });
          }
        });
      });

      FLOW.addFile(value.file);
      FLOW.upload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCancelUpload, t]
  );

  const handleUploadUrlHash = useCallback(
    ({ value, formApi }: { value: SubmitStore; formApi: FormApi<SubmitStore, Validator<SubmitStore, string>> }) => {
      if (value.hash.hasError) {
        showErrorMessage(t(`submit.${configuration.ui.allow_url_submissions ? 'urlhash' : 'hash'}.error`));
        return;
      }

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: value.settings,
          [value.hash.type]: value.hash.value,
          metadata: value.metadata
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
            formApi.store.setState(s => {
              s.values.tab = 'options';
              return s;
            });
          }

          formApi.store.setState(s => {
            s.values.hash.hasError = true;
            s.values.submit.isUploading = false;
            return s;
          });
        },
        onEnter: () => {
          formApi.store.setState(s => {
            s.values.submit.isUploading = true;
            return s;
          });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuration.ui.allow_url_submissions, t]
  );

  const handleSubmit = useCallback(
    ({ value, formApi }: { value: SubmitStore; formApi: FormApi<SubmitStore, Validator<SubmitStore, string>> }) => {
      const showValidate = value.settings.services.some(cat =>
        cat.services.some(svr => svr.selected && svr.is_external)
      );

      if (showValidate && !value.submit.isConfirmationOpen) {
        formApi.store.setState(s => {
          s.values.submit.isConfirmationOpen = true;
          return s;
        });
      } else {
        formApi.store.setState(s => {
          s.values.submit.isConfirmationOpen = false;
          return s;
        });
        if (value.tab === 'file') {
          handleUploadFile({ value, formApi });
        } else if (value.tab === 'hash') {
          handleUploadUrlHash({ value, formApi });
        }
      }
    },
    [handleUploadFile, handleUploadUrlHash]
  );

  return (
    <FormProvider onSubmit={handleSubmit}>
      <SubmitContent />
    </FormProvider>
  );
};

export const SubmitPage = React.memo(WrappedSubmitPage);
export default SubmitPage;
