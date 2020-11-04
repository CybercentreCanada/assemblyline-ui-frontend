import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Workflows() {
  const { t } = useTranslation(['manageWorkflows']);

  return (
    <PageCenter margin={4}>
      <div style={{ textAlign: 'left' }}>{t('Workflows')}</div>
    </PageCenter>
  );
}
