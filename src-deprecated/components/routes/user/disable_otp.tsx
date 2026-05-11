import { Button, Typography, useTheme } from '@mui/material';
import useMyAPI from 'components/hooks/useMyAPI';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type DisableOTPProps = {
  isUnsetOTP: boolean;
  username?: String;
  setDrawerOpen: (value: boolean) => void;
  set2FAEnabled: (value: boolean) => void;
};

export default function DisableOTP({ isUnsetOTP = false, username, setDrawerOpen, set2FAEnabled }: DisableOTPProps) {
  const { apiCall } = useMyAPI();
  const { t } = useTranslation(['user']);
  const theme = useTheme();

  const disableOTP = useCallback(() => {
    apiCall({
      url: '/api/v4/auth/disable_otp/',
      onSuccess: () => {
        setDrawerOpen(false);
        set2FAEnabled(false);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unsetOTP = useCallback(() => {
    apiCall({
      url: `/api/v4/auth/unset_otp/${username}/`,
      onSuccess: () => {
        setDrawerOpen(false);
        set2FAEnabled(false);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {isUnsetOTP ? t('unset_otp.title') : t('2fa_disable_title')}
      </Typography>
      <Typography>{isUnsetOTP ? t('unset_otp.desc') : t('2fa_disable_desc')}</Typography>
      <div style={{ textAlign: 'end', paddingTop: theme.spacing(6) }}>
        <Button style={{ marginRight: '8px' }} variant="contained" onClick={() => setDrawerOpen(false)}>
          {t('cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={() => (isUnsetOTP ? unsetOTP() : disableOTP())}>
          {isUnsetOTP ? t('unset_otp.button') : t('2fa_disable')}
        </Button>
      </div>
    </>
  );
}
