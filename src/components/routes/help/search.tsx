import React from 'react';
import { useTranslation } from 'react-i18next';
import UnderConstruction from '../under_construction';

export default function Search() {
  const { t } = useTranslation(['helpSearch']);

  return <UnderConstruction page={t('title')} />;
}
