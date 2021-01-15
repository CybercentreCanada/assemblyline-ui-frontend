import React from 'react';
import { useTranslation } from 'react-i18next';
import UnderConstruction from '../under_construction';

export default function StatisticsSignatures() {
  const { t } = useTranslation(['statisticsSignatures']);

  return <UnderConstruction page={t('title')} />;
}
