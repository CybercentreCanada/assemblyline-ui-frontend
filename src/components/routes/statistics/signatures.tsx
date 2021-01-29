import { Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import EnhancedTable, { Cell } from 'components/visual/Table/enhanced_table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SignatureDetail from '../manage/signature_detail';

export default function StatisticsSignatures() {
  const { t } = useTranslation(['statisticsSignatures']);
  const apiCall = useMyAPI();
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const { setGlobalDrawer } = useDrawer();
  const [signatureStats, setSignatureStats] = useState(null);

  const handleSignatureChange = () => {};

  const handleRowClick = useCallback(row => {
    setGlobalDrawer(
      <SignatureDetail signature_id={row.id} onUpdated={handleSignatureChange} onDeleted={handleSignatureChange} />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/signature/stats/',
      onSuccess: api_data => {
        setSignatureStats(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cells: Cell[] = [
    { id: 'type', numeric: false, disablePadding: false, label: t('type') },
    { id: 'source', numeric: false, disablePadding: false, label: t('source') },
    { id: 'name', numeric: false, disablePadding: false, label: t('name') },
    { id: 'count', numeric: true, disablePadding: false, label: t('count') },
    { id: 'min', numeric: true, disablePadding: false, label: t('min') },
    { id: 'avg', numeric: true, disablePadding: false, label: t('avg') },
    { id: 'max', numeric: true, disablePadding: false, label: t('max') }
  ];

  if (c12nDef.enforce) {
    cells.push({ id: 'classification', numeric: false, disablePadding: false, label: t('classification') });
  }

  return (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      {signatureStats ? (
        <EnhancedTable dense cells={cells} rows={signatureStats} defaultOrderBy="type" onClick={handleRowClick} />
      ) : (
        <Skeleton />
      )}
    </PageFullWidth>
  );
}
