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
  LanguageType,
  LAYOUT_SIZE,
  ThemeType,
  useStore,
  WidthType
} from '..';

const useHexStyles = ({ y = 0, height = 1000 }: { y: number; height: number }) =>
  makeStyles(theme => ({
    root: {
      height: `calc(${height}px - ${y}px - 75px)`,
      width: '100%',
      display: 'grid',
      alignContent: 'center'
    },
    mobile: {
      height: `calc(${height}px - ${LAYOUT_SIZE.mobileWindowHeight}px)`
    }
  }));

const WrappedAppRoot = ({ data = '' }: DataProps) => {
  const classes = useHexStyles({
    y: document.getElementById('hex-viewer')?.getBoundingClientRect()?.y,
    height: window.innerHeight
  })();
  const { store, dispatch } = useStore();

  // Data
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appLoad, payload: { data } });
    return () => dispatch({ type: ACTIONS.appSave, payload: null });
  }, [data, dispatch]);

  // Theme
  const { theme: appTheme } = useAppContext();
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appThemeTypeChange, payload: { themeType: appTheme as ThemeType } });
  }, [appTheme, dispatch]);

  // Language
  const { i18n } = useTranslation(['hexViewer']);
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appLanguageTypeChange, payload: { languageType: i18n.language as LanguageType } });
  }, [dispatch, i18n.language]);

  // Width
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down('xs'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isLG = useMediaQuery(theme.breakpoints.down('lg'));
  const isXL = useMediaQuery(theme.breakpoints.down('xl'));

  React.useEffect(() => {
    const widthType: WidthType = isXS ? 'xs' : isSM ? 'sm' : isMD ? 'md' : isLG ? 'lg' : isXL ? 'xl' : 'wd';
    dispatch({ type: ACTIONS.appWidthTypeChange, payload: { widthType } });
  }, [dispatch, isLG, isMD, isSM, isXL, isXS]);

  // History

  // Setting
  React.useEffect(() => dispatch({ type: ACTIONS.settingLoad, payload: null }), [dispatch]);

  // Location
  React.useEffect(() => {
    if (!store.location.loaded) dispatch({ type: ACTIONS.appLocationInit, payload: null });
  }, [dispatch, store.location.loaded]);

  return (
    <div className={clsx(classes.root, window.innerHeight.valueOf() < 1000 && classes.mobile)}>
      <HexLoading store={store} />
      {store.hex.codes.size !== 0 && store.location.loaded && <HexLayout store={store} />}
    </div>
  );
};

export const AppRoot = React.memo(WrappedAppRoot);
export default AppRoot;
