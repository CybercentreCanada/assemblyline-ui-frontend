import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Signatures() {
  const { t } = useTranslation(['manageSignatures']);

  return (
    <PageCenter>
      <Box textAlign="left">{t('Signatures')}</Box>
    </PageCenter>
  );
}
