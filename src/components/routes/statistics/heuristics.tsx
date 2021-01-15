import React from 'react';
import { useTranslation } from 'react-i18next';
import UnderConstruction from '../under_construction';

export default function StatisticsHeuristics() {
  const { t } = useTranslation(['statisticsHeuristics']);

  return <UnderConstruction page={t('title')} />;
}
