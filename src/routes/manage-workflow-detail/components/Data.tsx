import { useApiQuery } from 'core/api';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { Alert } from 'models/base/alert';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertsTable } from 'routes/search/components/alerts';
import Histogram from 'ui/Histogram';

type AlertHistogramProps = {
  id: string;
};

export const AlertHistogram: React.FC<AlertHistogramProps> = ({ id }) => {
  const { t } = useTranslation(['manageWorkflowDetail']);

  const { user: currentUser } = useALContext();

  const histogram = useApiQuery<Record<string, number>>({
    url: '/api/v4/search/histogram/alert/reporting_ts/',
    method: 'POST',
    body: {
      query: `events.entity_id:${id}`,
      mincount: 0,
      start: 'now-30d/d',
      end: 'now+1d/d-1s',
      gap: '+1d'
    },
    disabled: !id || !currentUser.roles.includes('alert_view')
  });

  return (
    <Histogram
      dataset={histogram.isFetching ? null : histogram.data}
      height="300px"
      isDate
      title={t('chart.title')}
      datatype={id}
    />
  );
};

type AlertResultsProps = {
  id: string;
};

export const AlertResults: React.FC<AlertResultsProps> = ({ id }) => {
  const { user: currentUser } = useALContext();

  const results = useApiQuery<SearchResult<Alert>>({
    url: `/api/v4/search/alert/?query=events.entity_id:${id}&rows=10`,
    disabled: !id || !currentUser.roles.includes('alert_view')
  });

  return <AlertsTable alertResults={results.isFetching ? null : results.data} allowSort={false} />;
};
