import { Box, Button, Typography } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React from 'react';
import { useTranslation } from 'react-i18next';

type DisableOTPProps = {
  setDrawerOpen: (value: boolean) => void;
  set2FAEnabled: (value: boolean) => void;
};

export default function DisableOTP<DisableOTPProps>({ setDrawerOpen, set2FAEnabled }) {
  const apiCall = useMyAPI();
  const { t } = useTranslation();

  function disableOTP() {
    apiCall({
      url: '/api/v4/auth/disable_otp/',
      onSuccess: api_data => {
        setDrawerOpen(false);
        set2FAEnabled(false);
      }
    });
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('page.user.2fa_disable_title')}
      </Typography>
      <Typography>{t('page.user.2fa_disable_desc')}</Typography>
      <Box textAlign="end" pt={6}>
        <Button style={{ marginRight: '8px' }} variant="contained" onClick={() => setDrawerOpen(false)}>
          {t('page.user.cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={() => disableOTP()}>
          {t('page.user.2fa_disable')}
        </Button>
      </Box>
    </>
  );
}
