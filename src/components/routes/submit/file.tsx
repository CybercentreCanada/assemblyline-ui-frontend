import { Button, FormControlLabel, Skeleton, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import SubmissionMetadata from 'components/layout/submissionMetadata';
import FileDropper from 'components/visual/FileDropper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useForm } from '.';

type Props = {
  onValidateServiceSelection: (cbType: string) => void;
  onCancelUpload: () => void;
};

const WrappedFileSubmit = ({ onValidateServiceSelection, onCancelUpload }: Props) => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const form = useForm();

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  return !form.state.values.settings ? (
    <Skeleton style={{ height: '280px' }} />
  ) : (
    <div style={{ marginTop: theme.spacing(2) }}>
      <form.Field
        field={() => '$.file'}
        children={({ state, handleChange }) => (
          <FileDropper
            file={state.value}
            setFile={value => handleChange(value)}
            disabled={!form.state.values.allowClick || !currentUser.roles.includes('submission_create')}
          />
        )}
      />

      <form.Subscribe
        selector={state => [state.values.file, configuration.ui.allow_malicious_hinting]}
        children={([file, allow_malicious_hinting]) =>
          !file ? null : !allow_malicious_hinting ? (
            <div style={{ padding: sp2 }} />
          ) : (
            <div style={{ padding: sp1 }}>
              <Tooltip title={t('malicious.tooltip')} placement="top">
                <div>
                  <form.Field
                    field={store => store.settings.malicious.toPath()}
                    children={({ state, handleChange }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={state.value !== undefined && state.value !== null ? state.value : true}
                            disabled={state.value === undefined && state.value === null}
                            onChange={() => handleChange(v => !v)}
                            color="secondary"
                            name="is_malware"
                          />
                        }
                        label={t('malicious')}
                      />
                    )}
                  />
                </div>
              </Tooltip>
            </div>
          )
        }
      />

      <form.Subscribe
        selector={state => [state.values.file, state.values.allowClick, state.values.uploadProgress]}
        children={([file, allowClick, uploadProgress]) =>
          !file ? null : (
            <Button
              disabled={!allowClick}
              color="primary"
              variant="contained"
              onClick={() => onValidateServiceSelection('file')}
            >
              {uploadProgress === null ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
            </Button>
          )
        }
      />

      <form.Subscribe
        selector={state => [state.values.file]}
        children={([file]) =>
          !file ? null : (
            <Button style={{ marginLeft: sp2 }} color="secondary" variant="contained" onClick={onCancelUpload}>
              {t('file.cancel')}
            </Button>
          )
        }
      />

      <form.Field
        field={store => store.submissionMetadata.toPath()}
        children={({ state, handleChange }) => (
          <SubmissionMetadata submissionMetadata={state.value} setSubmissionMetadata={value => handleChange(value)} />
        )}
      />

      {!configuration.ui.tos ? null : (
        <div style={{ marginTop: sp4, textAlign: 'center' }}>
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

export const FileSubmit = React.memo(WrappedFileSubmit);
