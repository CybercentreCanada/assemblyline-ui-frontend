import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import { OptionsObject } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNull } from 'util';

type APIKeysProps = {
  user: any;
  toggleAPIKey: (apiKey: string) => void;
  enqueueSnackbar: (message: string, options: OptionsObject) => void;
  snackBarOptions: OptionsObject;
};

export default function APIKeys<APIKeysProps>({ user, toggleAPIKey, enqueueSnackbar, snackBarOptions }) {
  const { t } = useTranslation();
  const [selectedAPIKey, setSelectedAPIKey] = useState(null);
  const [tempAPIKey, setTempAPIKey] = useState(null);
  const [tempKeyName, setTempKeyName] = useState('');
  const [tempKeyPriv, setTempKeyPriv] = useState('READ');
  const apiCall = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const regex = RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');

  function handleDelete() {
    apiCall({
      url: `/api/v4/auth/apikey/${selectedAPIKey}/`,
      method: 'DELETE',
      onSuccess: () => {
        toggleAPIKey(selectedAPIKey);
        setSelectedAPIKey(null);
        enqueueSnackbar(t('page.user.apikeys.removed'), snackBarOptions);
      }
    });
  }

  function handleCreate() {
    apiCall({
      url: `/api/v4/auth/apikey/${tempKeyName}/${tempKeyPriv}/`,
      onSuccess: api_data => {
        setTempAPIKey(api_data.api_response.apikey);
        toggleAPIKey(tempKeyName);
      }
    });
  }

  function handleKeyNameChange(event) {
    if (regex.test(event.target.value) || event.target.value === '') {
      setTempKeyName(event.target.value);
    } else {
      event.preventDefault();
    }
  }

  function handleSelectChange(event) {
    setTempKeyPriv(event.target.value);
  }

  function handleNew() {
    setTempAPIKey(null);
    setTempKeyName('');
    setTempKeyPriv('READ');
  }

  function askForDelete(securityToken) {
    setSelectedAPIKey(securityToken);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('page.user.apikeys.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('page.user.apikeys.desc')}
      </Typography>
      <Box py={4}>
        <Typography variant="subtitle1" gutterBottom>
          {t('page.user.apikeys.list')}
        </Typography>
        {user.apikeys.length !== 0 ? (
          user.apikeys.map((e, i) => (
            <Box py={1}>
              <Chip key={i} label={e} onDelete={() => askForDelete(e)} />
            </Box>
          ))
        ) : (
          <Box py={2}>
            <Typography variant="subtitle2" color="secondary">
              {t('page.user.apikeys.none')}
            </Typography>
          </Box>
        )}
      </Box>

      <Box pt={4}>
        <TextField
          style={{ width: '100%' }}
          size="small"
          margin="normal"
          variant="outlined"
          label={t('page.user.apikeys.temp_token')}
          onChange={handleKeyNameChange}
          value={tempKeyName}
        />
      </Box>
      <Box display="flex" flexDirection="row" width="100%">
        <Box alignSelf="center" flexGrow={2}>
          <Select id="priv" value={tempKeyPriv} onChange={handleSelectChange} variant="outlined" margin="dense">
            <MenuItem value="READ">READ</MenuItem>
            <MenuItem value="READ_WRITE">READ/WRITE</MenuItem>
            <MenuItem value="WRITE">WRITE</MenuItem>
          </Select>
        </Box>
        <Box alignSelf="flex-end" pl={1}>
          <Button disabled={tempKeyName === ''} onClick={() => handleCreate()} color="primary" variant="contained">
            {t('page.user.apikeys.add')}
          </Button>
        </Box>
      </Box>

      <Dialog
        fullScreen={fullScreen}
        open={!isNull(tempAPIKey)}
        onClose={() => handleNew()}
        aria-labelledby="new-dialog-title"
        aria-describedby="new-dialog-description"
      >
        <DialogTitle id="new-dialog-title">{t('page.user.apikeys.new_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="new-dialog-description">
            <Box pt={2} pb={4}>
              <Card variant="outlined" style={{ backgroundColor: theme.palette.background.default }}>
                <Box p={2}>
                  <Typography style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{tempAPIKey}</Typography>
                </Box>
              </Card>
            </Box>
          </DialogContentText>
          <DialogContentText id="new-dialog-notice-title">
            <Typography variant="subtitle2" color="textPrimary">
              {t('page.user.apikeys.new_notice_title')}
            </Typography>
          </DialogContentText>
          <DialogContentText id="new-dialog-notice-texte">
            <Typography variant="body2">{t('page.user.apikeys.new_notice_text')}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleNew()} color="primary" autoFocus>
            {t('page.user.done')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={!isNull(selectedAPIKey)}
        onClose={() => setSelectedAPIKey(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('page.user.apikeys.remove_title')}: {selectedAPIKey}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('page.user.apikeys.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAPIKey(null)} color="primary" autoFocus>
            {t('page.user.cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('page.user.apikeys.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
