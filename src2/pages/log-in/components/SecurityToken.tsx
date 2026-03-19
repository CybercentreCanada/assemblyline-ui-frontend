import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Typography } from '@mui/material';
import { useAPIQuery } from 'core/api';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { decode, encode } from 'lib/utils/cbor';
import toArrayBuffer from 'lib/utils/toArrayBuffer';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '../log-in.providers';

export const SecurityTokenLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();

  useAPIQuery({
    url: `/api/v4/webauthn/authenticate/begin/${form.state.values.username || ''}/`,
    method: 'GET',
    onSuccess: ({ api_response }) => {
      const arrayData = toArrayBuffer(api_response);
      const options = decode(arrayData.buffer);
      const credentialHelper = navigator.credentials;
      if (credentialHelper !== undefined) {
        credentialHelper
          .get(options)
          .then((assertion: PublicKeyCredential) => {
            const response = assertion.response as AuthenticatorAssertionResponse;
            const assertionData = encode({
              credentialId: new Uint8Array(assertion.rawId),
              authenticatorData: new Uint8Array(response.authenticatorData),
              clientDataJSON: new Uint8Array(response.clientDataJSON),
              signature: new Uint8Array(response.signature)
            });

            form.setFieldValue('webauthn_auth_resp', Array.from(new Uint8Array(assertionData)));
          })
          .catch(ex => {
            // eslint-disable-next-line no-console
            console.log(`${ex.name}: ${ex.message}`);
            form.setFieldValue('mode', 'otp');
            showErrorMessage(t('securitytoken.error'));
          });
      } else {
        form.setFieldValue('mode', 'otp');
        showErrorMessage(t('securitytoken.unavailable'));
      }
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
