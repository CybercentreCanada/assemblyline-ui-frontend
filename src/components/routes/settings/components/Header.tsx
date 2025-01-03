import {
  Button,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
  Skeleton,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import type { SubmitSettings } from 'components/routes/settings/utils/utils';
import { parseSubmissionProfiles } from 'components/routes/settings/utils/utils';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import _ from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const HeaderSection = ({ hidden = false, loading = false, profile = 'interface' }: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useCallback(
    (data: SubmitSettings) => {
      if (!data) return;

      apiCall({
        url: `/api/v4/user/settings/${currentUser.username}/`,
        method: 'POST',
        body: parseSubmissionProfiles(data),
        onSuccess: () => {
          showSuccessMessage(t('success_save'));
          form.setStore(s => {
            s.prev = _.cloneDeep(s.next);
            return s;
          });
        },
        onFailure: api_data => {
          if (api_data.api_status_code === 403) {
            showErrorMessage(api_data.api_error_message);
          }
        },
        onEnter: () => {
          form.setStore(s => {
            s.state.confirm = true;
            s.state.submitting = true;
            return s;
          });
        },
        onExit: () => {
          form.setStore(s => {
            s.state.confirm = false;
            s.state.submitting = false;
            return s;
          });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.username, t]
  );

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.submitting,
        state.values.state.confirm,
        !_.isEqual(state.values.next, state.values.prev)
      ]}
      children={([submitting, confirm, modified]) => {
        return (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              backgroundColor: theme.palette.background.default
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: theme.spacing(2)
              }}
            >
              {!modified ? null : (
                <RouterPrompt
                  when={modified}
                  onAccept={() => {
                    form.setStore(s => {
                      s.next = structuredClone(s.prev);
                      return s;
                    });
                    return true;
                  }}
                />
              )}

              <ConfirmationDialog
                open={confirm}
                handleClose={() => {
                  form.setStore(s => {
                    s.state.confirm = false;
                    return s;
                  });
                }}
                handleAccept={() => handleSubmit(form.getFieldValue('next'))}
                title={t('save.title')}
                cancelText={t('save.cancelText')}
                acceptText={t('save.acceptText')}
                text={t('save.text')}
                waiting={submitting}
              />

              <div style={{ flex: 1 }}>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography color="textSecondary" variant="caption">
                  {loading ? <Skeleton style={{ width: '10rem' }} /> : !profile ? null : t(`profile.${profile}`)}
                </Typography>
              </div>

              <FormControlLabel
                control={<Switch checked={hidden} />}
                label={t('hidden')}
                onClick={() => {
                  form.setStore(s => {
                    s.state.hidden = !s.state.hidden;
                    return s;
                  });
                }}
              />

              <Button
                variant="outlined"
                color="primary"
                disabled={submitting || !modified}
                onClick={() => {
                  form.setStore(s => {
                    s.next = structuredClone(s.prev);
                    return s;
                  });
                }}
              >
                {t('reset')}
                {submitting && (
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

              <Button
                variant="contained"
                color="primary"
                disabled={submitting || !modified}
                onClick={() => {
                  form.setStore(s => {
                    s.state.confirm = true;
                    return s;
                  });
                }}
              >
                {t('save')}
                {submitting && (
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
            </div>
            {!loading ? null : <LinearProgress />}
          </div>
        );
      }}
    />
  );
};
