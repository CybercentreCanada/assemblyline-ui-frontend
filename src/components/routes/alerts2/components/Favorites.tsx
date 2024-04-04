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
import { CustomUser } from 'components/hooks/useMyUser';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

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
    wordBreak: 'break-word'
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
  ({ favorite, global, show = true, onSuccess }: AddFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { c12nDef } = useALContext();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid) return;

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
    }, [c12nDef.UNRESTRICTED, currentUser.username, favorite, global]);

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
          text={
            <Grid container flexDirection="column" spacing={theme.spacing(2)}>
              <Grid item component="span">
                {t('confirmation.content.add')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.add2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </Grid>
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
  onSuccess?: (favorite: Favorite, global: boolean) => void;
};

const UpdateFavorite: React.FC<UpdateFavoriteProps> = React.memo(
  ({ favorite, globalFavorites, userFavorites, global, show = true, onSuccess }: UpdateFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { c12nDef } = useALContext();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid) return;

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
    }, [c12nDef, currentUser.username, favorite, global, isValid, onSuccess, showErrorMessage, showSuccessMessage, t]);

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
          text={
            <Grid container flexDirection="column" spacing={theme.spacing(2)}>
              <Grid item component="span">
                {t('confirmation.content.update')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.update2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">{t('confirmation.from')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {global
                    ? globalFavorites.find(f => f.name === favorite.name)?.query
                    : userFavorites.find(f => f.name === favorite.name)?.query}
                </Paper>
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">{t('confirmation.to')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </Grid>
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
  ({ favorite, global, show = true, onSuccess }: DeleteFavoriteProps) => {
    const { t } = useTranslation('favorites');
    const classes = useStyles();
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showSuccessMessage, showErrorMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const isValid = useMemo(() => !!favorite.name && !!favorite.query, [favorite.name, favorite.query]);

    const handleAccept = useCallback(() => {
      if (!isValid) return;

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
    }, [currentUser.username, favorite, global, isValid, onSuccess, showErrorMessage, showSuccessMessage, t]);

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
          text={
            <Grid container flexDirection="column" spacing={theme.spacing(2)}>
              <Grid item component="span">
                {t('confirmation.content.delete')}
                <b style={{ wordBreak: 'break-all' }}>{favorite ? favorite.name : null}</b>
                {t('confirmation.content.delete2')}
                {global ? t('confirmation.content.public') : t('confirmation.content.private')}
              </Grid>

              <Grid item>
                <Typography variant="subtitle2">{t('confirmation.query')}</Typography>
                <Paper component="pre" variant="outlined" className={classes.preview}>
                  {favorite.query}
                </Paper>
              </Grid>

              <Grid item component="span" children={t('confirmation.confirm')} />
            </Grid>
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
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const defaultFavorite = useMemo<Favorite>(
    () => ({ classification: c12nDef.UNRESTRICTED, name: '', query: '', created_by: currentUser.username }),
    [c12nDef.UNRESTRICTED, currentUser.username]
  );

  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);
  const [globalFavorites, setGlobalFavorites] = useState<Favorite[]>([]);
  const [currentFavorite, setCurrentFavorite] = useState<Favorite>(defaultFavorite);
  const [currentGlobal, setCurrentGlobal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const isExistingFavorite = useMemo<boolean>(
    () =>
      global
        ? globalFavorites.some(f => f.name === currentFavorite.name)
        : userFavorites.some(f => f.name === currentFavorite.name),
    [currentFavorite.name, globalFavorites, userFavorites]
  );

  const handleUpdateFavorites = useCallback(
    (favorite: Favorite, global: boolean) => {
      const update = (values: Favorite[]) => {
        const index = values.findIndex(value => value.name === favorite.name);
        return index >= 0
          ? [...values.slice(0, index), favorite, ...values.slice(index + 1, values.length)]
          : [...values, favorite];
      };
      global ? setGlobalFavorites(update) : setUserFavorites(update);
      setCurrentFavorite(defaultFavorite);
    },
    [defaultFavorite]
  );

  const handleDeleteFavorites = useCallback(
    (favorite: Favorite, global: boolean) => {
      const toSpliced = (values: Favorite[]) => {
        const index = values.findIndex(value => value.name === favorite.name);
        if (index >= 0) values.splice(index, 1);
        return values;
      };
      global ? setGlobalFavorites(toSpliced) : setUserFavorites(toSpliced);
      setCurrentFavorite(defaultFavorite);
    },
    [defaultFavorite]
  );

  const handleFavoriteClick = useCallback(
    (favorite: Favorite) => {
      const query = new SimpleSearchQuery(location.search);
      query.add('fq', favorite.query);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);

      setOpen(false);
    },
    [location.hash, location.pathname, location.search, navigate]
  );

  const handleEditClick = useCallback(
    (favorite: Favorite, global: boolean) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setCurrentFavorite(f => ({ ...f, ...favorite }));
      setCurrentGlobal(global);
    },
    []
  );

  useEffect(() => {
    if (!render) return;

    apiCall({
      url: `/api/v4/user/favorites/${currentUser.username}/`,
      onSuccess: ({ api_response }) => setUserFavorites(api_response.alert)
    });

    apiCall({
      url: '/api/v4/user/favorites/__global__/',
      onSuccess: ({ api_response }) => setGlobalFavorites(api_response.alert)
    });
    return () => {
      setUserFavorites([]);
      setGlobalFavorites([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.username, render]);

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
                <Typography variant="h4">{t('title')}</Typography>
              </div>
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
              {global && c12nDef.enforce ? (
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
                  onSuccess={handleUpdateFavorites}
                />
              </Grid>

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
                    onDelete: handleEditClick(f, false)
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
                    tooltip: f.query,
                    deleteIcon: (
                      <IconButton className={classes.editIconButton}>
                        <EditIcon style={{ color: theme.palette.background.paper, fontSize: 'small' }} />
                      </IconButton>
                    ),
                    onClick: () => handleFavoriteClick(f),
                    onDelete: handleEditClick(f, true)
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
