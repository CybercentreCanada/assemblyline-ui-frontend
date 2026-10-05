import { useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import { useAPIQuery } from 'core/api/hooks/useApiQuery';
import type { Alert } from 'models/base/alert';
import type { SearchResult } from 'models/api/search';
import type { CustomUser } from 'models/api/user';
import Histogram from 'ui/Histogram';
import AlertsTable from 'routes/search/components/alerts';
import React from 'react';
import { useTranslation } from 'react-i18next';

type AlertHistogramProps = {
  id: string;
};

export const AlertHistogram: React.FC<AlertHistogramProps> = ({ id }) => {
  const { t } = useTranslation(['manageWorkflowDetail']);

  const { user: currentUser } = useAppUser<CustomUser>();

  const histogram = useAPIQuery<Record<string, number>>({
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
  const { user: currentUser } = useAppUser<CustomUser>();

  const results = useAPIQuery<SearchResult<Alert>>({
    url: `/api/v4/search/alert/?query=events.entity_id:${id}&rows=10`,
    disabled: !id || !currentUser.roles.includes('alert_view')
  });

  return <AlertsTable alertResults={results.isFetching ? null : results.data} allowSort={false} />;
};
