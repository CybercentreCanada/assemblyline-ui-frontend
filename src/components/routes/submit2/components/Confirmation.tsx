import PublishIcon from '@mui/icons-material/Publish';
import type { PaperProps, TypographyProps } from '@mui/material';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { APIResponseProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { HashPatternMap } from 'components/models/base/config';
import type { Submission } from 'components/models/base/submission';
import { parseSubmissionProfile } from 'components/routes/settings/settings.utils';
import type { AutoURLServiceIndices, SubmitStore } from 'components/routes/submit2/submit.form';
import { FLOW, useForm } from 'components/routes/submit2/submit.form';
import { isSubmissionValid, isUsingExternalServices, isValidJSON } from 'components/routes/submit2/submit.utils';
import type { ButtonProps } from 'components/visual/Buttons/Button';
import { Button } from 'components/visual/Buttons/Button';
import { ByteNumber } from 'components/visual/ByteNumber';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

type SectionProps = PaperProps & {
  primary: TypographyProps['children'];
  primaryProps?: TypographyProps;
};

const Section = React.memo(({ primary, primaryProps, children, ...props }: SectionProps) => {
  const theme = useTheme();

  return (
    <div style={{ textAlign: 'left' }}>
      <Typography color="textSecondary" variant="body2" {...primaryProps}>
        {primary}
      </Typography>
      <Paper
        variant="outlined"
        {...props}
        sx={{
          backgroundColor: theme.palette.background.default,
          overflow: 'hidden',
          wordBreak: 'break-word',
          ...props?.sx
        }}
      >
        {children}
      </Paper>
    </div>
  );
});

const Title = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, state.values.file, state.values.hash.type, state.values.hash.value]}
      children={props => {
        const tab = props[0] as SubmitStore['state']['tab'];
        const file = props[1] as SubmitStore['file'];
        const type = props[2] as SubmitStore['hash']['type'];
        const hash = props[3] as SubmitStore['hash']['value'];

        return (
          <ListItemText
            primary={t('confirmation.title').replace('{type}', tab === 'file' ? 'File' : type.toUpperCase())}
            secondary={
              tab === 'file' ? (
                <>
                  {file.name}
                  {' ('}
                  <ByteNumber component="span" bytes={file.size} variant="body2" />
                  {')'}
                </>
              ) : (
                hash
              )
            }
            primaryTypographyProps={{ variant: 'h6' }}
          />
        );
      }}
    />
  );
});

const Password = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.settings.initial_data.value
      ]}
      children={([loading, disabled, initialData]) => {
        let text = '';
        try {
          text = (JSON.parse(initialData as string)?.password as string) || '';
        } catch (e) {
          text = '';
        }

        return (
          <TextInput
            label={t('options.submission.password.label')}
            tooltip={t('options.submission.password.tooltip')}
            value={text}
            loading={loading as boolean}
            disabled={disabled as boolean}
            onChange={(e, v) => {
              form.setFieldValue('settings.initial_data.value', `{"password":"${v}"}`);
            }}
          />
        );
      }}
    />
  );
});

export const CustomizabilityAlert = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.customize]}
      children={([customize]) => (
        <Tooltip
          placement="bottom-start"
          title={customize ? t('customize.full.tooltip') : t('customize.limited.tooltip')}
          slotProps={{ tooltip: { sx: { backgroundColor: 'rgba(97, 97, 97, 1)' } } }}
        >
          <div>
            <Alert
              severity={customize ? 'info' : 'warning'}
              sx={{ paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25) }}
            >
              {customize ? t('customize.full.label') : t('customize.limited.label')}
            </Alert>
          </div>
        </Tooltip>
      )}
    />
  );
});

export const Malicious = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'file' && !!state.values.file,
        state.values.settings.malicious.value,
        state.values.state.loading,
        state.values.state.disabled
      ]}
      children={([isFile, value, loading, disabled]) => (
        <SwitchInput
          label={t('malicious.switch.label')}
          labelProps={{ color: 'textPrimary' }}
          tooltip={t('malicious.switch.tooltip')}
          value={value}
          loading={loading}
          disabled={disabled}
          preventRender={!isFile}
          onChange={(e, v) => form.setFieldValue('settings.malicious.value', v)}
        />
      )}
    />
  );
});

export const ExternalSources = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'hash',
        state.values.state.loading,
        state.values.state.disabled,
        ...(configuration.submission.file_sources?.[state.values.state.tab as HashPatternMap]?.sources || [])
      ]}
      children={([isHash, loading, disabled, ...sources]) =>
        !isHash || sources.length === 0 ? null : (
          <div style={{ textAlign: 'left' }}>
            <Typography color="textSecondary" variant="body2">
              {t('options.submission.default_external_sources.label')}
            </Typography>
            {sources.map((source: string, i) => (
              <form.Subscribe
                key={`${source}-${i}`}
                selector={state => state.values.settings.default_external_sources.value.indexOf(source) !== -1}
                children={value => (
                  <CheckboxInput
                    key={i}
                    id={`source-${source.replace('_', ' ')}`}
                    label={source.replace('_', ' ')}
                    labelProps={{ color: 'textPrimary' }}
                    value={value}
                    loading={loading as boolean}
                    disabled={disabled as boolean}
                    onChange={() => {
                      form.setFieldValue('settings.default_external_sources.value', s => {
                        s.indexOf(source) >= 0 ? s.splice(s.indexOf(source), 1) : s.push(source);
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
  );
});

const AutoURLServicesSelection = React.memo(({ hasURLservices = false }: { hasURLservices: boolean }) => {
  const { configuration } = useALContext();
  const form = useForm();

  const addURLServiceSelection = useCallback(() => {
    const current: AutoURLServiceIndices = [];

    form.setFieldValue('settings.services', categories => {
      categories.forEach((category, i) => {
        category.services.forEach((service, j) => {
          if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
            current.push([i, j, categories[i].services[j].selected]);
            categories[i].services[j].selected = true;
          }
        });
        categories[i].selected = category.services.every(s => s.selected);
      });

      return categories;
    });

    form.setFieldValue('state.autoURLServiceSelection', services => {
      current.forEach(c => {
        if (!services.some(s => s[0] === c[0] && s[1] === c[1])) {
          services = [...services, c];
        }
      });
      return services;
    });
  }, [configuration.ui.url_submission_auto_service_selection, form]);

  const removeURLServiceSelection = useCallback(() => {
    const urlServices = form.getFieldValue('state.autoURLServiceSelection');
    if (urlServices.length == 0) return;

    form.setFieldValue('settings.services', categories => {
      urlServices.forEach(([i, j, value]) => {
        categories[i].services[j].selected = value;
      });

      categories.forEach((category, i) => {
        categories[i].selected = category.services.every(s => s.selected);
      });

      return categories;
    });

    form.setFieldValue('state.autoURLServiceSelection', []);
  }, [form]);

  useEffect(() => {
    if (hasURLservices) addURLServiceSelection();
    else removeURLServiceSelection();
  }, [addURLServiceSelection, hasURLservices, removeURLServiceSelection]);

  return null;
});

export const ExternalServices = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <>
      <form.Subscribe
        selector={state => [
          state.values.state.tab === 'hash' &&
            state.values.hash.type === 'url' &&
            state.values.settings.services.some(cat =>
              cat.services.some(svr => configuration.ui.url_submission_auto_service_selection.includes(svr.name))
            )
        ]}
        children={([hasURLservices]) => <AutoURLServicesSelection hasURLservices={hasURLservices} />}
      />
      <form.Subscribe
        selector={state => [
          state.values.state.loading,
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.autoURLServiceSelection
        ]}
        children={props => {
          const loading = props[0] as boolean;
          const disabled = props[1] as boolean;
          const customize = props[2] as boolean;
          const autoURLServiceSelection = props[3] as SubmitStore['state']['autoURLServiceSelection'];

          return autoURLServiceSelection.length === 0 ? null : (
            <div style={{ textAlign: 'left' }}>
              <Typography color="textSecondary" variant="body2">
                {t('options.submission.url_submission_auto_service_selection.label')}
              </Typography>
              {autoURLServiceSelection.map(([cat, svr], i) => (
                <form.Subscribe
                  key={i}
                  selector={state => {
                    const service = state.values.settings.services[cat].services[svr];
                    return [service.name, service.selected];
                  }}
                  children={props2 => {
                    const name = props2[0] as string;
                    const selected = props2[1] as boolean;

                    return (
                      <CheckboxInput
                        key={i}
                        id={`url_submission_auto_service_selection-${name.replace('_', ' ')}`}
                        label={name.replace('_', ' ')}
                        labelProps={{ textTransform: 'capitalize', color: 'textPrimary' }}
                        value={selected}
                        loading={loading}
                        disabled={disabled || !customize}
                        onChange={() => {
                          form.setFieldValue('settings', s => {
                            s.services[cat].services[svr].selected = !selected;
                            s.services[cat].selected = s.services[cat].services.every(val => val.selected);
                            return s;
                          });
                        }}
                      />
                    );
                  }}
                />
              ))}
            </div>
          );
        }}
      />
    </>
  );
});

const ToS = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <DialogContentText variant="body2" sx={{ textAlign: 'center', paddingTop: theme.spacing(1) }}>
      {t('tos.terms1')}
      <i>{t('submit.button.label')}</i>
      {t('tos.terms2')}
      <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
        {t('tos.terms3')}
      </Link>
      .
    </DialogContentText>
  );
});

export const AnalysisActions = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { configuration, settings } = useALContext();

  const handleCancel = useCallback(() => {
    form.setFieldValue('file', null);
    form.setFieldValue('hash.type', null);
    form.setFieldValue('hash.value', '');
    form.setFieldValue('state.uploading', false);
    form.setFieldValue('state.uploadProgress', null);
    form.setFieldValue('state.uuid', generateUUID());

    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  const handleSubmitFile = useCallback(
    () => {
      closeSnackbar();
      const file = form.getFieldValue('file');
      const size = form.getFieldValue('file.size');
      const uuid = form.getFieldValue('state.uuid');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      form.setFieldValue('state.uploading', true);
      form.setFieldValue('state.uploadProgress', 0);
      form.setFieldValue('state.confirmation', false);

      FLOW.opts.generateUniqueIdentifier = selectedFile => {
        const relativePath =
          selectedFile?.relativePath ||
          selectedFile?.file?.webkitRelativePath ||
          selectedFile?.file?.name ||
          selectedFile?.name;
        return `${uuid}_${size}_${relativePath.replace(/[^0-9a-zA-Z_-]/gim, '')}`;
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
              handleCancel();
              showErrorMessage(t('submit.file.upload_fail'));
            }
          }
        } catch (ex) {
          handleCancel();
          showErrorMessage(t('submit.file.upload_fail'));
        }
      });

      FLOW.on('progress', () => {
        form.setFieldValue('state.uploadProgress', Math.trunc(FLOW.progress() * 100));
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
          url: `/api/v4/ui/start/${uuid}/`,
          method: 'POST',
          body: {
            ...parseSubmissionProfile(settings, params, profile),
            submission_profile: profile,
            filename: file.path,
            metadata: !isValidJSON(metadata.extra)
              ? metadata.config
              : { ...(JSON.parse(metadata.extra) as object), ...metadata.config }
          },
          onSuccess: ({ api_response }) => {
            showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
            setTimeout(() => {
              navigate(`/submission/detail/${api_response.sid}`);
            }, 1000);
          },
          onFailure: ({ api_status_code, api_error_message }) => {
            if ([400, 403, 404, 503].includes(api_status_code)) showErrorMessage(api_error_message);
            else showErrorMessage(t('submit.file.failure'));
            handleCancel();
          },
          onExit: () => {
            form.setFieldValue('state.uploading', false);
          }
        });
      });

      FLOW.addFile(file);
      FLOW.upload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, handleCancel, navigate, settings, showErrorMessage, showSuccessMessage, t]
  );

  const handleSubmitHash = useCallback(
    () => {
      closeSnackbar();

      const hash = form.getFieldValue('hash');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: parseSubmissionProfile(settings, params, profile),
          submission_profile: profile,
          [hash.type]: hash.value,
          metadata: !isValidJSON(metadata.extra)
            ? metadata.config
            : { ...(JSON.parse(metadata.extra) as object), ...metadata.config }
        },
        onSuccess: ({ api_response }) => {
          showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
          setTimeout(() => {
            navigate(`/submission/detail/${api_response.sid}`);
          }, 1000);
        },
        onFailure: ({ api_error_message }) => {
          showErrorMessage(api_error_message);
        },
        onEnter: () => {
          form.setFieldValue('state.uploading', true);
          form.setFieldValue('state.confirmation', false);
        },
        onExit: () => {
          form.setFieldValue('state.uploading', false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, navigate, settings, showErrorMessage, showSuccessMessage, t]
  );

  return (
    <>
      <Button
        tooltip={t('close.button.tooltip')}
        tooltipProps={{ placement: 'bottom' }}
        onClick={() => form.setFieldValue('state.confirmation', false)}
      >
        {t('close.button.label')}
      </Button>
      <form.Subscribe
        selector={state => [state.values.state.tab, isSubmissionValid(state.values, configuration)]}
        children={([tab, valid]) => (
          <Button
            tooltip={t('submit.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            disabled={!valid}
            onClick={() => (tab === 'file' ? handleSubmitFile() : handleSubmitHash())}
          >
            {t('submit.button.label')}
          </Button>
        )}
      />
    </>
  );
});

export const AnalysisConfirmation = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.confirmation]}
      children={([open]) => (
        <Dialog
          aria-labelledby="submit-confirmation-dialog-title"
          aria-describedby="submit-confirmation-dialog-description"
          fullWidth
          open={open}
          onClose={() => form.setFieldValue('state.confirmation', false)}
        >
          <DialogTitle id="submit-confirmation-dialog-title">
            <Title />
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1.5) }}>
            <Password />
            <Malicious />
            <ExternalSources />
            <ExternalServices />
          </DialogContent>

          <ToS />
          <DialogActions sx={{ paddingTop: 0 }}>
            <AnalysisActions />
          </DialogActions>
        </Dialog>
      )}
    />
  );
});

export const CancelButton = React.memo(() => {
  return null;
});

const AnalyzeButton = React.memo((props: ButtonProps) => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.state.tab,
        !state.values.file,
        !state.values.hash.type
      ]}
      children={([loading, disabled, uploading, tab, file, hash]) => (
        <Button
          disabled={(disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)) as boolean}
          loading={(loading || uploading) as boolean}
          startIcon={<PublishIcon />}
          tooltip={t('analyze.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          variant="contained"
          onClick={() => form.setFieldValue('state.confirmation', s => !s)}
          {...props}
        >
          {t('analyze.button.label')}
        </Button>
      )}
    />
  );
});

const ExternalServicesButton = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <>
      <form.Subscribe
        selector={state => [
          state.values.state.tab === 'file' && !!state.values.file,
          state.values.state.tab === 'hash' && !!state.values.hash.type,
          state.values.state.confirmation
        ]}
        children={([isFile, isHash, confirmation]) => (
          <Dialog
            aria-labelledby="submit-confirmation-dialog-title"
            aria-describedby="submit-confirmation-dialog-description"
            fullWidth
            open={confirmation}
            onClose={() => form.setFieldValue('state.confirmation', false)}
          >
            <DialogTitle id="submit-confirmation-dialog-title"></DialogTitle>

            <DialogContent></DialogContent>

            <DialogActions sx={{ paddingTop: 0 }}>{isFile ? <></> : isHash ? <></> : null}</DialogActions>
          </Dialog>
        )}
      />
      <AnalyzeButton onClick={() => form.setFieldValue('state.confirmation', true)} />
    </>
  );
});

export const Confirmation = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'file' && !!state.values.file,
        state.values.state.tab === 'hash' && !!state.values.hash.type,
        state.values.state.loading ? false : isUsingExternalServices(state.values.settings, configuration)
      ]}
      children={([isFile, isHash, isExternal]) =>
        isExternal ? (
          <ExternalServicesButton />
        ) : isFile ? (
          <FileSubmit />
        ) : isHash ? (
          <HashSubmit />
        ) : (
          <AnalyzeButton disabled />
        )
      }
    />
  );
});
