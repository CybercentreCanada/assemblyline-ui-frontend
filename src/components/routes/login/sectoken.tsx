import { Typography } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
// eslint-disable-next-line import/extensions
import CBOR from 'helpers/cbor.js';
import toArrayBuffer from 'helpers/toArrayBuffer';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type SecTokenProps = {
  setShownControls: (value: string) => void;
  setWebAuthNResponse: (value) => void;
  username: string;
};

export function SecurityTokenLogin({ username, setShownControls, setWebAuthNResponse }: SecTokenProps) {
  const { t } = useTranslation(['login']);
  const apiCall = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  useEffect(() => {
    apiCall({
      url: `/api/v4/webauthn/authenticate/begin/${username}/`,
      onSuccess: api_data => {
        const arrayData = toArrayBuffer(api_data.api_response);
        const options = CBOR.decode(arrayData.buffer);
        const credentialHelper = navigator.credentials;
        if (credentialHelper !== undefined) {
          credentialHelper
            .get(options)
            .then((assertion: PublicKeyCredential) => {
              const response = assertion.response as AuthenticatorAssertionResponse;
              const assertionData = CBOR.encode({
                credentialId: new Uint8Array(assertion.rawId),
                authenticatorData: new Uint8Array(response.authenticatorData),
                clientDataJSON: new Uint8Array(response.clientDataJSON),
                signature: new Uint8Array(response.signature)
              });

              setWebAuthNResponse(Array.from(new Uint8Array(assertionData)));
            })
            .catch(ex => {
              // eslint-disable-next-line no-console
              console.log(`${ex.name}: ${ex.message}`);
              setShownControls('otp');
              showErrorMessage(t('securitytoken.error'));
            });
        } else {
          setShownControls('otp');
          showErrorMessage(t('securitytoken.unavailable'));
        }
      }
    });
    // eslint-disable-next-line
  }, []);

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
}
