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

type SignatureStat = {
  id: string;
  type: string;
  source: string;
  name: string;
  count: number;
  min: number;
  avg: number;
  max: number;
  classification?: string;
};

export const StatisticsSignaturesPage = memo(() => {
  const { t } = useTranslation(['statisticsSignatures']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [signatureStats, setSignatureStats] = useState<SignatureStat[]>(null);

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/signature/stats/',
      onSuccess: api_data => {
        setSignatureStats(api_data.api_response as SignatureStat[]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cells: Cell[] = [
    { id: 'type', break: false, numeric: false, disablePadding: false, label: t('type') },
    { id: 'source', break: true, numeric: false, disablePadding: false, label: t('source') },
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
          linkPrefix="/manage/signature/detail/"
          linkField="id"
          defaultOrderBy="type"
        />
      ) : (
        <Skeleton height="10rem" />
      )}
    </PageFullWidth>
  );
});

export const StatisticsSignaturesRoute = createAppRoute({
  title: {
    ns: 'statisticsSignatures',
    key: 'title'
  },
  icon: {
    primary: <BarChartOutlinedIcon />
  },
  ancestor: '/manage/signatures',
  component: StatisticsSignaturesPage,
  path: '/manage/statistics/signatures',

  forbidden: s => !s.user.roles.includes('signature_view')
});
