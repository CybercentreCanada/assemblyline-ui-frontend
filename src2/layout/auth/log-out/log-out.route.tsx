import { CircularProgress, Typography, useTheme } from '@mui/material';
import { invalidateAPIQuery, useAPIQuery } from 'core/api';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppVerticalBanner } from 'ui/branding';
import { PageCardCentered } from 'ui/pages';

//*****************************************************************************************
// Logout Page
//*****************************************************************************************
export type LogoutPageProps = {};

export const LogoutPage = React.memo(({}: LogoutPageProps) => {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();

  useAPIQuery({
    url: '/api/v4/auth/logout/',
    method: 'GET',
    onExit: () => {
      invalidateAPIQuery(({ url }) => '/api/v4/user/whoami/' === url, 0);
    }
  });

  return (
    <PageCardCentered>
      <div style={{ textAlign: 'center' }}>
        <AppVerticalBanner />
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
