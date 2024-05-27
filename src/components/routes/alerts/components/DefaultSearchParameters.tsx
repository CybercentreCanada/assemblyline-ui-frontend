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
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useDefaultSearchParams } from '../contexts/DefaultSearchParamsContext';
import { buildSearchQuery } from '../utils/alertUtils';
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
  const location = useLocation();
  const { showSuccessMessage } = useMySnackbar();
  const { defaultQuery, onDefaultQueryChange, onDefaultQueryClear } = useDefaultSearchParams();

  const [open, setOpen] = useState<boolean>(false);

  const existingQuery = useMemo<SimpleSearchQuery>(
    () =>
      !open
        ? null
        : buildSearchQuery({
            search: defaultQuery,
            singles: ['tc', 'group_by', 'sort', 'tc_start'],
            multiples: ['fq']
          }),
    [defaultQuery, open]
  );

  // const existingQuery = useMemo<SimpleSearchQuery>(() => {
  //   if (!open) return null;
  //   return;
  //   const q = new SimpleSearchQuery(defaultQuery, DEFAULT_QUERY);
  //   q.delete('tc_start');
  //   return q;
  // }, [defaultQuery, open]);

  const currentQuery = useMemo<SimpleSearchQuery>(
    () =>
      !open
        ? null
        : buildSearchQuery({
            search: location.search,
            singles: ['tc', 'group_by', 'sort', 'tc_start'],
            multiples: ['fq'],
            defaultString: defaultQuery
          }),
    [defaultQuery, location.search, open]
  );

  // const currentQuery = useMemo<SimpleSearchQuery>(() => {
  //   if (!open) return null;
  //   const q = new SimpleSearchQuery(location.search, defaultQuery);
  //   q.delete('tc_start');
  //   return q;
  // }, [defaultQuery, location.search, open]);

  const hasExistingQuery = useMemo(() => (!open ? false : !localStorage.getItem(LOCAL_STORAGE)), [open]);

  const isSameQuery = useMemo<boolean>(() => !currentQuery || currentQuery.getDeltaString() === '', [currentQuery]);

  return (
    <>
      <Tooltip title={t('session.tooltip')}>
        <div>
          <IconButton size="large" onClick={() => setOpen(true)}>
            <ManageSearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog classes={{ paper: classes.dialogPaper }} open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('session.title')}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.dialogDescription}>{t('session.description')}</div>

          <Grid item style={{ width: '100%' }}>
            <Typography variant="subtitle2">{t('session.existing')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              className={classes.preview}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {!existingQuery ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected query={existingQuery} disableActions hideTCStart />
              )}
            </Paper>
          </Grid>

          <Grid item style={{ width: '100%' }}>
            <Typography variant="subtitle2">{t('session.current')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              className={classes.preview}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {!currentQuery ? (
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
            disabled={hasExistingQuery}
            children={t('session.clear')}
            onClick={() => {
              onDefaultQueryClear();
              showSuccessMessage(t('session.clear.success'));
              setOpen(false);
            }}
          />
          <div style={{ flex: 1 }} />
          <Button autoFocus color="secondary" children={t('session.cancel')} onClick={() => setOpen(false)} />
          <Button
            color="primary"
            disabled={!currentQuery || isSameQuery}
            children={t('session.save')}
            onClick={() => {
              onDefaultQueryChange(location.search);
              showSuccessMessage(t('session.save.success'));
              setOpen(false);
            }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AlertDefaultSearchParameters = React.memo(WrappedAlertDefaultSearchParameters);
export default AlertDefaultSearchParameters;
