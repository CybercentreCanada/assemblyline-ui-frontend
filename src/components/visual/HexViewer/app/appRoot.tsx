import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import useAppContext from 'commons/components/hooks/useAppContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ACTIONS,
  DataProps,
  HexLayout,
  HexLoading,
  LAYOUT_SIZE,
  ModeLanguage,
  ModeTheme,
  ModeWidth,
  useStore
} from '..';

const useHexStyles = ({ y = 275.890625, height = 1000 }: { y: number; height: number }) =>
  makeStyles(theme => ({
    root: {
      position: 'relative',
      height: `calc(${height}px - ${y}px - 75px)`,
      width: '100%',
      display: 'grid',
      alignContent: 'center'
    },
    widescreen: {
      height: `calc(${height}px - ${LAYOUT_SIZE.mobileWindowHeight}px)`
    },
    viewportAuto: {
      height: 'auto'
    }
  }));

const WrappedAppRoot = ({ data = '' }: DataProps) => {
  const classes = useHexStyles({
    y: document.getElementById('hex-viewer')?.getBoundingClientRect()?.y,
    height: window.innerHeight
  })();
  const { store, dispatch, update } = useStore();

  // Data
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appLoad, payload: { data } });
    return () => dispatch({ type: ACTIONS.appSave, payload: null });
  }, [data, dispatch]);

  // Theme
  const { theme: appTheme } = useAppContext();
  React.useEffect(() => {
    update.store.mode.setTheme(appTheme as ModeTheme);
  }, [appTheme, update]);

  // Language
  const { i18n } = useTranslation(['hexViewer']);
  React.useEffect(() => {
    update.store.mode.setLanguage(i18n.language as ModeLanguage);
  }, [i18n.language, update]);

  // Width
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down('xs'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isLG = useMediaQuery(theme.breakpoints.down('lg'));
  const isXL = useMediaQuery(theme.breakpoints.down('xl'));

  React.useEffect(() => {
    const width: ModeWidth = isXS ? 'xs' : isSM ? 'sm' : isMD ? 'md' : isLG ? 'lg' : isXL ? 'xl' : 'wd';
    update.store.mode.setWidth(width);
  }, [isLG, isMD, isSM, isXL, isXS, update]);

  // History

  // Setting
  React.useEffect(() => {
    dispatch({ type: ACTIONS.settingFetch, payload: null });
  }, [dispatch]);
  React.useEffect(() => {
    if (store.loading.conditions.hasSettingsFetched) dispatch({ type: ACTIONS.settingLoad, payload: null });
  }, [dispatch, store.loading.conditions.hasSettingsFetched]);

  // Location
  React.useEffect(() => {
    if (store.loading.conditions.hasSettingsFetched && store.loading.conditions.hasSettingsLoaded)
      dispatch({ type: ACTIONS.locationLoad, payload: null });
  }, [dispatch, store.loading.conditions.hasSettingsFetched, store.loading.conditions.hasSettingsLoaded]);

  return (
    <div className={clsx(classes.root, window.innerHeight.valueOf() < 1000 && classes.widescreen)}>
      <HexLoading store={store} />
      {store.hex.codes.size !== 0 && store.loading.conditions.hasLocationInit && <HexLayout store={store} />}
    </div>
  );
};

export const AppRoot = React.memo(WrappedAppRoot);
export default AppRoot;
