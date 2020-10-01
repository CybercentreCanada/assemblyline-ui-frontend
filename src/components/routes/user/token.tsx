import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import toArrayBuffer from 'helpers/toArrayBuffer';
import { OptionsObject } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CBOR = require('helpers/cbor.js');

type SecurityTokenProps = {
  user: any;
  toggleToken: (token: string) => void;
  enqueueSnackbar: (message: string, options: OptionsObject) => void;
  snackBarOptions: OptionsObject;
};

export default function SecurityToken({ user, toggleToken, enqueueSnackbar, snackBarOptions }: SecurityTokenProps) {
  const { t } = useTranslation(['user']);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tempToken, setTempToken] = useState('');
  const apiCall = useMyAPI();
  const regex = RegExp('^[a-zA-Z][a-zA-Z0-9_ ]*$');
  const theme = useTheme();
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);

  function handleTokenChange(event) {
    if (regex.test(event.target.value) || event.target.value === '') {
      setTempToken(event.target.value);
    } else {
      event.preventDefault();
    }
  }

  function handleDelete() {
    apiCall({
      url: `/api/v4/webauthn/remove/${selectedToken}/`,
      onSuccess: () => {
        toggleToken(selectedToken);
        setSelectedToken(null);
        enqueueSnackbar(t('token.removed'), snackBarOptions);
      }
    });
  }

  function handleNew() {
    apiCall({
      url: '/api/v4/webauthn/register/begin/',
      method: 'POST',
      onSuccess: api_data => {
        const arrayData = toArrayBuffer(api_data.api_response);
        const options = CBOR.decode(arrayData.buffer);
        const credentialHelper = navigator.credentials;
        if (credentialHelper !== undefined) {
          credentialHelper
            .create(options)
            .then((assertion: PublicKeyCredential) => {
              const response = assertion.response as AuthenticatorAttestationResponse;
              const attestationData = CBOR.encode({
                attestationObject: new Uint8Array(response.attestationObject),
                clientDataJSON: new Uint8Array(response.clientDataJSON)
              });
              apiCall({
                url: `/api/v4/webauthn/register/complete/${tempToken}/`,
                method: 'POST',
                body: Array.from(new Uint8Array(attestationData)),
                onSuccess: () => {
                  toggleToken(tempToken);
                  setTempToken('');
                  enqueueSnackbar(t('token.added'), snackBarOptions);
                }
              });
            })
            .catch(ex => {
              // eslint-disable-next-line no-console
              setTempToken('');
              enqueueSnackbar(`${ex.name}: ${ex.message}`, {
                ...snackBarOptions,
                variant: 'error',
                autoHideDuration: 5000
              });
            });
        }
      }
    });
  }

  function askForDelete(securityToken) {
    setSelectedToken(securityToken);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('token.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('token.desc')}
      </Typography>
      <div style={{ paddingTop: sp4, paddingBottom: sp4 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('token.list')}
        </Typography>
        {user.security_tokens.length !== 0 ? (
          user.security_tokens.map((e, i) => (
            <Chip key={i} label={e} onDelete={() => askForDelete(e)} style={{ marginRight: sp1, marginBottom: sp1 }} />
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('token.none')}
          </Typography>
        )}
      </div>

      <div style={{ width: '100%' }}>
        <TextField
          style={{ width: '100%' }}
          size="small"
          margin="normal"
          variant="outlined"
          label={t('token.temp_token')}
          onChange={handleTokenChange}
          value={tempToken}
        />
      </div>
      <div style={{ alignSelf: 'flex-end' }}>
        <Button disabled={tempToken === ''} onClick={() => handleNew()} color="primary" variant="contained">
          {t('token.add')}
        </Button>
      </div>

      <Dialog
        open={selectedToken !== null}
        onClose={() => setSelectedToken(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('token.remove_title')}: {selectedToken}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('token.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedToken(null)} color="primary" autoFocus>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('token.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
