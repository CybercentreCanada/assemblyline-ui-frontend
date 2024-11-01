import { Button, FormControlLabel, Skeleton, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { MetadataSummary } from 'components/routes/submit/components/MetadataSummary';
import type { SubmitStore } from 'components/routes/submit/contexts/form';
import { useForm } from 'components/routes/submit/contexts/form';
import FileDropper from 'components/visual/FileDropper';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

type Props = {
  onValidateServiceSelection: (cbType: string) => void;
  onCancelUpload: () => void;
  onSubmit: () => void;
};

const WrappedFileSubmit = ({ onValidateServiceSelection, onCancelUpload, onSubmit = () => null }: Props) => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const form = useForm();

  const handleSubmit = useCallback(() => {
    const showValidate = form.state.values.settings.services.some(cat =>
      cat.services.some(svr => svr.selected && svr.is_external)
    );

    if (showValidate) {
      form.setStore(s => ({ ...s, confirmation: { open: true, type: 'file' } }));
    } else {
      onSubmit();
    }
  }, [form, onSubmit]);

  return !form.state.values.settings ? (
    <Skeleton style={{ height: '280px' }} />
  ) : (
    <div style={{ marginTop: theme.spacing(2) }}>
      <form.Field
        name="file"
        children={({ state, handleChange }) => (
          <FileDropper
            file={state.value}
            setFile={(value: SubmitStore['file']) => handleChange(value)}
            disabled={form.state.values.upload.disable || !currentUser.roles.includes('submission_create')}
          />
        )}
      />

      <form.Subscribe
        selector={state => [state.values.file, configuration.ui.allow_malicious_hinting]}
        children={([file, allow_malicious_hinting]) =>
          !file ? null : !allow_malicious_hinting ? (
            <div style={{ padding: theme.spacing(2) }} />
          ) : (
            <div style={{ padding: theme.spacing(1) }}>
              <Tooltip title={t('malicious.tooltip')} placement="top">
                <div>
                  <form.Field
                    name="settings.malicious"
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
        selector={state => [state.values.file, state.values.upload.disable, state.values.upload.progress]}
        children={props => {
          const file = props[0] as SubmitStore['file'];
          const disable = props[1] as SubmitStore['upload']['disable'];
          const progress = props[2] as SubmitStore['upload']['progress'];

          return !file ? null : (
            <Button disabled={disable} color="primary" variant="contained" onClick={() => handleSubmit()}>
              {progress === null ? t('file.button') : `${progress}${t('submit.progress')}`}
            </Button>
          );
        }}
      />

      <form.Subscribe
        selector={state => [state.values.file]}
        children={([file]) =>
          !file ? null : (
            <Button
              style={{ marginLeft: theme.spacing(2) }}
              color="secondary"
              variant="contained"
              onClick={onCancelUpload}
            >
              {t('file.cancel')}
            </Button>
          )
        }
      />

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

export const FileSubmit = React.memo(WrappedFileSubmit);
