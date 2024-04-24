import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import AlertFiltersSelected from './FiltersSelected';

const LOCAL_STORAGE = 'alert.search';

const useStyles = makeStyles(theme => ({
  preview: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    margin: 0,
    padding: theme.spacing(1.5),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
  },
  dialogPaper: {
    maxWidth: '1000px'
  },
  dialogContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
    '@media (max-width:850px)': {
      gridTemplateColumns: '1fr'
    }
  },
  dialogDescription: {
    gridColumn: 'span 2',
    '@media (max-width:850px)': {
      gridColumn: 'span 1'
    }
  }
}));

const WrappedAlertDefaultSearchParameters = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccessMessage } = useMySnackbar();

  const [currentQuery, setCurrentQuery] = useState<SimpleSearchQuery>(null);
  const [existingQuery, setExistingQuery] = useState<SimpleSearchQuery>(null);
  const [open, setOpen] = useState<boolean>(false);

  const isSameQuery = useMemo<boolean>(
    () =>
      (!currentQuery && !existingQuery) ||
      JSON.stringify(currentQuery.getDeltaString()) === JSON.stringify(existingQuery.getDeltaString()),
    [currentQuery, existingQuery]
  );

  useEffect(() => {
    if (location.search !== '') return;
    const value = localStorage.getItem(LOCAL_STORAGE);
    if (!value) return;
    const search = new SimpleSearchQuery(value, DEFAULT_QUERY);
    navigate(`${location.pathname}?${search.getDeltaString()}${location.hash}`);
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <>
      <Tooltip title={t('session.tooltip')}>
        <div>
          <IconButton
            size="large"
            onClick={() => {
              setCurrentQuery(() => {
                const q = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
                q.delete('tc_start');
                return q;
              });
              setExistingQuery(() => {
                const q = new SimpleSearchQuery(localStorage.getItem(LOCAL_STORAGE), DEFAULT_QUERY);
                q.delete('tc_start');
                return q;
              });
              setOpen(true);
            }}
          >
            <ManageSearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog
        classes={{ paper: classes.dialogPaper }}
        open={open}
        onClose={() => {
          setCurrentQuery(null);
          setExistingQuery(null);
          setOpen(false);
        }}
      >
        <DialogTitle>{t('session.title')}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.dialogDescription}>{t('session.description')}</div>

          <Grid item>
            <Typography variant="subtitle2">{t('session.existing')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              className={classes.preview}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {!existingQuery || existingQuery.toString() === '' ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected query={existingQuery} disableActions hideTCStart />
              )}
            </Paper>
          </Grid>

          <Grid item>
            <Typography variant="subtitle2">{t('session.current')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              className={classes.preview}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {!currentQuery || currentQuery.toString() === '' ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected query={currentQuery} disableActions hideTCStart />
              )}
            </Paper>
          </Grid>

          <div>{existingQuery ? t('session.clear.confirm') : t('session.clear.none')}</div>

          <div>
            {isSameQuery ? t('session.save.same') : currentQuery ? t('session.save.confirm') : t('session.save.none')}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={!existingQuery}
            children={t('session.clear')}
            onClick={() => {
              navigate(`${location.pathname}${location.hash}`);
              showSuccessMessage(t('session.clear.success'));
              setOpen(false);
              localStorage.removeItem(LOCAL_STORAGE);
            }}
          />
          <div style={{ flex: 1 }} />
          <Button autoFocus color="secondary" children={t('session.cancel')} onClick={() => setOpen(false)} />
          <Button
            color="primary"
            disabled={!currentQuery || isSameQuery}
            children={t('session.save')}
            onClick={() => {
              setOpen(false);
              showSuccessMessage(t('session.save.success'));
              localStorage.setItem(LOCAL_STORAGE, currentQuery.toString(['tc_start']));
            }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AlertDefaultSearchParameters = React.memo(WrappedAlertDefaultSearchParameters);
export default AlertDefaultSearchParameters;
