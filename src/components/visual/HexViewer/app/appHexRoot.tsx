import { useMediaQuery, useTheme } from '@material-ui/core';
import useAppContext from 'commons/components/hooks/useAppContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HexLayout } from '..';
import { useDispatch, useStore } from '../stores/useNewStore';

export type AppHexRootProps = {
  data?: string;
};

const WrappedAppHexRoot = ({ data = '' }: AppHexRootProps) => {
  const { theme: appTheme } = useAppContext();
  const { i18n } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down('xs'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isLG = useMediaQuery(theme.breakpoints.down('lg'));
  const isXL = useMediaQuery(theme.breakpoints.down('xl'));

  const { store } = useStore();
  const { onDataInit, dispatchRef } = useDispatch();

  React.useLayoutEffect(() => {
    onDataInit(data);
  }, [data, onDataInit]);

  console.log(store, dispatchRef);

  // const { onStoreInit } = useStore();
  // const { onModeThemeChange, onModeLanguageChange, onModeWidthChange } = useMode();
  // const { onHexInit } = useHex();
  // const { onHistoryLoad, onHistorySave } = useHistory();
  // const { onSettingLoad, onSettingSave } = useSetting();

  // const { store, dispatch } = useHexState();
  // const storeDispatch = useRef<HexStoreDispatch>(dispatch);

  // useEffect(() => {
  //   onStoreInit(storeDispatch.current);
  // }, [onStoreInit]);

  // useEffect(() => {
  //   onHexInit(data);
  // }, [data, onHexInit]);

  // useEffect(() => {
  //   onModeThemeChange(appTheme as ModeTheme);
  // }, [onModeThemeChange, appTheme]);

  // useEffect(() => {
  //   onModeLanguageChange(i18n.language as ModeLanguage);
  // }, [i18n.language, onModeLanguageChange]);

  // useEffect(() => {
  //   if (isXS) onModeWidthChange('xs');
  //   else if (isSM) onModeWidthChange('sm');
  //   else if (isMD) onModeWidthChange('md');
  //   else if (isLG) onModeWidthChange('lg');
  //   else if (isXL) onModeWidthChange('xl');
  //   else onModeWidthChange('wd');
  // }, [isLG, isMD, isSM, isXL, isXS, onModeWidthChange]);

  // useEffect(() => {
  //   onHistoryLoad();
  //   return () => onHistorySave();
  // }, [onHistoryLoad, onHistorySave]);

  // useEffect(() => {
  //   onSettingLoad();
  //   return () => onSettingSave();
  // }, [onSettingLoad, onSettingSave]);

  return <HexLayout store={store} />;
};

export const AppHexRoot = React.memo(WrappedAppHexRoot);
export default AppHexRoot;
