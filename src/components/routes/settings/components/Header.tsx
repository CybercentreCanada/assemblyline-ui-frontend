import { Alert, Tooltip, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
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
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderSection = React.memo(() => {
  const { t } = useTranslation(['settings', 'submit']);
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

      const body = parseSubmissionProfile(settings, profileSettings, tab);

      apiCall({
        url: `/api/v4/user/settings/${currentUser.username}/`,
        method: 'POST',
        body: body,
        onSuccess: () => {
          showSuccessMessage(t('success_save'));
          form.setFieldValue('settings', s => updatePreviousSubmissionValues(s));
          form.setFieldValue('user', body);
        },
        onFailure: ({ api_status_code, api_error_message }) => {
          showErrorMessage(api_error_message);
          if (api_status_code === 403 || api_status_code === 401) {
            showErrorMessage(api_error_message);
          }
        },
        onEnter: () => form.setFieldValue('state.submitting', true),
        onExit: () => form.setFieldValue('state.submitting', false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.username, form, settings, t]
  );

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab,
          state.values.state.loading,
          state.values.state.submitting,
          hasDifferentPreviousSubmissionValues(state.values.settings),
          hasDifferentDefaultSubmissionValues(state.values.settings)
        ] as const
      }
      children={([tab, loading, submitting, modified, hasReset]) => (
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
          <PageHeader
            primary={
              !tab
                ? t('profile.interface')
                : tab === 'interface'
                  ? t('profile.interface')
                  : tab === 'default'
                    ? t('profile.custom')
                    : configuration.submission.profiles[tab].display_name
            }
            secondary={
              !tab
                ? null
                : tab === 'interface'
                  ? null
                  : tab === 'default'
                    ? t('profile.custom_desc')
                    : configuration.submission.profiles[tab].description
            }
            loading={loading}
            slotProps={{ actions: { spacing: 1 } }}
            actions={
              <>
                <Button
                  color="primary"
                  disabled={submitting || !modified}
                  loading={submitting}
                  tooltip={t('button.cancel.tooltip')}
                  tooltipProps={{ placement: 'bottom' }}
                  variant="outlined"
                  onClick={() => form.setFieldValue('settings', s => resetPreviousSubmissionValues(s))}
                >
                  {t('button.cancel.label')}
                </Button>
                <Button
                  color="secondary"
                  disabled={submitting || !hasReset}
                  loading={submitting}
                  tooltip={t('button.reset.tooltip')}
                  tooltipProps={{ placement: 'bottom' }}
                  variant="contained"
                  onClick={() => form.setFieldValue('settings', s => resetDefaultSubmissionValues(s))}
                >
                  {t('button.reset.label')}
                </Button>
                <Button
                  color="primary"
                  disabled={submitting || !modified}
                  loading={submitting}
                  tooltip={t('button.save.tooltip')}
                  tooltipProps={{ placement: 'bottom' }}
                  variant="contained"
                  onClick={() => handleSubmit()}
                >
                  {t('button.save.label')}
                </Button>
              </>
            }
            endAdornment={
              <form.Subscribe
                selector={state => [state.values.state.customize] as const}
                children={([customize]) => (
                  <Tooltip
                    placement="bottom"
                    title={customize ? t('submit:customize.full.tooltip') : t('submit:customize.limited.tooltip')}
                    slotProps={{ tooltip: { sx: { backgroundColor: 'rgba(97, 97, 97, 1)' } } }}
                  >
                    <div>
                      <Alert
                        severity={customize ? 'info' : 'warning'}
                        sx={{ paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25), width: '100%' }}
                      >
                        {customize ? t('submit:customize.full.label') : t('submit:customize.limited.label')}
                      </Alert>
                    </div>
                  </Tooltip>
                )}
              />
            }
          />
        </>
      )}
    />
  );
});
