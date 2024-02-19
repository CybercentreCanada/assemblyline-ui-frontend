import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/models/ui/user';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFavorites, { Favorite } from './hooks/useFavorites';

const useStyles = makeStyles(theme => ({
  editIconButton: {
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
    padding: 'inherit',
    height: '18.33px',
    width: '18.33px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
    }
  },
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

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
  const [updateConfirmation, setUpdateConfirmation] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);

  const isExistingFavorite = useMemo<boolean>(
    () =>
      publicSwitch
        ? globalFavorites.some(f => f.name === nameValue.value)
        : userFavorites.some(f => f.name === nameValue.value),
    [globalFavorites, nameValue, publicSwitch, userFavorites]
  );

  const validateForm = (
    _queryValue: { valid: boolean; value: string },
    _nameValue: { valid: boolean; value: string }
  ) => {
    setFormValid(!!_queryValue.value && !!_nameValue.value);
  };

  const handleExit = useCallback(() => {
    setWaiting(false);
    setQueryValue({ valid: true, value: initValue });
    setNameValue({ valid: true, value: '' });
    setAddConfirmation(false);
    setUpdateConfirmation(false);
  }, [initValue]);

  const handleDeleteFavorite = () => {
    if (queryValue.value && nameValue.value) {
      const favorite: Favorite = {
        query: queryValue.value,
        name: nameValue.value,
        classification: publicSwitch && c12nDef.enforce ? classification : c12nDef.UNRESTRICTED,
        created_by: currentUser.username
      };

      if (publicSwitch) {
        onDeleteGlobalFavorite(
          favorite,
          () => onDeleted(favorite),
          () => setWaiting(true),
          () => {
            setWaiting(false);
            setDeleteConfirmation(false);
          }
        );
      } else {
        onDeleteUserFavorite(
          favorite,
          () => onDeleted(favorite),
          () => setWaiting(true),
          () => {
            setWaiting(false);
            setDeleteConfirmation(false);
          }
        );
      }
    } else {
      showErrorMessage(t('form.field.required'));
    }
  };

  const handleUpsertFavorite = () => {
    if (queryValue.value && nameValue.value) {
      const favorite: Favorite = {
        query: queryValue.value,
        name: nameValue.value,
        classification: publicSwitch && c12nDef.enforce ? classification : c12nDef.UNRESTRICTED,
        created_by: currentUser.username
      };

      if (publicSwitch) {
        onAddGlobalFavorite(
          favorite,
          () => {
            showSuccessMessage(t('added.global'));
            onSaved(favorite);
          },
          () => setWaiting(true),
          handleExit
        );
      } else {
        onAddUserFavorite(
          favorite,
          () => {
            showSuccessMessage(t('added.personal'));
            onSaved(favorite);
          },
          () => setWaiting(true),
          handleExit
        );
      }
    } else {
      showErrorMessage(t('form.field.required'));
    }
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
    (favorite: Favorite, isPublic: boolean) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      setQueryValue({ valid: !!favorite.query, value: favorite.query });
      setNameValue({ valid: !!favorite.name, value: favorite.name });
      setClassification(favorite.classification);
      setPublicSwitch(isPublic);
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

      <Grid container gap={1} justifyContent="flex-end" paddingTop={2} paddingBottom={4}>
        {isExistingFavorite && (
          <Tooltip title={t('delete.tooltip')}>
            <span>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setDeleteConfirmation(true)}
                disabled={!formValid}
              >
                {t('delete.button')}
              </Button>
            </span>
          </Tooltip>
        )}
        {isExistingFavorite && (
          <Tooltip title={t('update.tooltip')}>
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setUpdateConfirmation(true)}
                disabled={!formValid}
              >
                {t('update.button')}
              </Button>
            </span>
          </Tooltip>
        )}
        {!isExistingFavorite && (
          <Tooltip title={t('add.tooltip')}>
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAddConfirmation(true)}
                disabled={!formValid}
              >
                {t('add.button')}
              </Button>
            </span>
          </Tooltip>
        )}
      </Grid>

      {/* Your personnal favorites  */}
      <Typography variant="h6">{t('yourfavorites')}</Typography>
      <Divider />
      <div style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(4) }}>
        <ChipList
          items={userFavorites.map(f => ({
            size: 'medium',
            variant: 'outlined',
            label: <span>{f.name}</span>,
            tooltip: f.query,
            deleteIcon: (
              <IconButton className={classes.editIconButton}>
                <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
              </IconButton>
            ),
            onClick: () => _onSelect(f),
            onDelete: handleEditClick(f, false)
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
            label: <span>{f.name}</span>,
            tooltip: f.query,
            deleteIcon: (
              <IconButton className={classes.editIconButton}>
                <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
              </IconButton>
            ),
            onClick: () => _onSelect(f),
            onDelete: handleEditClick(f, true)
          }))}
        />
      </div>

      <ConfirmationDialog
        open={addConfirmation}
        waiting={waiting}
        handleClose={() => setAddConfirmation(false)}
        handleAccept={() => {
          handleUpsertFavorite();
          setAddConfirmation(false);
        }}
        title={t('confirmation.header.add')}
        cancelText={t('cancel')}
        acceptText={t('confirmation.ok.add')}
        text={
          <Grid container flexDirection="column" spacing={theme.spacing(2)}>
            <Grid item component="span">
              {t('confirmation.content.add')}
              <b>{nameValue ? nameValue.value : null}</b>
              {t('confirmation.content.add2')}
              {publicSwitch ? t('confirmation.content.public') : t('confirmation.content.private')}
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {queryValue.value}
              </Paper>
            </Grid>

            <Grid item component="span" children={t('confirmation.confirm')} />
          </Grid>
        }
      />

      <ConfirmationDialog
        open={updateConfirmation}
        waiting={waiting}
        handleClose={() => setUpdateConfirmation(false)}
        handleAccept={() => {
          handleUpsertFavorite();
          setUpdateConfirmation(false);
        }}
        title={t('confirmation.header.update')}
        cancelText={t('cancel')}
        acceptText={t('confirmation.ok.update')}
        text={
          <Grid container flexDirection="column" spacing={theme.spacing(2)}>
            <Grid item component="span">
              {t('confirmation.content.update')}
              <b>{nameValue ? nameValue.value : null}</b>
              {t('confirmation.content.update2')}
              {publicSwitch ? t('confirmation.content.public') : t('confirmation.content.private')}
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">{t('confirmation.from')}</Typography>
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {publicSwitch
                  ? globalFavorites.find(f => f.name === nameValue.value)?.query
                  : userFavorites.find(f => f.name === nameValue.value)?.query}
              </Paper>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">{t('confirmation.to')}</Typography>
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {queryValue.value}
              </Paper>
            </Grid>

            <Grid item component="span" children={t('confirmation.confirm')} />
          </Grid>
        }
      />

      <ConfirmationDialog
        open={deleteConfirmation}
        waiting={waiting}
        handleClose={() => setDeleteConfirmation(false)}
        handleAccept={() => {
          handleDeleteFavorite();
          setDeleteConfirmation(false);
        }}
        title={t('confirmation.header.delete')}
        cancelText={t('cancel')}
        acceptText={t('confirmation.ok.delete')}
        text={
          <Grid container flexDirection="column" spacing={theme.spacing(2)}>
            <Grid item component="span">
              {t('confirmation.content.delete')}
              <b>{nameValue ? nameValue.value : null}</b>
              {t('confirmation.content.delete2')}
              {publicSwitch ? t('confirmation.content.public') : t('confirmation.content.private')}
            </Grid>

            <Grid item>
              <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {queryValue.value}
              </Paper>
            </Grid>

            <Grid item component="span" children={t('confirmation.confirm')} />
          </Grid>
        }
      />
    </div>
  );
};

export default AlertsFiltersFavorites;
