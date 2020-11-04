import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);

  return (
    <PageCenter margin={4}>
      <div style={{ textAlign: 'left' }}>{t('Signature Sources')}</div>
    </PageCenter>
  );
}
