import { useMediaQuery, useTheme } from '@material-ui/core';
import useAppContext from 'commons/components/hooks/useAppContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIONS, DataProps, HexLayout, HexLoading, LanguageType, ThemeType, useStore, WidthType } from '..';

const WrappedAppRoot = ({ data = '' }: DataProps) => {
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

  // Location
  React.useEffect(() => {
    if (!store.location.loaded) dispatch({ type: ACTIONS.appLocationInit, payload: null });
  }, [dispatch, store.location.loaded]);

  return (
    <>
      <HexLoading store={store} />
      {store.hex.codes.size !== 0 && store.location.loaded && <HexLayout store={store} />}
    </>
  );
};

export const AppRoot = React.memo(WrappedAppRoot);
export default AppRoot;
