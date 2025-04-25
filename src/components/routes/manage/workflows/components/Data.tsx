import { useAppUser } from 'commons/components/app/hooks';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Alert } from 'components/models/base/alert';
import type { SearchResult } from 'components/models/ui/search';
import type { CustomUser } from 'components/models/ui/user';
import Histogram from 'components/visual/Histogram';
import AlertsTable from 'components/visual/SearchResult/alerts';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AlertHistogramProps = {
  id: string;
};

export const AlertHistogram: React.FC<AlertHistogramProps> = ({ id }) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [histogram, setHistogram] = useState<Record<string, number>>(null);

  const handleReload = useCallback(() => {
    if (!id || !currentUser.roles.includes('alert_view')) return;

    apiCall<Record<string, number>>({
      url: '/api/v4/search/histogram/alert/reporting_ts/',
      method: 'POST',
      body: {
        query: `events.entity_id:${id}`,
        mincount: 0,
        start: 'now-30d/d',
        end: 'now+1d/d-1s',
        gap: '+1d'
      },
      onSuccess: ({ api_response }) => setHistogram(api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, id]);

  useEffect(() => {
    handleReload();
  }, [handleReload]);

  return <Histogram dataset={histogram} height="300px" isDate title={t('chart.title')} datatype={id} />;
};

type AlertResultsProps = {
  id: string;
};

export const AlertResults: React.FC<AlertResultsProps> = ({ id }) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [results, setResults] = useState<SearchResult<Alert>>(null);

  const handleReload = useCallback(() => {
    if (!id || !currentUser.roles.includes('alert_view')) return;

    apiCall<SearchResult<Alert>>({
      method: 'GET',
      url: `/api/v4/search/alert/?query=events.entity_id:${id}&rows=10`,
      onSuccess: ({ api_response }) => setResults(api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, id]);

  useEffect(() => {
    handleReload();
  }, [handleReload]);

  return <AlertsTable alertResults={results} allowSort={false} />;
};
