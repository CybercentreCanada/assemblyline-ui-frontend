import { Box, Typography } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import useMyAPI from 'components/hooks/useMyAPI';
import toArrayBuffer from 'helpers/toArrayBuffer';
import { OptionsObject } from 'notistack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CBOR = require('helpers/cbor.js');

type SecTokenProps = {
  enqueueSnackbar: (message: string, options: OptionsObject) => void;
  setShownControls: (value: string) => void;
  setWebAuthNResponse: (value) => void;
  snackBarOptions: OptionsObject;
  username: string;
};

export function SecurityTokenLogin({
  username,
  enqueueSnackbar,
  setShownControls,
  setWebAuthNResponse,
  snackBarOptions
}: SecTokenProps) {
  const { t } = useTranslation(['login']);
  const apiCall = useMyAPI();

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
              enqueueSnackbar(t('securitytoken.error'), snackBarOptions);
            });
        } else {
          setShownControls('otp');
          enqueueSnackbar(t('securitytoken.unavailable'), snackBarOptions);
        }
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <Box display="flex" flexDirection="column" textAlign="center">
      <Box>
        <LockOutlinedIcon style={{ fontSize: '108pt' }} color="action" />
      </Box>
      <Typography variant="h6" color="textSecondary">
        {t('securitytoken')}
      </Typography>
    </Box>
  );
}
