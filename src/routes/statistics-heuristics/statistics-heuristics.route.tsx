import { Skeleton, Typography, useTheme } from '@mui/material';
import PageFullWidth from 'deprecated/legacy/commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'deprecated/legacy/commons/components/utils/hooks/useEffectOnce';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import useDrawer from 'deprecated/legacy/components/hooks/useDrawer';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import HeuristicDetail from 'routes/manage-heuristic-detail/manage-heuristic-detail.route';
import type { Cell } from 'ui/Table/enhanced_table';
import EnhancedTable from 'ui/Table/enhanced_table';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StatisticsSignatures() {
  const { t } = useTranslation(['statisticsHeuristics']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { setGlobalDrawer } = useDrawer();
  const [signatureStats, setSignatureStats] = useState(null);

  const handleRowClick = useCallback(row => {
    setGlobalDrawer(<HeuristicDetail heur_id={row.heur_id} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffectOnce(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/heuristics/stats/',
      onSuccess: api_data => {
        setSignatureStats(api_data.api_response);
      }
    });
  });

  const cells: Cell[] = [
    { id: 'heur_id', break: false, numeric: false, disablePadding: false, label: t('heur_id') },
    { id: 'name', break: true, numeric: false, disablePadding: false, label: t('name') },
    { id: 'count', break: false, numeric: true, disablePadding: false, label: t('count') },
    { id: 'min', break: false, numeric: true, disablePadding: false, label: t('min') },
    { id: 'avg', break: false, numeric: true, disablePadding: false, label: t('avg') },
    { id: 'max', break: false, numeric: true, disablePadding: false, label: t('max') }
  ];

  if (c12nDef.enforce) {
    cells.push({
      id: 'classification',
      break: false,
      numeric: false,
      disablePadding: false,
      label: t('classification')
    });
  }

  return (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      {signatureStats ? (
        <EnhancedTable
          cells={cells}
          rows={signatureStats}
          linkPrefix="/manage/heuristic/"
          linkField="heur_id"
          defaultOrderBy="heur_id"
          onClick={handleRowClick}
        />
      ) : (
        <Skeleton height="10rem" />
      )}
    </PageFullWidth>
  );
}
