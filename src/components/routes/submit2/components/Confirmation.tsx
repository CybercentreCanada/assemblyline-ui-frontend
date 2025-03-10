import type { PaperProps, TypographyProps } from '@mui/material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
  Paper,
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
import type { SubmitStore } from 'components/routes/submit2/submit.form';
import { FLOW, useForm } from 'components/routes/submit2/submit.form';
import { isSubmissionValid, isValidJSON } from 'components/routes/submit2/submit.utils';
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
    <div>
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
          <DialogTitle>
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
          </DialogTitle>
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

const Malicious = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'file',
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

const ExternalSources = React.memo(() => {
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
          <Section primary={t('options.submission.default_external_sources.label')}>
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
          </Section>
        )
      }
    />
  );
});

const ExternalServices = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const { configuration } = useALContext();
  const form = useForm();

  useEffect(() => {
    if (form.getFieldValue('state.tab') !== 'hash' || form.getFieldValue('hash.type') !== 'url') return;

    const prevValues: [number, number, boolean][] = [];

    form.setFieldValue('settings.services', categories => {
      categories.forEach((category, i) => {
        category.services.forEach((service, j) => {
          if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
            prevValues.push([i, j, categories[i].services[j].selected]);
            categories[i].services[j].selected = true;
          }
        });
        categories[i].selected = category.services.every(s => s.selected);
      });

      return categories;
    });

    return () => {
      form.setFieldValue('settings.services', categories => {
        prevValues.forEach(([i, j, value]) => {
          categories[i].services[j].selected = value;
        });

        categories.forEach((category, i) => {
          categories[i].selected = category.services.every(s => s.selected);
        });

        return categories;
      });
    };
  }, [configuration.ui.url_submission_auto_service_selection, form]);

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.customize,
        state.values.settings.services,
        state.values.state.tab === 'hash' &&
          state.values.hash.type === 'url' &&
          state.values.settings.services.some(cat =>
            cat.services.some(svr => configuration.ui.url_submission_auto_service_selection.includes(svr.name))
          )
      ]}
      children={([loading, disabled, customize, categories, hasURLservices]) =>
        !hasURLservices ? null : (
          <Section primary={t('options.submission.url_submission_auto_service_selection.label')}>
            {(categories as SubmitStore['settings']['services'])
              .reduce((prev: [number, number][], category, i) => {
                category.services.forEach((service, j) => {
                  if (configuration.ui.url_submission_auto_service_selection?.includes(service.name)) prev.push([i, j]);
                });
                return prev;
              }, [])
              .map(([cat, svr], i) => (
                <form.Subscribe
                  key={i}
                  selector={state => {
                    const service = state.values.settings.services[cat].services[svr];
                    return [service.name, service.selected];
                  }}
                  children={([name, selected]) => (
                    <CheckboxInput
                      key={i}
                      id={`url_submission_auto_service_selection-${(name as string).replace('_', ' ')}`}
                      label={(name as string).replace('_', ' ')}
                      labelProps={{ textTransform: 'capitalize', color: 'textPrimary' }}
                      value={selected as boolean}
                      loading={loading as boolean}
                      disabled={(disabled || !customize) as boolean}
                      onChange={() => {
                        form.setFieldValue('settings', s => {
                          s.services[cat].services[svr].selected = !selected;
                          s.services[cat].selected = s.services[cat].services.every(val => val.selected);
                          return s;
                        });
                      }}
                    />
                  )}
                />
              ))}
          </Section>
        )
      }
    />
  );
});

export const ToS = React.memo(() => {
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
    <DialogActions sx={{ paddingTop: 0 }}>
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
    </DialogActions>
  );
});

export const AnalysisConfirmation = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.confirmation]}
      children={([open]) => (
        <Dialog fullWidth open={open} onClose={() => form.setFieldValue('state.confirmation', false)}>
          <Title />

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1.5) }}>
            <Password />
            <Malicious />
            <ExternalSources />
            <ExternalServices />
          </DialogContent>

          <ToS />
          <AnalysisActions />
        </Dialog>
      )}
    />
  );
});
