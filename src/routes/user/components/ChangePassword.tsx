import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { Tooltip } from 'ui/Tooltip';

export type ChangePasswordProps = {
  user: CustomUser;
  onCancel: () => void;
  onSave: (updatedUser: CustomUser) => void;
};

export const ChangePassword = memo(({ user, onCancel, onSave }: ChangePasswordProps) => {
  const { t } = useTranslation(['user']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validationError = useMemo<string | null>(() => {
    if (!newPassword || !confirmPassword) {
      return t('password.empty');
    }

    return newPassword === confirmPassword ? null : t('password.inputs_dont_match');
  }, [newPassword, confirmPassword, t]);

  const showValidationError = submitAttempted || (newPassword.length > 0 && confirmPassword.length > 0);
  const displayedError = serverError ?? (showValidationError ? validationError : null);

  const handleNewPasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value);
    setServerError(null);
  }, []);

  const handleConfirmPasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
    setServerError(null);
  }, []);

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(previous => !previous);
  }, []);

  const handleUpdatePassword = useCallback(() => {
    setSubmitAttempted(true);
    if (validationError) {
      return;
    }
    setServerError(null);
    const userToSave = { ...user, new_pass: newPassword, new_pass_confirm: newPassword };

    apiCall({
      url: `/api/v4/user/${user.uname}/`,
      method: 'POST',
      body: userToSave,
      onSuccess: () => {
        showSuccessMessage(t('password.updated'));
        setServerError(null);
        setSubmitAttempted(false);
        onSave(userToSave);
      },
      onFailure(api_data) {
        setServerError(api_data.api_error_message);
      },
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
  }, [validationError, user, newPassword, apiCall, showSuccessMessage, t, onSave]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        {t('change_password')}
      </Typography>

      <TextField
        autoFocus
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        variant="outlined"
        label={t('password.new')}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? t('password.hide') : t('password.show')}>
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? t('password.hide') : t('password.show')}
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
        }}
        onChange={handleNewPasswordChange}
      />

      <TextField
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        variant="outlined"
        label={t('password.confirm')}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? t('password.hide') : t('password.show')}>
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? t('password.hide') : t('password.show')}
                    title={showPassword ? t('password.hide') : t('password.show')}
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
        }}
        onChange={handleConfirmPasswordChange}
      />

      <div aria-live="polite" style={{ minHeight: theme.spacing(3), marginTop: theme.spacing(2) }}>
        {displayedError && (
          <Typography color="error" variant="subtitle2">
            {displayedError}
          </Typography>
        )}
      </div>

      <div style={{ marginTop: theme.spacing(1), textAlign: 'end' }}>
        <Button disabled={loading} sx={{ mr: 2 }} variant="outlined" onClick={onCancel}>
          {t('cancel')}
        </Button>

        <Button
          disabled={loading}
          progress={loading}
          variant="contained"
          color="primary"
          onClick={handleUpdatePassword}
        >
          {t('update')}
        </Button>
      </div>
    </div>
  );
});

ChangePassword.displayName = 'ChangePassword';
