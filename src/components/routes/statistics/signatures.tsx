import { Skeleton, Typography, useTheme } from '@mui/material';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import EnhancedTable, { Cell } from 'components/visual/Table/enhanced_table';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SignatureDetail from '../manage/signature_detail';

// TODO: what is this and is this used?
export default function StatisticsSignatures() {
  const { t } = useTranslation(['statisticsSignatures']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const [signatureStats, setSignatureStats] = useState(null);

  const handleSignatureDelete = () => {
    closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSignatures')), 1000);
  };

  const handleRowClick = useCallback(row => {
    setGlobalDrawer(<SignatureDetail signature_id={row.id} onUpdated={() => {}} onDeleted={handleSignatureDelete} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffectOnce(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/signature/stats/',
      onSuccess: api_data => {
        setSignatureStats(api_data.api_response);
      }
    });
  });

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
          linkPrefix="/manage/signature/"
          linkField="id"
          defaultOrderBy="type"
          onClick={handleRowClick}
        />
      ) : (
        <Skeleton height="10rem" />
      )}
    </PageFullWidth>
  );
}
