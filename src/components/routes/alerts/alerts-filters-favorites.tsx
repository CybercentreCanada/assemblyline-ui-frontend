import EditIcon from '@mui/icons-material/Edit';
import { Button, Divider, IconButton, Switch, TextField, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFavorites, { Favorite } from './hooks/useFavorites';

const useStyles = makeStyles(theme => ({
  label: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(1)
  },
  editIconButton: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
    padding: 'inherit',
    height: '18.33px',
    width: '18.33px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
    }
  }
}));

type Confirmation = { open: boolean; favorite: Favorite; isPublic: boolean };

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
  const classes = useStyles();
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
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [classification, setClassification] = useState<string>(c12nDef.UNRESTRICTED);
  const [queryValue, setQueryValue] = useState<{ valid: boolean; value: string }>({ valid: true, value: initValue });
  const [nameValue, setNameValue] = useState<{ valid: boolean; value: string }>({ valid: true, value: '' });
  const [publicSwitch, setPublicSwitch] = useState<boolean>(false);
  const [addConfirmation, setAddConfirmation] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Confirmation>({
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
        classification: publicSwitch && c12nDef.enforce ? classification : c12nDef.UNRESTRICTED,
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

  const handleDeleteClick = (favorite: Favorite, isPublic: boolean) => {
    setDeleteConfirmation({ open: true, favorite, isPublic });
  };

  const handleDeleteAccept = () => {
    const { favorite, isPublic } = deleteConfirmation;
    _onDelete(favorite, isPublic);
    setDeleteConfirmation({ open: false, favorite: null, isPublic: false });
  };

  const handleDeleteClose = () => {
    setDeleteConfirmation({ open: false, favorite: null, isPublic: false });
  };

  const handleAddClick = () => {
    setAddConfirmation(true);
  };

  const handleAddAccept = () => {
    _onSave();
    setAddConfirmation(false);
  };

  const handleAddClose = () => {
    setAddConfirmation(false);
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

  const handleEditClick = useCallback(
    (favorite: Favorite) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      setQueryValue({ valid: !!favorite.query, value: favorite.query });
      setNameValue({ valid: !!favorite.name, value: favorite.name });
      setClassification(favorite.classification);
      validateForm(
        { valid: !!favorite.query, value: favorite.query },
        { valid: !!favorite.name, value: favorite.name }
      );
    },
    []
  );

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
      {publicSwitch && c12nDef.enforce ? (
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
        <Button variant="contained" color="primary" onClick={handleAddClick} disabled={!formValid}>
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
            label: (
              <div className={classes.label}>
                <div>{f.name}</div>
                <IconButton className={classes.editIconButton} onClick={handleEditClick(f)}>
                  <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
                </IconButton>
              </div>
            ),
            tooltip: f.query,
            onClick: () => _onSelect(f),
            onDelete: () => handleDeleteClick(f, false)
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
            label: (
              <div className={classes.label}>
                <div>{f.name}</div>
                <IconButton className={classes.editIconButton} onClick={handleEditClick(f)}>
                  <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
                </IconButton>
              </div>
            ),
            tooltip: f.query,
            onClick: () => _onSelect(f),
            onDelete: () => handleDeleteClick(f, true)
          }))}
        />
      </div>

      <ConfirmationDialog
        open={addConfirmation}
        handleClose={handleAddClose}
        handleAccept={handleAddAccept}
        title={t('confirmation.add.header')}
        cancelText={t('cancel')}
        acceptText={t('confirmation.add.ok')}
        text={
          <>
            <span style={{ display: 'block', paddingBottom: theme.spacing(1) }}>{t('confirmation.add.content')}</span>
            <span style={{ display: 'block', fontWeight: 500 }}>{nameValue ? nameValue.value : null}</span>
          </>
        }
      />

      <ConfirmationDialog
        open={deleteConfirmation.open}
        handleClose={handleDeleteClose}
        handleAccept={handleDeleteAccept}
        title={t('confirmation.delete.header')}
        cancelText={t('cancel')}
        acceptText={t('confirmation.delete.ok')}
        text={
          <>
            <span style={{ display: 'block', paddingBottom: theme.spacing(1) }}>
              {t('confirmation.delete.content')}
            </span>
            <span style={{ display: 'block', fontWeight: 500 }}>
              {deleteConfirmation.favorite ? deleteConfirmation.favorite.name : null}
            </span>
          </>
        }
      />
    </div>
  );
};

export default AlertsFiltersFavorites;
