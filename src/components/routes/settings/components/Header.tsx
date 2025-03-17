import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { UserSettings } from 'components/models/base/user_settings';
import { useForm } from 'components/routes/settings/settings.form';
import {
  hasDifferentDefaultSubmissionValues,
  hasDifferentPreviousSubmissionValues,
  parseSubmissionProfile,
  resetDefaultSubmissionValues,
  resetPreviousSubmissionValues,
  updatePreviousSubmissionValues
} from 'components/routes/settings/settings.utils';
import { Button } from 'components/visual/Buttons/Button';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration, settings } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useCallback(
    () => {
      const tab = form.getFieldValue('state.tab');
      const profileSettings = form.getFieldValue('settings');
      if (!profileSettings) return;

      const body: UserSettings = parseSubmissionProfile(settings, profileSettings, tab);

      apiCall({
        url: `/api/v4/user/settings/${currentUser.username}/`,
        method: 'POST',
        body: body,
        onSuccess: () => {
          showSuccessMessage(t('success_save'));
          form.setFieldValue('settings', s => updatePreviousSubmissionValues(s));
        },
        onFailure: api_data => {
          if (api_data.api_status_code === 403 || api_data.api_status_code === 401) {
            showErrorMessage(api_data.api_error_message);
          }
        },
        onEnter: () => {
          form.setFieldValue('state.confirm', true);
          form.setFieldValue('state.submitting', true);
        },
        onExit: () => {
          form.setFieldValue('state.confirm', false);
          form.setFieldValue('state.submitting', false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.username, t]
  );

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab,
          state.values.state.loading,
          state.values.state.submitting,
          state.values.state.confirm,
          hasDifferentPreviousSubmissionValues(state.values.settings),
          hasDifferentDefaultSubmissionValues(state.values.settings)
        ] as const
      }
      children={([tab, loading, submitting, confirm, modified, hasReset]) => (
        <>
          {!modified ? null : (
            <RouterPrompt
              when={modified}
              onAccept={() => {
                form.setFieldValue('settings', s => resetPreviousSubmissionValues(s));
                return true;
              }}
            />
          )}

          <ConfirmationDialog
            open={confirm}
            handleClose={() => form.setFieldValue('state.confirm', false)}
            handleAccept={() => handleSubmit()}
            title={t('save.title')}
            cancelText={t('save.cancelText')}
            acceptText={t('save.acceptText')}
            text={t('save.text')}
            waiting={submitting}
          />
          <PageHeader
            primary={t('title')}
            secondary={
              !tab
                ? null
                : tab === 'interface'
                ? t('profile.interface')
                : tab === 'default'
                ? t('profile.custom')
                : configuration.submission.profiles[tab].display_name
            }
            loading={loading}
            endAdornment={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: theme.spacing(2)
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  loading={submitting}
                  disabled={submitting || !modified}
                  onClick={() => form.setFieldValue('settings', s => resetPreviousSubmissionValues(s))}
                >
                  {t('cancel')}
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  loading={submitting}
                  disabled={submitting || !hasReset}
                  onClick={() => form.setFieldValue('settings', s => resetDefaultSubmissionValues(s))}
                >
                  {t('reset')}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  loading={submitting}
                  disabled={submitting || !modified}
                  onClick={() => form.setFieldValue('state.confirm', true)}
                >
                  {t('save')}
                </Button>
              </div>
            }
          />
        </>
      )}
    />
  );
});
