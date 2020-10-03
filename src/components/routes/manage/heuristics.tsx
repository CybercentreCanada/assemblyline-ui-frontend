import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Heuristics() {
  const { t } = useTranslation(['manageHeuristics']);

  return (
    <PageCenter>
      <div style={{ textAlign: 'left' }}>{t('Heuristics')}</div>
    </PageCenter>
  );
}
