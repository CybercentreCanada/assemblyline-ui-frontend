import { Button, TextField, Typography, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import useMyAPI from 'components/hooks/useMyAPI';
import TextDivider from 'components/visual/TextDivider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type OTPProps = {
  setDrawerOpen: (value: boolean) => void;
  set2FAEnabled: (value: boolean) => void;
};

export default function OTP({ setDrawerOpen, set2FAEnabled }: OTPProps) {
  const apiCall = useMyAPI();
  const [response, setResponse] = useState(null);
  const [tempOTP, setTempOTP] = useState('');
  const { t } = useTranslation(['user']);
  const regex = RegExp('^[0-9]{1,6}$');
  const theme = useTheme();
  const sp4 = theme.spacing(4);
  const sp6 = theme.spacing(6);

  function handleOTPChange(event) {
    if (regex.test(event.target.value) || event.target.value === '') {
      setTempOTP(event.target.value);
    } else {
      event.preventDefault();
    }
  }

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
        {t('2fa_setup_title')}
      </Typography>
      <div style={{ textAlign: 'center' }}>
        <Typography>{t('2fa_scan')}</Typography>
        <div
          style={{
            paddingTop: sp4,
            paddingBottom: sp4,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          {response ? (
            <div
              style={{ backgroundColor: 'white' }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: response.qrcode
              }}
            />
          ) : (
            <Skeleton variant="rect" style={{ width: '195px', height: '195px' }} />
          )}
        </div>
        <TextDivider forcePaper />
        <Typography gutterBottom>{t('2fa_manual')}</Typography>
        <div style={{ paddingTop: sp4, paddingBottom: sp4 }}>
          <Typography variant="caption">{response ? response.secret_key : <Skeleton />}</Typography>
        </div>
        <TextField
          disabled={response === null}
          style={{ width: '100%' }}
          margin="normal"
          variant="outlined"
          label={t('2fa_temp_otp')}
          onChange={handleOTPChange}
          value={tempOTP}
        />

        <div style={{ paddingTop: sp6, textAlign: 'end' }}>
          <Button style={{ marginRight: '8px' }} variant="contained" onClick={() => setDrawerOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            disabled={response === null || tempOTP === ''}
            variant="contained"
            color="primary"
            onClick={() => validateOTP()}
          >
            {t('validate')}
          </Button>
        </div>
      </div>
    </>
  );
}
