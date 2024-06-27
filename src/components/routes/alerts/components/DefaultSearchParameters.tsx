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
import type { AlertSearchParams } from 'components/routes/alerts';
import { useDefaultParams } from 'components/routes/alerts/contexts/DefaultParamsContext';
import { useSearchParams } from 'components/routes/alerts/contexts/SearchParamsContext';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import AlertFiltersSelected from './FiltersSelected';

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

  const { searchParams, getSearchParams } = useSearchParams<AlertSearchParams>();
  const { defaultParams, hasStorageParams, getDefaultParams, onDefaultChange, onDefaultClear } =
    useDefaultParams<AlertSearchParams>();

  const [open, setOpen] = useState<boolean>(false);

  const isSameParams = useMemo<boolean>(
    () =>
      !open
        ? false
        : getDefaultParams({ strip: [['offset'], ['rows'], ['tc_start']] }).toString() ===
          getSearchParams({ strip: [['offset'], ['rows'], ['tc_start']] }).toString(),
    [getDefaultParams, getSearchParams, open]
  );

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
              {!defaultParams ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected query={defaultParams} hidden={['tc_start']} disableActions />
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
              {!searchParams ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected query={searchParams} hidden={['tc_start']} disableActions />
              )}
            </Paper>
          </Grid>

          <div>{hasStorageParams ? t('session.clear.confirm') : t('session.clear.none')}</div>

          <div>
            {isSameParams ? t('session.save.same') : searchParams ? t('session.save.confirm') : t('session.save.none')}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={!hasStorageParams}
            children={t('session.clear')}
            onClick={() => {
              onDefaultClear();
              showSuccessMessage(t('session.clear.success'));
              setOpen(false);
            }}
          />
          <div style={{ flex: 1 }} />
          <Button autoFocus color="secondary" children={t('session.cancel')} onClick={() => setOpen(false)} />
          <Button
            color="primary"
            disabled={!searchParams || isSameParams}
            children={t('session.save')}
            onClick={() => {
              onDefaultChange(location.search);
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
