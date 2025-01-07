import Flow from '@flowjs/flow.js';
import { Button, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { APIResponseProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { parseSubmissionProfiles } from 'components/routes/settings/utils/utils';
import type { SubmitStore } from 'components/routes/submit/contexts/form';
import { useForm } from 'components/routes/submit/contexts/form';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDropper from 'components/visual/FileDropper';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import generateUUID from 'helpers/uuid';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { MetadataSummary } from './MetadataSummary';

const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

type Props = {
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
};

export const FileSubmit = ({ profile = null, loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { user: currentUser, configuration } = useALContext();

  const form = useForm();

  const handleCancel = useCallback(() => {
    form.setStore(s => {
      s.file = null;
      s.state.isUploading = false;
      s.state.uploadProgress = null;
      s.state.uuid = generateUUID();
      return s;
    });
    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  const handleSubmitFile = useCallback(
    () => {
      const file = form.getFieldValue('file');
      const metadata = form.getFieldValue('metadata');
      const settings = form.getFieldValue('settings');
      const size = form.getFieldValue('file.size');
      const submissionProfile = form.getFieldValue('state.profile');
      const uuid = form.getFieldValue('state.uuid');

      form.setStore(s => {
        s.state.disabled = true;
        s.state.isUploading = true;
        s.state.uploadProgress = 0;
        return s;
      });

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
        form.setStore(s => {
          s.state.uploadProgress = Math.trunc(FLOW.progress() * 100);
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
          url: `/api/v4/ui/start/${uuid}/`,
          method: 'POST',
          body: {
            ...parseSubmissionProfiles(settings),
            submission_profile: submissionProfile,
            filename: file.path,
            metadata: metadata
          },
          onSuccess: ({ api_response }) => {
            showSuccessMessage(`${t('submit.success')} ${api_response.sid}`);
            setTimeout(() => {
              navigate(`/submission/detail/${api_response.sid}`);
            }, 500);
          },
          onFailure: ({ api_status_code, api_error_message }) => {
            if (api_status_code === 400 && api_error_message.includes('metadata')) {
              form.setStore(s => {
                s.state.disabled = false;
                s.state.tab = 'options';
                return s;
              });
            }

            if ([400, 403, 404, 503].includes(api_status_code)) {
              showErrorMessage(api_error_message);
            } else {
              showErrorMessage(t('submit.file.failure'));
            }

            handleCancel();
          }
        });
      });

      FLOW.addFile(file);
      FLOW.upload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, handleCancel, t]
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

      handleSubmitFile();
    },
    [handleSubmitFile]
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

        handleSubmitFile();
      }
    },
    [form, handleSubmitFile, profile]
  );

  return loading || !profile ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: theme.spacing(2) }}>
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
            handleAccept={() => handleSubmitFile()}
            title={t('validate.title')}
            cancelText={t('validate.cancelText')}
            acceptText={t('validate.acceptText')}
            text={t('validate.text')}
          />
        )}
      />

      <div style={{ width: '100%' }}>
        <form.Field
          name="file"
          children={({ state, handleChange }) => (
            <FileDropper
              file={state.value}
              setFile={(value: SubmitStore['file']) => handleChange(value)}
              disabled={form.state.values.state.isUploading || !currentUser.roles.includes('submission_create')}
            />
          )}
        />
      </div>

      <div style={{ width: 'auto' }}>
        <form.Subscribe
          selector={state => [
            !!state.values.file,
            configuration.ui.allow_malicious_hinting || true,
            state.values?.settings?.malicious || false
          ]}
          children={([file, allow_malicious_hinting, malicious]) =>
            !file ? null : !allow_malicious_hinting ? (
              <div style={{ padding: theme.spacing(2) }} />
            ) : (
              <div style={{ padding: theme.spacing(1) }}>
                <SwitchInput
                  label={t('malicious')}
                  labelProps={{ variant: 'body1' }}
                  tooltip={t('malicious.tooltip')}
                  tooltipProps={{ placement: 'top' }}
                  name="is_malware"
                  size="medium"
                  value={malicious !== undefined && malicious !== null ? malicious : true}
                  disabled={malicious === undefined && malicious === null}
                  onChange={(event, value) => {
                    form.setStore(s => {
                      s.settings.malicious = value;
                      return s;
                    });
                  }}
                />
              </div>
            )
          }
        />
      </div>

      <div style={{ display: 'flex', columnGap: theme.spacing(2) }}>
        <form.Subscribe
          selector={state => [!!state.values.file, state.values.state.isUploading, state.values.state.uploadProgress]}
          children={([file, isUploading, uploadProgress]) =>
            !file ? null : (
              <Button
                disabled={isUploading as boolean}
                color="primary"
                variant="contained"
                onClick={() => handleConfirm(form.state.values)}
                style={{ alignSelf: 'end' }}
              >
                {!isUploading ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
              </Button>
            )
          }
        />

        <form.Subscribe
          selector={state => [!!state.values.file]}
          children={([file]) =>
            !file ? null : (
              <Button color="secondary" variant="contained" onClick={handleCancel}>
                {t('file.cancel')}
              </Button>
            )
          }
        />
      </div>

      <MetadataSummary />

      {!configuration.ui.tos ? null : (
        <div style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="body2">
            {t('terms1')}
            <i>{t('file.button')}</i>
            {t('terms2')}
            <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
              {t('terms3')}
            </Link>
            .
          </Typography>
        </div>
      )}
    </div>
  );
};
