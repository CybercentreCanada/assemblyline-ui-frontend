import { CircularProgress } from '@mui/material';
import { createAppRoute } from 'core/routes';
import type { AlertSearchParams } from 'pages/alerts/alerts.route';
import { ALERT_DEFAULT_PARAMS, ALERT_STORAGE_KEY } from 'pages/alerts/alerts.route';
import { SearchParser } from 'pages/alerts/utils/SearchParser';
import { memo, useMemo } from 'react';
import { Navigate } from 'react-router';

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
  else return <Navigate to={`/alerts?${search.toString()}`} replace />;
});

export const AlertRedirectRoute = createAppRoute({
  component: AlertRedirectPage,
  path: '/alerts-redirect'
});
