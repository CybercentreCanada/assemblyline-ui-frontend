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
  Typography
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const LOCAL_STORAGE = 'alert.search';

const useStyles = makeStyles(theme => ({
  preview: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  dialogPaper: {
    maxWidth: '850px'
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
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccessMessage } = useMySnackbar();

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [existingQuery, setExistingQuery] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const parseSearchParams = useCallback((search: string) => {
    let entries = [];
    for (const entry of new URLSearchParams(search).entries()) {
      entries.push(entry);
    }
    entries.sort((a, b) => `${a[0]}${a[1]}`.localeCompare(`${b[0]}${b[1]}`));
    return entries;
  }, []);

  useEffect(() => {
    if (location.search === '' && localStorage.getItem(LOCAL_STORAGE)) {
      navigate(`${location.pathname}${localStorage.getItem(LOCAL_STORAGE)}${location.hash}`);
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <>
      <Tooltip title={t('session.tooltip')}>
        <div>
          <IconButton
            size="large"
            onClick={() => {
              setCurrentQuery(location.search);
              setExistingQuery(localStorage.getItem(LOCAL_STORAGE));
              setOpen(true);
            }}
          >
            <ManageSearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog classes={{ paper: classes.dialogPaper }} open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('session.title')}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.dialogDescription}>{t('session.description')}</div>

          <Grid item>
            <Typography variant="subtitle2">{t('session.existing')}</Typography>
            <Paper component="pre" variant="outlined" className={classes.preview}>
              {!existingQuery ? (
                <div>{t('none')}</div>
              ) : (
                parseSearchParams(existingQuery)?.map(([k, v], i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <b>{k}: </b>
                    {v ? <span>{v}</span> : <i>{t('session.none')}</i>}
                  </div>
                ))
              )}
            </Paper>
          </Grid>

          <Grid item>
            <Typography variant="subtitle2">{t('session.current')}</Typography>
            <Paper component="pre" variant="outlined" className={classes.preview}>
              {!currentQuery ? (
                <div>{t('none')}</div>
              ) : (
                parseSearchParams(currentQuery)?.map(([k, v], i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <b>{k}: </b>
                    {v ? <span>{v}</span> : <i>{t('session.none')}</i>}
                  </div>
                ))
              )}
            </Paper>
          </Grid>

          <div>{existingQuery ? t('session.clear.confirm') : t('session.clear.none')}</div>

          <div>
            {existingQuery === currentQuery
              ? t('session.save.same')
              : currentQuery
              ? t('session.save.confirm')
              : t('session.save.none')}
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
            disabled={!currentQuery || currentQuery === existingQuery}
            children={t('session.save')}
            onClick={() => {
              setOpen(false);
              showSuccessMessage(t('session.save.success'));
              localStorage.setItem(LOCAL_STORAGE, location.search);
            }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AlertDefaultSearchParameters = React.memo(WrappedAlertDefaultSearchParameters);
export default AlertDefaultSearchParameters;
