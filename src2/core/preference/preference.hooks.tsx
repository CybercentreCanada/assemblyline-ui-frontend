import { useTheme } from '@mui/material';
import {
  APP_DARK_BANNER,
  APP_DARK_BANNER_VERT,
  APP_DARK_LOGO,
  APP_LIGHT_BANNER,
  APP_LIGHT_BANNER_VERT,
  APP_LIGHT_LOGO
} from 'app/app.preferences';
import { useMemo } from 'react';

//*****************************************************************************************
// useAppLogo
//*****************************************************************************************
export const useAppLogo = () => {
  const theme = useTheme();

  return useMemo(() => (theme.palette.mode === 'dark' ? APP_DARK_LOGO : APP_LIGHT_LOGO), [theme.palette.mode]);
};

//*****************************************************************************************
// useAppBanner
//*****************************************************************************************
export const useAppBanner = () => {
  const theme = useTheme();

  return useMemo(() => (theme.palette.mode === 'dark' ? APP_DARK_BANNER : APP_LIGHT_BANNER), [theme.palette.mode]);
};

//*****************************************************************************************
// useAppBannerVert
//*****************************************************************************************
export const useAppBannerVert = () => {
  const theme = useTheme();

  return useMemo(
    () => (theme.palette.mode === 'dark' ? APP_DARK_BANNER_VERT : APP_LIGHT_BANNER_VERT),
    [theme.palette.mode]
  );
};
