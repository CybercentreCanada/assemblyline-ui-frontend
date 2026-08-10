import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { Skeleton, Typography, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Cell } from 'ui/Table/enhanced_table';
import EnhancedTable from 'ui/Table/enhanced_table';
import { PageFullWidth } from 'ui/pages/PageFullWidth';

type HeuristicStat = {
  heur_id: string;
  name: string;
  count: number;
  min: number;
  avg: number;
  max: number;
  classification?: string;
};

export const StatisticsHeuristicsPage = memo(() => {
  const { t } = useTranslation(['statisticsHeuristics']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [heuristicStats, setHeuristicStats] = useState<HeuristicStat[]>(null);

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/heuristics/stats/',
      onSuccess: api_data => {
        setHeuristicStats(api_data.api_response as HeuristicStat[]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {heuristicStats ? (
        <EnhancedTable
          cells={cells}
          rows={heuristicStats}
          linkPrefix="/manage/heuristic/detail/"
          linkField="heur_id"
          defaultOrderBy="heur_id"
        />
      ) : (
        <Skeleton height="10rem" />
      )}
    </PageFullWidth>
  );
});

export const StatisticsHeuristicsRoute = createAppRoute({
  component: StatisticsHeuristicsPage,

  path: '/manage/statistics/heuristics',

  ancestor: '/manage/heuristics',
  shortname: () => ({ i18nKey: 'title', ns: 'statisticsHeuristics' }),
  fullname: () => ({ i18nKey: 'title', ns: 'statisticsHeuristics' }),
  shorticon: () => <BarChartOutlinedIcon />,
  fullicon: () => <BarChartOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('heuristic_view')
});
