import { Alert, Tooltip, Typography, useTheme } from '@mui/material';
import { invalidateAPIQuery } from 'components/core/Query/API/invalidateAPIQuery';
import { useAPIMutation } from 'components/core/Query/API/useAPIMutation';
import useALContext from 'components/hooks/useALContext';
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
import React from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderSection = React.memo(() => {
  const { t } = useTranslation(['settings', 'submit']);
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser, configuration, settings } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useAPIMutation(() => {
    const tab = form.getFieldValue('state.tab');
    const profileSettings = form.getFieldValue('settings');
    if (!profileSettings) return;

    const body = parseSubmissionProfile(settings, profileSettings, tab);

    return {
      url: `/api/v4/user/settings/${currentUser.username}/`,
      method: 'POST',
      body,
      onSuccess: () => {
        showSuccessMessage(t('success_save'));
        form.setFieldValue('settings', s => updatePreviousSubmissionValues(s));
        form.setFieldValue('user', body);
        invalidateAPIQuery(({ url }) => url === '/api/v4/user/whoami/');
      },
      onFailure: ({ api_status_code, api_error_message }) => {
        showErrorMessage(api_error_message);
        if (api_status_code === 401 || api_status_code === 403) {
          showErrorMessage(api_error_message);
        }
      },
      onEnter: () => form.setFieldValue('state.submitting', true),
      onExit: () => form.setFieldValue('state.submitting', false)
    };
  });

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
          {modified && (
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
              <>
                {!tab ? null : tab === 'interface' ? null : tab === 'default' ? (
                  <>
                    <Typography
                      color="secondary"
                      style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                    >{`{"submission_profile": "default"}`}</Typography>
                    {t('profile.custom_desc')}
                  </>
                ) : (
                  <>
                    <Typography
                      color="secondary"
                      style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                    >{`{"submission_profile": "${tab}"}`}</Typography>
                  </>
                )}
              </>
            }
            secondaryLoading={loading}
            slotProps={{ actions: { spacing: 1 } }}
            actions={
              <>
                <Button
                  color="primary"
                  disabled={submitting || !modified}
                  progress={submitting}
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
                  progress={submitting}
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
                  progress={submitting}
                  tooltip={t('button.save.tooltip')}
                  tooltipProps={{ placement: 'bottom' }}
                  variant="contained"
                  onClick={() => handleSubmit.mutate()}
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
                    <Alert
                      severity={customize ? 'info' : 'warning'}
                      sx={{
                        paddingY: theme.spacing(0.25),
                        width: '100%'
                      }}
                    >
                      {customize ? t('submit:customize.full.label') : t('submit:customize.limited.label')}
                    </Alert>
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

HeaderSection.displayName = 'HeaderSection';
