import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import { CircularProgress } from '@mui/material';
import { AppNavigate, createAppRoute } from 'core/router';
import { memo, useMemo } from 'react';
import type { AlertSearchParams } from 'routes/alerts/alerts.route';
import { ALERT_DEFAULT_PARAMS, ALERT_STORAGE_KEY } from 'routes/alerts/alerts.route';
import { SearchParser } from 'routes/alerts/utils/SearchParser';

export const AlertRedirectPage = memo(() => {
  const parser = useMemo(() => new SearchParser<AlertSearchParams>(ALERT_DEFAULT_PARAMS, { enforced: ['rows'] }), []);
  const storageData = useMemo(() => new URLSearchParams(localStorage.getItem(ALERT_STORAGE_KEY) || ''), []);
  const search = useMemo(() => parser.deltaParams(storageData), [parser, storageData]);

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
  else return <AppNavigate nav={nav => nav.to().create({ route: '/alerts', search: search.toObject() })} />;
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
