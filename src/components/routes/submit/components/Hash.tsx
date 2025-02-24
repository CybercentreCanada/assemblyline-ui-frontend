import { Button, CircularProgress, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Submission } from 'components/models/base/submission';
import { MetadataSummary } from 'components/routes/submit/components/MetadataSummary';
import type { SubmitStore } from 'components/routes/submit/contexts/form';
import { useForm } from 'components/routes/submit/contexts/form';
import { applySubmissionProfile } from 'components/routes/submit/utils/utils';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { getSubmitType } from 'helpers/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
};

export const HashSubmit = ({ profile = null, loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { user: currentUser, configuration } = useALContext();

  const form = useForm();

  const stringInputTitle: string = configuration.ui.allow_url_submissions
    ? `${t('urlHash.input_title_hash')}/${t('urlHash.input_title_url')}`
    : t('urlHash.input_title_hash');
  const stringInputText: string = stringInputTitle + t('urlHash.input_suffix');

  const handleSubmitHash = useCallback(
    (store: SubmitStore) => {
      if (store.hash.hasError) {
        showErrorMessage(t(`submit.${configuration.ui.allow_url_submissions ? 'urlhash' : 'hash'}.error`));
        return;
      }

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: applySubmissionProfile(store.settings, store.state.profile),
          submission_profile: store.state.profile,
          [store.hash.type]: store.hash.value,
          metadata: store.metadata
        },
        onSuccess: ({ api_response }) => {
          showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
          form.setStore(s => {
            s.state.disabled = false;
            s.state.isUploading = false;
            s.state.isConfirmationOpen = false;
            return s;
          });
          setTimeout(() => {
            navigate(`/submission/detail/${api_response.sid}`);
          }, 500);
        },
        onFailure: ({ api_status_code, api_error_message }) => {
          showErrorMessage(api_error_message);
          if (api_status_code === 400 && api_error_message.includes('metadata')) {
            form.setStore(s => {
              s.state.tab = 'options';
              return s;
            });
          }

          form.setStore(s => {
            s.hash.hasError = true;
            s.state.disabled = false;
            s.state.isUploading = false;
            s.state.isConfirmationOpen = false;
            return s;
          });
        },
        onEnter: () => {
          form.setStore(s => {
            s.state.disabled = true;
            s.state.isUploading = true;
            return s;
          });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuration.ui.allow_url_submissions, currentUser, form, t]
  );

  const handleDeselectServices = useCallback(
    (store: SubmitStore) => {
      store.settings.profiles[store.state.profile].services.forEach((category, i) => {
        category.services.forEach((service, j) => {
          if (service.selected && service.is_external) {
            store.settings.profiles[store.state.profile].services[i].services[j].selected = false;
          }
        });
        store.settings.profiles[store.state.profile].services[i].selected = store.settings.profiles[
          store.state.profile
        ].services[i].services.every(svr => svr.selected);
      });

      handleSubmitHash(store);
    },
    [handleSubmitHash]
  );

  const handleConfirm = useCallback(
    (store: SubmitStore) => {
      const showValidate = store.settings.profiles[profile].services.some(cat =>
        cat.services.some(svr => svr.selected && svr.is_external)
      );

      if (showValidate && !store.state.isConfirmationOpen) {
        form.setStore(s => {
          s.state.isConfirmationOpen = true;
          return s;
        });
      } else {
        form.setStore(s => {
          s.state.isConfirmationOpen = false;
          return s;
        });

        handleSubmitHash(store);
      }
    },
    [form, handleSubmitHash, profile]
  );

  return loading || !profile ? null : (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: theme.spacing(2),
          alignItems: 'flex-end',
          gap: theme.spacing(2)
        }}
      >
        <form.Subscribe
          selector={state => [state.values.state.isConfirmationOpen, state.values.state.isUploading]}
          children={([open, isUploading]) => (
            <ConfirmationDialog
              open={open}
              waiting={isUploading}
              waitingCancel={isUploading}
              handleClose={() =>
                form.setStore(s => {
                  s.state.isConfirmationOpen = false;
                  return s;
                })
              }
              handleCancel={() => handleDeselectServices(form.state.values)}
              handleAccept={() => handleSubmitHash(form.state.values)}
              title={t('validate.title')}
              cancelText={t('validate.cancelText')}
              acceptText={t('validate.acceptText')}
              text={t('validate.text')}
            />
          )}
        />
        <form.Subscribe
          selector={state => [
            state.values.hash.type,
            state.values.hash.value,
            state.values.hash.hasError,
            state.values.state.isUploading
          ]}
          children={([hashType, hash, error, isUploading]) => (
            <div style={{ flex: 1 }}>
              <TextInput
                label={stringInputText}
                value={hash as string}
                helperText={t('urlHash.input_helpertext')}
                endAdornment={
                  <Button
                    disabled={Boolean(isUploading || error || !hashType)}
                    color="primary"
                    variant="contained"
                    onClick={() => handleConfirm(form.state.values)}
                    style={{ height: '40px' }}
                  >
                    {hashType ? `${t('urlHash.button')} ${hashType}` : t('urlHash.button')}
                    {isUploading && (
                      <CircularProgress
                        size={24}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: -12,
                          marginLeft: -12
                        }}
                      />
                    )}
                  </Button>
                }
                onKeyDown={event => {
                  if (event.key !== 'Enter' || !hashType) return;
                  handleConfirm(form.state.values);
                }}
                onChange={(event, v) => {
                  closeSnackbar();
                  const [type, value] = getSubmitType(v, configuration);

                  form.setStore(s => {
                    s.hash = { ...s.hash, type, value, hasError: false };

                    if (type === 'url' && s.hash.urlAutoSelect) {
                      s.hash.urlAutoSelect = false;
                      s.settings.profiles[profile].services.forEach((category, i) => {
                        category.services.forEach((service, j) => {
                          if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
                            s.settings.profiles[profile].services[i].services[j].selected = true;
                          }
                        });
                        s.settings.profiles[profile].services[i].selected = s.settings.profiles[profile].services[
                          i
                        ].services.every(svr => svr.selected);
                      });
                    } else if (type !== 'url') {
                      s.hash.urlAutoSelect = true;
                    }

                    return s;
                  });
                }}
              />
            </div>
          )}
        />
      </div>

      <form.Subscribe
        selector={state =>
          [
            state.values.hash.type === 'url',
            state.values.settings.profiles[profile].services.reduce((prev: [number, number][], category, i) => {
              category.services.forEach((service, j) => {
                if (configuration?.ui?.url_submission_auto_service_selection?.includes(service.name)) prev.push([i, j]);
              });
              return prev;
            }, [])
          ] as [boolean, [number, number][]]
        }
        children={([isURL, services]) =>
          !isURL || !services?.length ? null : (
            <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
              <Typography variant="subtitle1">
                {t('options.submission.url_submission_auto_service_selection')}
              </Typography>
              {services.map(([cat, svr], i) => (
                <form.Subscribe
                  key={i}
                  selector={state => [state.values.settings.profiles[profile].services[cat].services[svr]]}
                  children={([service]) => (
                    <CheckboxInput
                      key={i}
                      id={`url_submission_auto_service_selection-${service.name.replace('_', ' ')}`}
                      label={service.name.replace('_', ' ')}
                      labelProps={{ textTransform: 'capitalize' }}
                      value={service.selected}
                      loading={loading}
                      disabled={disabled}
                      disableGap
                      onChange={() => {
                        form.setStore(s => {
                          s.settings.profiles[profile].services[cat].services[svr].selected = !service.selected;
                          s.settings.profiles[profile].services[cat].selected = s.settings.profiles[profile].services[
                            cat
                          ].services.every(val => val.selected);
                          return s;
                        });
                      }}
                    />
                  )}
                />
              ))}
            </div>
          )
        }
      />

      <form.Subscribe
        selector={state => [state.values.settings, state.values.hash.type]}
        children={props => {
          const settings = props[0] as SubmitStore['settings'];
          const type = props[1] as SubmitStore['hash']['type'];
          const fileSources = configuration.submission.file_sources;

          return (
            type &&
            fileSources[type] &&
            fileSources[type].sources &&
            fileSources[type].sources.length > 0 && (
              <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
                <Typography variant="subtitle1">{t('options.submission.default_external_sources')}</Typography>
                {fileSources[type].sources.map((source, i) => (
                  <CheckboxInput
                    key={i}
                    id={`source-${source.replace('_', ' ')}`}
                    label={source.replace('_', ' ')}
                    labelProps={{ textTransform: 'capitalize' }}
                    value={settings.default_external_sources.indexOf(source) !== -1}
                    loading={loading}
                    disabled={disabled}
                    disableGap
                    onChange={() => {
                      if (!settings) return;
                      form.setStore(s => {
                        const newSources = settings.default_external_sources;
                        s.hash = { ...s.hash, hasError: false };
                        if (newSources.indexOf(source) === -1) newSources.push(source);
                        else newSources.splice(newSources.indexOf(source), 1);
                        s.settings = { ...s.settings, default_external_sources: newSources };
                        return s;
                      });
                    }}
                  />
                ))}
              </div>
            )
          );
        }}
      />

      <MetadataSummary />

      {!configuration.ui.tos ? null : (
        <div style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="body2">
            {t('terms1')}
            <i>{t('urlHash.button')}</i>
            {t('terms2')}
            <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
              {t('terms3')}
            </Link>
            .
          </Typography>
        </div>
      )}
    </>
  );
};
