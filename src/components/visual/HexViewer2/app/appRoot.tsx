import { CircularProgress, useMediaQuery, useTheme } from '@material-ui/core';
import useAppContext from 'commons/components/hooks/useAppContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIONS, DataProps, HexLayout, useReducer, useStore, WidthType } from '..';

const WrappedAppRoot = ({ data = '' }: DataProps) => {
  const { refs } = useReducer();
  const { store, dispatch } = useStore();

  // Data
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appLoad, payload: { data } });
    return () => dispatch({ type: ACTIONS.appSave, payload: null });
  }, [data, dispatch]);

  // Theme
  const { theme: appTheme } = useAppContext();
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appThemeChange, payload: { theme: appTheme } });
  }, [appTheme, dispatch]);

  // Language
  const { i18n } = useTranslation(['hexViewer']);
  React.useEffect(() => {
    dispatch({ type: ACTIONS.appLanguageChange, payload: { language: i18n.language } });
  }, [dispatch, i18n.language]);

  // Width
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down('xs'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isLG = useMediaQuery(theme.breakpoints.down('lg'));
  const isXL = useMediaQuery(theme.breakpoints.down('xl'));

  React.useEffect(() => {
    const width: WidthType = isXS ? 'xs' : isSM ? 'sm' : isMD ? 'md' : isLG ? 'lg' : isXL ? 'xl' : 'wd';
    dispatch({ type: ACTIONS.appWidthChange, payload: { width } });
  }, [dispatch, isLG, isMD, isSM, isXL, isXS]);

  // // History
  // React.useEffect(() => {
  //   dispatch({ type: ACTIONS.appHistoryLoad, payload: null });
  //   return () => dispatch({ type: ACTIONS.appHistorySave, payload: null });
  // }, [dispatch]);

  // // Setting
  // React.useEffect(() => {
  //   dispatch({ type: ACTIONS.settingLoad, payload: null });
  //   return () => dispatch({ type: ACTIONS.settingSave, payload: null });
  // }, [dispatch]);

  // Location
  React.useEffect(() => {
    if (!store.location.loaded) dispatch({ type: ACTIONS.appLocationInit, payload: null });
  }, [dispatch, store.location.loaded]);

  return refs.current.hex.codes.size !== 0 && store.location.loaded ? (
    <HexLayout store={store} />
  ) : (
    <div style={{ textAlign: 'center' }}>
      <CircularProgress />
    </div>
  );
};

export const AppRoot = React.memo(WrappedAppRoot);
export default AppRoot;
