import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import { memo, useEffect, useState } from 'react';
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

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  useEffect(() => {
    const newPasswordLength = newPassword.length;
    const confirmPasswordLength = confirmPassword.length;

    if (newPasswordLength === 0 || confirmPasswordLength === 0) {
      setPasswordValidationError(t('password.empty'));
      return;
    }

    const match = newPassword === confirmPassword;
    setPasswordValidationError(match ? null : t('password.inputs_dont_match'));
    setShowPasswordError(newPasswordLength > 0 && confirmPasswordLength > 0);
  }, [newPassword, confirmPassword]);

  const updatePassword = () => {
    if (passwordValidationError) {
      setShowPasswordError(true);
      return;
    }
    const userToSave = { ...user, new_pass: newPassword, new_pass_confirm: newPassword };

    apiCall({
      url: `/api/v4/user/${user.uname}/`,
      method: 'POST',
      body: userToSave,
      onSuccess: () => {
        showSuccessMessage(t('password.updated'));
        setShowPasswordError(false);
        onSave(userToSave);
      },
      onFailure(api_data) {
        setPasswordValidationError(api_data.api_error_message);
        setShowPasswordError(true);
      },
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
  };

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
                  <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
        }}
        onChange={event => setNewPassword(event.target.value)}
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
                    title={showPassword ? t('password.hide') : t('password.show')}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
        }}
        onChange={event => setConfirmPassword(event.target.value)}
      />

      <div style={{ minHeight: theme.spacing(3), marginTop: theme.spacing(2) }}>
        {showPasswordError && (
          <Typography color="error" variant="subtitle2">
            {passwordValidationError}
          </Typography>
        )}
      </div>

      <div style={{ marginTop: theme.spacing(1), textAlign: 'end' }}>
        <Button
          disabled={loading}
          style={{ marginRight: theme.spacing(2) }}
          variant="outlined"
          onClick={() => onCancel()}
        >
          {t('cancel')}
        </Button>

        <Button
          disabled={loading}
          progress={loading}
          variant="contained"
          color="primary"
          onClick={() => updatePassword()}
        >
          {t('update')}
        </Button>
      </div>
    </div>
  );
});
