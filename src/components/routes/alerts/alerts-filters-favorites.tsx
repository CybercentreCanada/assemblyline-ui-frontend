import { Button, Divider, Switch, TextField, Typography, useTheme } from '@material-ui/core';
import useAppContext from 'components/hooks/useAppContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFavorites, { Favorite } from './hooks/useFavorites';

interface AlertsFiltersFavoritesProps {
  initValue?: string;
  onSaved: (favorite: { name: string; query: string }) => void;
  onSelected: (favorite: Favorite) => void;
  onDeleted: (favorite: Favorite) => void;
}

const AlertsFiltersFavorites: React.FC<AlertsFiltersFavoritesProps> = ({
  initValue,
  onSaved,
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
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { c12nDef, user: currentUser } = useAppContext();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [classification, setClassification] = useState<string>(c12nDef.UNRESTRICTED);
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
      const favorite: Favorite = {
        query: queryValue.value,
        name: nameValue.value,
        classification: publicSwitch ? classification : c12nDef.UNRESTRICTED,
        created_by: currentUser.username
      };

      if (publicSwitch) {
        onAddGlobalFavorite(favorite, () => {
          showSuccessMessage(t('added.global'));
          onSaved(favorite);
        });
      } else {
        onAddUserFavorite(favorite, () => {
          showSuccessMessage(t('added.personal'));
          onSaved(favorite);
        });
      }
    } else {
      showErrorMessage(t('form.field.required'));
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

  return (
    <div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('addfavorites')}</Typography>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button
          onClick={() => onSwitchChange(!publicSwitch)}
          size="small"
          color="primary"
          disableElevation
          disableRipple
        >
          <div>{t('private')}</div>
          <div style={{ flex: 1 }}>
            <Switch checked={publicSwitch} onChange={event => onSwitchChange(event.target.checked)} color="primary" />
          </div>
          <div>{t('public')}</div>
        </Button>
      </div>
      {publicSwitch ? (
        <Classification type="picker" c12n={classification} setClassification={setClassification} />
      ) : (
        <div style={{ padding: theme.spacing(2.25) }} />
      )}
      <div style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(2) }}>
        <div>
          <Typography variant="subtitle2">{t('query')}</Typography>
          <TextField
            error={!queryValue.valid}
            variant="outlined"
            value={queryValue.value}
            onChange={onQueryChange}
            onBlur={() => setQueryValue({ ...queryValue, valid: !!queryValue.value })}
            fullWidth
          />
        </div>
        <div style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="subtitle2">{t('name')}</Typography>
          <TextField
            error={!nameValue.valid}
            variant="outlined"
            value={nameValue.value}
            onChange={onNameChange}
            onBlur={() => setNameValue({ ...nameValue, valid: !!nameValue.value })}
            fullWidth
          />
        </div>
      </div>

      <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(4), textAlign: 'right' }}>
        <Button variant="contained" color="primary" onClick={_onSave} disabled={!formValid}>
          {t('save')}
        </Button>
      </div>

      {/* Your personnal favorites  */}
      <Typography variant="h6">{t('yourfavorites')}</Typography>
      <Divider />
      <div style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(4) }}>
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

      {/* The global favorites */}
      <Typography variant="h6">{t('globalfavorites')}</Typography>
      <Divider />
      <div style={{ marginTop: theme.spacing(1) }}>
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

      <ConfirmationDialog
        open={confirmation.open}
        handleClose={_onConfirmCancelClick}
        handleAccept={_onConfirmOkClick}
        title={t('confirmdiag.header')}
        cancelText={t('cancel')}
        acceptText={t('ok')}
        text={
          <>
            <span style={{ display: 'block', paddingBottom: theme.spacing(1) }}>{t('confirmdiag.content')}</span>
            <span style={{ display: 'block', fontWeight: 500 }}>
              {confirmation.favorite ? confirmation.favorite.name : null}
            </span>
          </>
        }
      />
    </div>
  );
};

export default AlertsFiltersFavorites;
