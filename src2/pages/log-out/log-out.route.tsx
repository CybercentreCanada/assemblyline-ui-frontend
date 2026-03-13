import { CircularProgress, Typography, useTheme } from '@mui/material';
import { useAPIQuery } from 'core/api';
import { useAppBannerVert } from 'core/preference/preference.hooks';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageCardCentered } from 'ui/layouts/PageCardCentered';

//*****************************************************************************************
// Logout Page
//*****************************************************************************************
export type LogoutPageProps = {};

export const LogoutPage = React.memo(({}: LogoutPageProps) => {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();
  const Banner = useAppBannerVert();

  // useEffectOnce(() => {
  //   hideMenus();

  //   apiCall({
  //     url: '/api/v4/auth/logout/',
  //     onSuccess: () => {
  //       setTimeout(() => {
  //         window.location.replace('/');
  //       }, 500);
  //     }
  //   });
  // });

  const logout = useAPIQuery({
    url: '/api/v4/auth/logout/',
    onSuccess: () => null
  });

  return (
    <PageCardCentered>
      <div style={{ textAlign: 'center' }}>
        <Banner />
        <div style={{ marginBottom: theme.spacing(3) }}>
          <Typography>{t('title')}</Typography>
        </div>
        <CircularProgress size={24} />
      </div>
    </PageCardCentered>
  );
});

LogoutPage.displayName = 'LogoutPage';

//*****************************************************************************************
// Logout Route
//*****************************************************************************************

export const LogoutRoute = createAppRoute({
  component: LogoutPage,
  path: '/logout'
});

export default LogoutRoute;
