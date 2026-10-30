import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Typography } from '@mui/material';
import { useApiQuery } from 'core/api';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { useLoginRequest } from 'layout/auth/log-in/log-in.hooks';
import { useLoginForm } from 'layout/auth/log-in/log-in.providers';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { decode, encode } from 'shared/utils/cbor';
import { toArrayBuffer } from 'shared/utils/toArrayBuffer';

//*****************************************************************************************
// Security Token Login
//*****************************************************************************************

export const SecurityTokenLogin = memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();
  const requestLogin = useLoginRequest();

  useApiQuery({
    url: `/api/v4/webauthn/authenticate/begin/${form.state.values.username || ''}/`,
    method: 'GET',
    onSuccess: ({ api_response }) => {
      const arrayData = toArrayBuffer(api_response);
      try {
        const options = decode(arrayData.buffer) as CredentialRequestOptions;
        const credentialHelper = navigator.credentials;
        if (credentialHelper === undefined) throw new Error('WebAuthn unavailable');

        void credentialHelper
          .get(options)
          .then((assertion: PublicKeyCredential) => {
            if (!assertion) throw new Error('WebAuthn assertion unavailable');
            const response = assertion.response as AuthenticatorAssertionResponse;
            const assertionData = encode({
              credentialId: new Uint8Array(assertion.rawId),
              authenticatorData: new Uint8Array(response.authenticatorData),
              clientDataJSON: new Uint8Array(response.clientDataJSON),
              signature: new Uint8Array(response.signature)
            });

            form.setFieldValue('webauthn_auth_resp', Array.from(new Uint8Array(assertionData)));
            requestLogin.mutate();
          })
          .catch(() => {
            form.setFieldValue('mode', 'otp');
            showErrorMessage(t('securitytoken.error'));
          });
      } catch {
        form.setFieldValue('mode', 'otp');
        showErrorMessage(t('securitytoken.unavailable'));
      }
    },
    onFailure: () => {
      form.setFieldValue('mode', 'otp');
      showErrorMessage(t('securitytoken.unavailable'));
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <div>
        <LockOutlinedIcon style={{ fontSize: '108pt' }} color="action" />
      </div>
      <Typography variant="h6" color="textSecondary">
        {t('securitytoken')}
      </Typography>
    </div>
  );
});

SecurityTokenLogin.displayName = 'SecurityTokenLogin';
