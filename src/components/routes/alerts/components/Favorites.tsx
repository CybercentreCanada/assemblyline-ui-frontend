import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import {
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { CustomUser } from 'components/hooks/useMyUser';
import type { AlertSearchParams } from 'components/routes/alerts';
import { useAlerts } from 'components/routes/alerts/contexts/AlertsContext';
import { useSearchParams } from 'components/routes/alerts/contexts/SearchParamsContext';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  },
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
  },
  editIconButton: {
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
    padding: 'inherit',
    height: '18.33px',
    width: '18.33px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
    }
  }
}));

export type Favorite = {
  classification: string;
  name: string;
  query: string;
  created_by: string;
};

type AddFavoriteProps = {
  favorite: Favorite;
  global: boolean;
  show: boolean;
  onSuccess?: (favorite: Favorite, global: boolean) => void;
};

const AddFavorite: React.FC<AddFavoriteProps> = React.memo(
  ({ favorite, global = false, show = true, onSuccess }: AddFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const { apiCall } = useMyAPI();
    const { c12nDef } = useALContext();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid || !(currentUser.roles.includes('self_manage') || currentUser.is_admin)) return;

      const data: Favorite = {
        query: favorite.query,
        name: favorite.name,
        classification: global && c12nDef.enforce ? favorite.classification : c12nDef.UNRESTRICTED,
        created_by: currentUser.username
      };

      apiCall({
        url: `/api/v4/user/favorites/${global ? '__global__' : currentUser.username}/alert/`,
        method: 'PUT',
        body: data,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) return;
          showSuccessMessage(global ? t('added.global') : t('added.personal'));
          onSuccess(data, global);
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setOpen(false);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [c12nDef.UNRESTRICTED, currentUser, favorite, global]);

    return (
      <>
        {show && (
          <Tooltip title={t('add.tooltip')}>
            <span>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)} disabled={!isValid}>
                {t('add.button')}
              </Button>
            </span>
          </Tooltip>
        )}
        <ConfirmationDialog
          open={open}
          waiting={waiting}
          handleClose={() => setOpen(false)}
          handleAccept={handleAccept}
          title={t('confirmation.header.add')}
          acceptText={t('confirmation.ok.add')}
          cancelText={t('cancel')}
          children={
            <>
              <Grid item component="span">
                {t('confirmation.content.add')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.add2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item style={{ width: '100%' }}>
                <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </>
          }
        />
      </>
    );
  }
);

type UpdateFavoriteProps = {
  favorite: Favorite;
  globalFavorites: Favorite[];
  userFavorites: Favorite[];
  global: boolean;
  show: boolean;
  onSuccess?: (nextFavorite: Favorite, prevFavorite: Favorite, global: boolean) => void;
};

const UpdateFavorite: React.FC<UpdateFavoriteProps> = React.memo(
  ({ favorite, globalFavorites, userFavorites, global = false, show = true, onSuccess }: UpdateFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const { apiCall } = useMyAPI();
    const { c12nDef } = useALContext();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid || !(currentUser.roles.includes('self_manage') || currentUser.is_admin)) return;

      const old = global
        ? globalFavorites.find(f => f.name === favorite.name)
        : userFavorites.find(f => f.name === favorite.name);

      const data: Favorite = {
        query: favorite.query,
        name: favorite.name,
        classification: global && c12nDef.enforce ? favorite.classification : c12nDef.UNRESTRICTED,
        created_by: currentUser.username
      };

      apiCall({
        url: `/api/v4/user/favorites/${global ? '__global__' : currentUser.username}/alert/`,
        method: 'PUT',
        body: data,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) return;
          showSuccessMessage(global ? t('added.global') : t('added.personal'));
          onSuccess(data, old, global);
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setOpen(false);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [c12nDef, currentUser, favorite, global, isValid, onSuccess, showErrorMessage, showSuccessMessage, t]);

    return (
      <>
        {show && (
          <Tooltip title={t('add.tooltip')}>
            <span>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)} disabled={!isValid}>
                {t('update.button')}
              </Button>
            </span>
          </Tooltip>
        )}
        <ConfirmationDialog
          open={open}
          waiting={waiting}
          handleClose={() => setOpen(false)}
          handleAccept={handleAccept}
          title={t('confirmation.header.add')}
          acceptText={t('confirmation.ok.add')}
          cancelText={t('cancel')}
          children={
            <>
              <Grid item component="span">
                {t('confirmation.content.update')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.update2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item style={{ width: '100%' }}>
                <Typography variant="subtitle2">{t('confirmation.from')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {global
                    ? globalFavorites.find(f => f.name === favorite.name)?.query
                    : userFavorites.find(f => f.name === favorite.name)?.query}
                </Paper>
              </Grid>

              <Grid item style={{ width: '100%' }}>
                <Typography variant="subtitle2">{t('confirmation.to')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </>
          }
        />
      </>
    );
  }
);

type DeleteFavoriteProps = {
  favorite: Favorite;
  global: boolean;
  show: boolean;
  onSuccess?: (favorite: Favorite, global: boolean) => void;
};

const DeleteFavorite: React.FC<DeleteFavoriteProps> = React.memo(
  ({ favorite, global = false, show = true, onSuccess }: DeleteFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid || !(currentUser.roles.includes('self_manage') || currentUser.is_admin)) return;

      apiCall({
        url: `/api/v4/user/favorites/${global ? '__global__' : currentUser.username}/alert/`,
        method: 'DELETE',
        body: favorite.name,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) return;
          showSuccessMessage(global ? t('deleted.global') : t('deleted.personal'));
          onSuccess(favorite, global);
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setOpen(false);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, favorite, global, isValid, onSuccess, showErrorMessage, showSuccessMessage, t]);

    return (
      <>
        {show && (
          <Tooltip title={t('add.tooltip')}>
            <span>
              <Button variant="outlined" color="primary" onClick={() => setOpen(true)} disabled={!isValid}>
                {t('delete.button')}
              </Button>
            </span>
          </Tooltip>
        )}
        <ConfirmationDialog
          open={open}
          waiting={waiting}
          handleClose={() => setOpen(false)}
          handleAccept={handleAccept}
          title={t('confirmation.header.delete')}
          cancelText={t('cancel')}
          acceptText={t('confirmation.ok.delete')}
          children={
            <>
              <Grid item component="span">
                {t('confirmation.content.delete')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.delete2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item style={{ width: '100%' }}>
                <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </>
          }
        />
      </>
    );
  }
);

const WrappedAlertFavorites = () => {
  const { t } = useTranslation('favorites');
  const classes = useStyles();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { userFavorites, globalFavorites, defaultFavorite, updateFavorite, deleteFavorite } = useAlerts();
  const { setSearchObject } = useSearchParams<AlertSearchParams>();

  const [currentFavorite, setCurrentFavorite] = useState<Favorite>(defaultFavorite);
  const [currentGlobal, setCurrentGlobal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const isAuthorized = useMemo<boolean>(
    () => currentUser.roles.includes('self_manage') || currentUser.is_admin,
    [currentUser]
  );

  const isExistingFavorite = useMemo<boolean>(
    () =>
      currentGlobal
        ? globalFavorites.some(f => f.name === currentFavorite.name)
        : userFavorites.some(f => f.name === currentFavorite.name),
    [currentFavorite.name, currentGlobal, globalFavorites, userFavorites]
  );

  const handleAddFavorites = useCallback(
    (favorite: Favorite, global: boolean) => {
      updateFavorite(favorite, global);
      setCurrentFavorite(defaultFavorite);
    },
    [defaultFavorite, updateFavorite]
  );

  const handleUpdateFavorites = useCallback(
    (nextFavorite: Favorite, prevFavorite: Favorite, global: boolean) => {
      setSearchObject(v => ({ ...v, fq: v.fq.map(f => (f !== prevFavorite.query ? f : nextFavorite.query)) }));
      updateFavorite(nextFavorite, global);
      setCurrentFavorite(defaultFavorite);
    },
    [defaultFavorite, setSearchObject, updateFavorite]
  );

  const handleDeleteFavorites = useCallback(
    (favorite: Favorite, global: boolean) => {
      setSearchObject(v => ({ ...v, fq: v.fq.filter(f => f !== favorite.query) }));
      deleteFavorite(favorite, global);
      setCurrentFavorite(defaultFavorite);
    },
    [defaultFavorite, deleteFavorite, setSearchObject]
  );

  const handleFavoriteClick = useCallback(
    (favorite: Favorite) => {
      setSearchObject(v => ({ ...v, fq: [...v.fq, favorite.query] }));
      setOpen(false);
    },
    [setSearchObject]
  );

  const handleEditClick = useCallback(
    (favorite: Favorite, global: boolean) => () => {
      setCurrentFavorite(f => ({ ...f, ...favorite }));
      setCurrentGlobal(global);
    },
    []
  );

  useEffect(() => {
    return () => setCurrentFavorite(defaultFavorite);
  }, [defaultFavorite, open]);

  return (
    <>
      <Tooltip title={t('favorites')}>
        <span>
          <IconButton
            size="large"
            onClick={() => {
              setOpen(true);
              setRender(true);
            }}
            style={{ marginRight: 0 }}
          >
            <StarIcon fontSize={isMDUp ? 'medium' : 'small'} />
          </IconButton>
        </span>
      </Tooltip>

      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        {render && (
          <>
            <div style={{ padding: theme.spacing(1) }}>
              <IconButton onClick={() => setOpen(false)} size="large">
                <CloseOutlinedIcon />
              </IconButton>
            </div>
            <div className={classes.drawerInner}>
              <div style={{ paddingBottom: theme.spacing(2) }}>
                <Typography variant="h4">{t('favorites')}</Typography>
              </div>
              {isAuthorized && (
                <>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      onClick={() => setCurrentGlobal(v => !v)}
                      size="small"
                      color="primary"
                      disableElevation
                      disableRipple
                    >
                      <div>{t('private')}</div>
                      <div style={{ flex: 1 }}>
                        <Switch
                          checked={currentGlobal}
                          onChange={event => setCurrentGlobal(event.target.checked)}
                          color="primary"
                        />
                      </div>
                      <div>{t('public')}</div>
                    </Button>
                  </div>
                  {currentGlobal && c12nDef.enforce ? (
                    <Classification
                      type="picker"
                      c12n={currentFavorite.classification}
                      setClassification={value => setCurrentFavorite(f => ({ ...f, classification: value }))}
                    />
                  ) : (
                    <div style={{ padding: theme.spacing(2.25) }} />
                  )}
                  <div style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(2) }}>
                    <div>
                      <Typography variant="subtitle2">{t('query')}</Typography>
                      <TextField
                        value={currentFavorite.query}
                        onChange={event => setCurrentFavorite(f => ({ ...f, query: event.target.value }))}
                        variant="outlined"
                        fullWidth
                      />
                    </div>
                    <div style={{ marginTop: theme.spacing(2) }}>
                      <Typography variant="subtitle2">{t('name')}</Typography>
                      <TextField
                        value={currentFavorite.name}
                        onChange={event => setCurrentFavorite(f => ({ ...f, name: event.target.value }))}
                        variant="outlined"
                        fullWidth
                      />
                    </div>
                  </div>

                  <Grid container gap={1} justifyContent="flex-end" paddingTop={2} paddingBottom={4}>
                    <DeleteFavorite
                      favorite={currentFavorite}
                      global={currentGlobal}
                      show={isExistingFavorite}
                      onSuccess={handleDeleteFavorites}
                    />

                    <UpdateFavorite
                      favorite={currentFavorite}
                      globalFavorites={globalFavorites}
                      userFavorites={userFavorites}
                      global={currentGlobal}
                      show={isExistingFavorite}
                      onSuccess={handleUpdateFavorites}
                    />

                    <AddFavorite
                      favorite={currentFavorite}
                      global={currentGlobal}
                      show={!isExistingFavorite}
                      onSuccess={handleAddFavorites}
                    />
                  </Grid>
                </>
              )}

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
                    onClick: () => handleFavoriteClick(f),
                    onDelete: isAuthorized ? handleEditClick(f, false) : null
                  }))}
                />
              </div>

              <Typography variant="h6">{t('globalfavorites')}</Typography>
              <Divider />
              <div style={{ marginTop: theme.spacing(1) }}>
                <ChipList
                  items={globalFavorites.map(f => ({
                    size: 'medium',
                    variant: 'outlined',
                    label: <span>{f.name}</span>,
                    tooltip: (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontStyle: 'normal' }}>{f.query}</div>
                        <div
                          style={{ placeSelf: 'flex-end', color: theme.palette.text.secondary }}
                        >{`(${f.created_by})`}</div>
                      </div>
                    ),
                    deleteIcon: (
                      <IconButton className={classes.editIconButton}>
                        <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
                      </IconButton>
                    ),
                    onClick: () => handleFavoriteClick(f),
                    onDelete: isAuthorized ? handleEditClick(f, true) : null
                  }))}
                />
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};

export const AlertFavorites = React.memo(WrappedAlertFavorites);
export default AlertFavorites;
