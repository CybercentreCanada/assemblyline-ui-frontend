import { Box, Button, TextField, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import useMyAPI from 'components/hooks/useMyAPI';
import TextDivider from 'components/visual/text_divider';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNull } from 'util';

type OTPProps = {
  setDrawerOpen: (value: boolean) => void;
  set2FAEnabled: (value: boolean) => void;
};

export default function OTP<OTPProps>({ setDrawerOpen, set2FAEnabled }) {
  const apiCall = useMyAPI();
  const [response, setResponse] = useState(null);
  const [tempOTP, setTempOTP] = useState('');
  const { t } = useTranslation();

  function validateOTP() {
    apiCall({
      url: `/api/v4/auth/validate_otp/${tempOTP}/`,
      onSuccess: () => {
        setDrawerOpen(false);
        set2FAEnabled(true);
      }
    });
  }

  useEffect(() => {
    // Load OTP setup on start
    apiCall({
      url: '/api/v4/auth/setup_otp/',
      onSuccess: api_data => {
        setResponse(api_data.api_response);
      },
      onFailure: () => {
        set2FAEnabled(true);
        setTimeout(() => {
          setDrawerOpen(false);
        }, 1000);
      }
    });

    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('page.account.2fa_setup_title')}
      </Typography>
      <Box textAlign="center">
        <Typography>{t('page.account.2fa_scan')}</Typography>
        <Box py={4} display="flex" flexDirection="row" justifyContent="center">
          {response ? (
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: response.qrcode
              }}
            />
          ) : (
            <Skeleton variant="rect" style={{ width: '195px', height: '195px' }} />
          )}
        </Box>
        <TextDivider />
        <Typography gutterBottom>{t('page.account.2fa_manual')}</Typography>
        <Box py={4}>
          <Typography variant="caption">{response ? response.secret_key : <Skeleton />}</Typography>
        </Box>
        <TextField
          inputProps={{ maxLength: 6 }}
          disabled={isNull(response)}
          style={{ width: '100%' }}
          margin="normal"
          variant="outlined"
          label={t('page.account.2fa_temp_otp')}
          onChange={event => setTempOTP(event.target.value)}
        />

        <Box textAlign="end" pt={6}>
          <Button style={{ marginRight: '8px' }} variant="contained" onClick={() => setDrawerOpen(false)}>
            {t('page.account.cancel')}
          </Button>
          <Button disabled={isNull(response)} variant="contained" color="primary" onClick={() => validateOTP()}>
            {t('page.account.validate')}
          </Button>
        </Box>
      </Box>
    </>
  );
}
