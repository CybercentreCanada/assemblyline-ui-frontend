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
      // height: `calc(${height}px - ${y}px - 75px)`,
      height: `auto`,
      width: '100%',
      left: 0,
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

  if (store.loading.status === 'loading')
    return (
      <div className={clsx(classes.root)}>
        <div className={clsx(classes.container)}>
          <Typography className={clsx(classes.text)} variant="subtitle1" color="secondary">
            {t(store.loading.message)}
          </Typography>
          <LinearProgress className={classes.progressSpinner} variant="determinate" value={store.loading.progress} />
        </div>
      </div>
    );
  else if (store.loading.status === 'error')
    return (
      <div className={clsx(classes.root)}>
        <div className={clsx(classes.container)}>
          <Typography className={clsx(classes.text)} variant="subtitle1" color="error">
            {store.loading.errors.isDataInvalid && t('error.isInvalidData')}
          </Typography>
          <Typography className={clsx(classes.text)} variant="subtitle1" color="error">
            {store.loading.errors.isWindowTooSmall && t('error.isWindowTooSmall')}
          </Typography>
          <ErrorOutlineIcon color="error" fontSize="large" />
        </div>
      </div>
    );
  else return <></>;
};

export const HexLoading = React.memo(WrappedHexLoading);
