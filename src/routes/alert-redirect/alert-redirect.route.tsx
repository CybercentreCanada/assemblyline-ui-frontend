import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import { CircularProgress } from '@mui/material';
import { AppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import { memo, useMemo } from 'react';
import { ALERT_STORAGE_KEY, AlertsRoute } from 'routes/alerts/alerts.route';

export const AlertRedirectPage = memo(() => {
  const storageData = useMemo(() => new URLSearchParams(localStorage.getItem(ALERT_STORAGE_KEY) || ''), []);
  const search = useMemo(() => AlertsRoute.search.full(storageData), [storageData]);

  if (!search)
    return (
      <div
        style={{
          textAlign: 'center',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <CircularProgress variant="indeterminate" />
      </div>
    );
  else
    return (
      <AppNavigate nav={nav => nav.here({ replace: true }).update({ route: '/alerts', search: search.toObject() })} />
    );
});

export const AlertRedirectRoute = createAppRoute({
  component: AlertRedirectPage,

  path: '/alerts-redirect',

  ancestor: null,
  shortname: () => ['app_route.alert_redirect.shortname', { ns: 'alerts' }],
  fullname: () => ['app_route.alert_redirect.fullname', { ns: 'alerts' }],
  shorticon: () => <NotificationImportantOutlinedIcon />,
  fullicon: () => <NotificationImportantOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
