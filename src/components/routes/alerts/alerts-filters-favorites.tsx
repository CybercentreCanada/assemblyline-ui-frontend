import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import CloseIcon from '@material-ui/icons/ExitToApp';
import SaveIcon from '@material-ui/icons/Save';
import WarningIcon from '@material-ui/icons/Warning';
import { ChipList } from 'components/elements/mui/chips';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFavorites, { Favorite } from './hooks/useFavorites';

interface AlertsFiltersFavoritesProps {
  initValue?: string;
  onSaved: (favorite: { name: string; query: string }) => void;
  onCancel: () => void;
  onSelected: (favorite: Favorite) => void;
  onDeleted: (favorite: Favorite) => void;
}

const AlertsFiltersFavorites: React.FC<AlertsFiltersFavoritesProps> = ({
  initValue,
  onSaved,
  onCancel,
  onSelected,
  onDeleted
}) => {
  const theme = useTheme();
  const { t } = useTranslation('favorites');
  const {
    userFavorites,
    globalFavorites,
    onAddUserFavorite,
    onDeleteUserFavorite,
    onAddGlobalFavorite,
    onDeleteGlobalFavorite
  } = useFavorites();
  const { showErrorMessage } = useMySnackbar();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [queryValue, setQueryValue] = useState<{ valid: boolean; value: string }>({ valid: true, value: initValue });
  const [nameValue, setNameValue] = useState<{ valid: boolean; value: string }>({ valid: true, value: '' });
  const [publicSwitch, setPublicSwitch] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<{ open: boolean; favorite: Favorite; isPublic: boolean }>({
    open: false,
    favorite: null,
    isPublic: false
  });

  const validateForm = (
    _queryValue: { valid: boolean; value: string },
    _nameValue: { valid: boolean; value: string }
  ) => {
    setFormValid(!!_queryValue.value && !!_nameValue.value);
  };

  const _onDelete = (favorite: Favorite, isPublic: boolean) => {
    if (isPublic) {
      onDeleteGlobalFavorite(favorite, () => {
        onDeleted(favorite);
      });
    } else {
      onDeleteUserFavorite(favorite, () => {
        onDeleted(favorite);
      });
    }
  };

  const _onSave = () => {
    if (queryValue.value && nameValue.value) {
      const favorite = { query: queryValue.value, name: nameValue.value };
      if (publicSwitch) {
        onAddGlobalFavorite(favorite, () => {
          onSaved(favorite);
        });
      } else {
        onAddUserFavorite(favorite, () => {
          onSaved(favorite);
        });
      }
    } else {
      showErrorMessage(t('favorites.form.field.required'));
    }
  };

  const _onDeleteClick = (favorite: Favorite, isPublic: boolean) => {
    setConfirmation({ open: true, favorite, isPublic });
  };

  const _onConfirmOkClick = () => {
    const { favorite, isPublic } = confirmation;
    _onDelete(favorite, isPublic);
    setConfirmation({ open: false, favorite: null, isPublic: false });
  };

  const _onConfirmCancelClick = () => {
    setConfirmation({ open: false, favorite: null, isPublic: false });
  };

  const _onSelect = (favorite: Favorite) => {
    onSelected(favorite);
  };

  const _onCancel = () => {
    onCancel();
  };

  const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    const _queryValue = { valid: !!value, value };
    setQueryValue(_queryValue);
    validateForm(_queryValue, nameValue);
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    const _nameValue = { valid: !!value, value };
    setNameValue({ valid: !!value, value });
    validateForm(queryValue, _nameValue);
  };

  const onSwitchChange = (isPublic: boolean) => {
    setPublicSwitch(isPublic);
  };

  const onClearBtnClick = () => {
    setFormValid(false);
    setQueryValue({ valid: false, value: '' });
    setNameValue({ valid: false, value: '' });
  };

  return (
    <div>
      <Typography variant="h6">{t('favorites.addfavorites')}</Typography>
      <Divider />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          margin: theme.spacing(1)
        }}
      >
        <div style={{ flex: 1 }} />
        <Button
          onClick={() => onSwitchChange(!publicSwitch)}
          size="small"
          color="primary"
          disableElevation
          disableRipple
        >
          <div>{t('favorites.private')}</div>
          <div style={{ flex: 1 }}>
            <Switch checked={publicSwitch} onChange={event => onSwitchChange(event.target.checked)} color="primary" />
          </div>
          <div>{t('favorites.public')}</div>
        </Button>
      </div>
      <div style={{ margin: theme.spacing(1) }}>
        <div>
          <TextField
            error={!queryValue.valid}
            label={t('favorites.query')}
            variant="outlined"
            value={queryValue.value}
            onChange={onQueryChange}
            onBlur={() => setQueryValue({ ...queryValue, valid: !!queryValue.value })}
            fullWidth
          />
        </div>
        <div style={{ marginTop: theme.spacing(2) }}>
          <TextField
            error={!nameValue.valid}
            label={t('favorites.name')}
            variant="outlined"
            value={nameValue.value}
            onChange={onNameChange}
            onBlur={() => setNameValue({ ...nameValue, valid: !!nameValue.value })}
            fullWidth
          />
        </div>
      </div>
      <div style={{ marginTop: theme.spacing(2), display: 'flex', flexDirection: 'row' }}>
        <Button variant="contained" color="primary" onClick={_onSave} disabled={!formValid} startIcon={<SaveIcon />}>
          {t('favorites.save')}
        </Button>
        <div style={{ marginRight: theme.spacing(1) }} />
        <Button variant="contained" onClick={onClearBtnClick} startIcon={<ClearAllIcon />}>
          {t('favorites.clear')}
        </Button>

        <div style={{ flex: 1 }} />
        <Button variant="contained" onClick={_onCancel} size="small" startIcon={<CloseIcon />}>
          {t('favorites.cancel')}
        </Button>
      </div>
      <div style={{ marginBottom: theme.spacing(2) }} />
      <Typography variant="h6">{t('favorites.yourfavorites')}</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1) }}>
        <ChipList
          items={userFavorites.map(f => ({
            size: 'medium',
            variant: 'outlined',
            label: f.name,
            tooltip: f.query,
            onClick: () => _onSelect(f),
            onDelete: () => _onDeleteClick(f, false)
          }))}
        />
      </div>
      <Typography variant="h6">{t('favorites.globalfavorites')}</Typography>
      <Divider />
      <div style={{ margin: theme.spacing(1) }}>
        <ChipList
          items={globalFavorites.map(f => ({
            size: 'medium',
            variant: 'outlined',
            label: f.name,
            tooltip: f.query,
            onClick: () => _onSelect(f),
            onDelete: () => _onDeleteClick(f, true)
          }))}
        />
      </div>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={confirmation.open}
      >
        <DialogTitle>
          <div
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: theme.palette.warning.main }}
          >
            <WarningIcon fontSize="large" />{' '}
            <Typography style={{ marginLeft: theme.spacing(2) }} variant="h6">
              {t('favorites.confirmdiag.header')}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent dividers>
          <div>{t('favorites.confirmdiag.content')}</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={_onConfirmOkClick} variant="contained" color="primary" size="small">
            {t('favorites.ok')}
          </Button>
          <Button autoFocus onClick={_onConfirmCancelClick} variant="contained" size="small">
            {t('favorites.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AlertsFiltersFavorites;
