import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppContext from 'commons_deprecated/components/hooks/useAppContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIONS, DataProps, HexLoading, HexPageLayout, ModeLanguage, ModeTheme, ModeWidth, useStore } from '..';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  }
}));

const WrappedAppRoot = ({ data = '' }: DataProps) => {
  const classes = useStyles();
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
  const isXS = useMediaQuery(theme.breakpoints.down('md'));
  const isSM = useMediaQuery(theme.breakpoints.down('lg'));
  const isMD = useMediaQuery(theme.breakpoints.down('xl'));
  const isLG = useMediaQuery(theme.breakpoints.down('xl'));
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
    <div className={classes.root}>
      <HexLoading store={store} />
      {store.hex.codes.size !== 0 && store.loading.conditions.hasLocationInit && <HexPageLayout store={store} />}
    </div>
  );
};

export const AppRoot = React.memo(WrappedAppRoot);
export default AppRoot;
