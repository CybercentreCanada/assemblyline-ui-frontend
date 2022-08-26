import { LinearProgress, makeStyles, Typography } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import clsx from 'clsx';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreProps } from '../..';

const useHexStyles = ({ y = 0, height = 1000 }: { y: number; height: number }) =>
  makeStyles(theme => ({
    root: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      display: 'grid',
      alignContent: 'center',
      whiteSpace: 'normal',
      overflow: 'hidden'
    },
    container: {
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
  const classes = useHexStyles({
    y: document.getElementById('hex-viewer')?.getBoundingClientRect()?.y,
    height: window.innerHeight
  })();

  return (
    <div className={clsx(classes.root)}>
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
