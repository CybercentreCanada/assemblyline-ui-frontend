import { CircularProgress } from '@mui/material';
import type { AlertSearchParams } from 'components/routes/alerts';
import { ALERT_DEFAULT_PARAMS, ALERT_STORAGE_KEY } from 'components/routes/alerts';
import React, { useMemo } from 'react';
import { Navigate } from 'react-router';
import { SearchParser } from './utils/SearchParser';

export const WrappedAlertsRedirect: React.FC = () => {
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
};

export const AlertsRedirect = React.memo(WrappedAlertsRedirect);
export default AlertsRedirect;
