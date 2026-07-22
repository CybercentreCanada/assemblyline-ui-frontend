import { Alert, Tooltip, Typography, useTheme } from '@mui/material';
import { invalidateApiQuery, useApiMutation } from 'core/api';
import { useAppConfig } from 'core/config';
import { useAppSnackbar } from 'core/snackbar';
import { Button } from 'ui/buttons/Button';
import { PageHeader } from 'ui/layouts/PageHeader';
import { useForm } from '../settings.form';
import {
  hasDifferentDefaultSubmissionValues,
  hasDifferentPreviousSubmissionValues,
  parseSubmissionProfile,
  resetDefaultSubmissionValues,
  resetPreviousSubmissionValues,
  updatePreviousSubmissionValues
} from '../settings.utils';
// import { RouterPrompt } from 'ui/navigation/RouterPrompt';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderSection = memo(() => {
  const { t } = useTranslation(['settings', 'submit']);
  const theme = useTheme();
  const form = useForm();
  const currentUser = useAppConfig(s => s.user);
  const configuration = useAppConfig(s => s.configuration);
  const settings = useAppConfig(s => s.settings);
  const { showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const handleSubmit = useApiMutation(() => {
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
        invalidateApiQuery(({ url }) => url === '/api/v4/user/whoami/');
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
          {/* {modified && (
            <RouterPrompt
              when={modified}
              onAccept={() => {
                form.setFieldValue('settings', s => resetPreviousSubmissionValues(s));
                return true;
              }}
            />
          )} */}

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
