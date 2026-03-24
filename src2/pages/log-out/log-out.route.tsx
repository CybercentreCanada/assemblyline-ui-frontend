import { CircularProgress, Typography, useTheme } from '@mui/material';
import { invalidateAPIQuery, useAPIQuery } from 'core/api';
import { AppVerticalBanner } from 'core/layout/layout.components';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageCardCentered } from 'ui/layouts/PageCardCentered';

//*****************************************************************************************
// Logout Page
//*****************************************************************************************
export type LogoutPageProps = {};

export const LogoutPage = React.memo(({}: LogoutPageProps) => {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();
  const navigate = useNavigate();

  useAPIQuery({
    url: '/api/v4/auth/logout/',
    method: 'GET',
    onExit: () => {
      navigate('/');
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
