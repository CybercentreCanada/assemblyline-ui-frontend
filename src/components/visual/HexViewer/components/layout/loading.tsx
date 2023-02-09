import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { LinearProgress, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreProps } from '../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'normal',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
  },
  container: {
    width: '100%',
    textAlign: 'center'
  },
  text: {
    padding: theme.spacing(2)
  },
  hidden: {
    visibility: 'hidden'
  },
  progressSpinner: {
    width: '50%',
    margin: 'auto'
  }
}));

export const WrappedHexLoading = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();

  return (
    <div
      className={clsx(classes.root)}
      style={{
        width: document.getElementById('hex-viewer')?.getBoundingClientRect()?.width,
        height: document.getElementById('hex-viewer')?.getBoundingClientRect()?.height
      }}
    >
      <div className={clsx(classes.container)}>
        {store.loading.status === 'loading' && (
          <>
            <Typography className={clsx(classes.text)} variant="subtitle1" color="secondary">
              {t(store.loading.message)}
            </Typography>
            <LinearProgress className={classes.progressSpinner} variant="determinate" value={store.loading.progress} />
          </>
        )}
        {store.loading.status === 'error' && (
          <>
            <Typography className={clsx(classes.text)} variant="subtitle1" color="error">
              {store.loading.errors.isDataInvalid && t('error.isInvalidData')}
              {store.loading.errors.isHeightTooSmall && t('error.isHeightTooSmall')}
              {store.loading.errors.isWidthTooSmall && t('error.isWidthTooSmall')}
            </Typography>
            <ErrorOutlineIcon color="error" fontSize="large" />
          </>
        )}
      </div>
    </div>
  );
};

export const HexLoading = React.memo(WrappedHexLoading);
