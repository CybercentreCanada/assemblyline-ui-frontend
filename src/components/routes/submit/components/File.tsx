import { Button, FormControlLabel, Skeleton, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { MetadataSummary } from 'components/routes/submit/components/MetadataSummary';
import type { SubmitStore } from 'components/routes/submit/contexts/form';
import { useForm } from 'components/routes/submit/contexts/form';
import FileDropper from 'components/visual/FileDropper';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  onCancelUpload: () => void;
};

export const FileSubmit = ({ onCancelUpload }: Props) => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { user: currentUser, configuration } = useALContext();

  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.submit.isFetchingSettings]}
      children={([fetching]) =>
        fetching ? (
          <Skeleton style={{ height: '280px' }} />
        ) : (
          <div style={{ marginTop: theme.spacing(2) }}>
            <form.Field
              name="file"
              children={({ state, handleChange }) => (
                <FileDropper
                  file={state.value}
                  setFile={(value: SubmitStore['file']) => handleChange(value)}
                  disabled={form.state.values.submit.isUploading || !currentUser.roles.includes('submission_create')}
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
              selector={state => [
                state.values.file,
                state.values.submit.isUploading,
                state.values.submit.uploadProgress
              ]}
              children={props => {
                const file = props[0] as SubmitStore['file'];
                const isUploading = props[1] as SubmitStore['submit']['isUploading'];
                const uploadProgress = props[2] as SubmitStore['submit']['uploadProgress'];

                return !file ? null : (
                  <Button
                    disabled={isUploading}
                    color="primary"
                    variant="contained"
                    onClick={() => form.handleSubmit()}
                  >
                    {!isUploading ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
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
        )
      }
    />
  );
};
