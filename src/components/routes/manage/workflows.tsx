import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Workflows() {
  const { t } = useTranslation(['manageWorkflows']);

  return (
    <PageCenter>
      <Box textAlign="left">{t('Workflows')}</Box>
    </PageCenter>
  );
}
