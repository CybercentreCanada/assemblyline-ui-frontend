import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import { decode, encode } from 'lib/utils/cbor';
import toArrayBuffer from 'lib/utils/toArrayBuffer';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '../log-in.providers';

type SecTokenProps = {
  setVariant: (value: 'otp' | 'login') => void;
};

export const SecurityTokenLogin = React.memo(({ setVariant }: SecTokenProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();
  const username = form.state.values.userpass.username;

  const beginWebAuthn = useAPIMutation<[string]>(user => ({
    url: `/api/v4/webauthn/authenticate/begin/${user}/`,
    onSuccess: api_data => {
      const arrayData = toArrayBuffer(api_data.api_response);
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

            form.setFieldValue('webauthn.response', Array.from(new Uint8Array(assertionData)));
          })
          .catch(ex => {
            // eslint-disable-next-line no-console
            console.log(`${ex.name}: ${ex.message}`);
            setVariant('otp');
            showErrorMessage(t('securitytoken.error'));
          });
      } else {
        setVariant('otp');
        showErrorMessage(t('securitytoken.unavailable'));
      }
    }
  }));

  useEffect(() => {
    if (!username) return;
    beginWebAuthn.mutate(username);
  }, [beginWebAuthn, username]);

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
