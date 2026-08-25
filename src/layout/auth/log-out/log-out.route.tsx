import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import { invalidateApiQuery, useApiMutation } from 'core/api';
import { createAppRoute } from 'core/routes';
import { AppPageCardCentered, AppVerticalBanner } from 'core/template';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// Logout Page
//*****************************************************************************************

export const LogoutPage = memo(() => {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();

  const requested = useRef<boolean>(false);

  const { mutate: logout } = useApiMutation(() => ({
    url: '/api/v4/auth/logout/',
    method: 'GET',
    reloadOnUnauthorize: false,
    onExit: () => invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 100)
  }));

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    logout();
  }, [logout]);

  return (
    <AppPageCardCentered>
      <div style={{ textAlign: 'center' }}>
        <AppVerticalBanner />
        <div style={{ marginBottom: theme.spacing(3) }}>
          <Typography>{t('title')}</Typography>
        </div>
        <CircularProgress size={24} />
      </div>
    </AppPageCardCentered>
  );
});

LogoutPage.displayName = 'LogoutPage';

//*****************************************************************************************
// Logout Route
//*****************************************************************************************

export const LogoutRoute = createAppRoute({
  component: LogoutPage,

  path: '/logout',

  ancestor: null,
  shortname: () => ['app_route.log_out.shortname', { ns: 'logout' }],
  fullname: () => ['app_route.log_out.fullname', { ns: 'logout' }],
  shorticon: () => <LogoutOutlinedIcon />,
  fullicon: () => <LogoutOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
