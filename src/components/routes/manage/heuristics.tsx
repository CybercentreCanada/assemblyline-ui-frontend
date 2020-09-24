import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Heuristics() {
  const { t } = useTranslation(['manageHeuristics']);

  return (
    <PageCenter>
      <Box textAlign="left">{t('Heuristics')}</Box>
    </PageCenter>
  );
}
