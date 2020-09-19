import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);

  return (
    <PageCenter>
      <Box textAlign="left">{t('Signature Sources')}</Box>
    </PageCenter>
  );
}
