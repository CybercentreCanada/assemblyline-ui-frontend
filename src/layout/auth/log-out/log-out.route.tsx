import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import { invalidateApiQuery, useApiQuery } from 'core/api';
import { createAppRoute } from 'core/routes';
import { AppPageCardCentered, AppVerticalBanner } from 'core/template';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// Logout Page
//*****************************************************************************************

export const LogoutPage = memo(() => {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();

  useApiQuery({
    url: '/api/v4/auth/logout/',
    method: 'GET',
    onExit: () => {
      sessionStorage.clear();
      invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 0);
    }
  });

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
  shortname: () => ({ i18nKey: 'logout', ns: 'app' }),
  fullname: () => ({ i18nKey: 'logout', ns: 'app' }),
  shorticon: () => <LogoutOutlinedIcon />,
  fullicon: () => <LogoutOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
