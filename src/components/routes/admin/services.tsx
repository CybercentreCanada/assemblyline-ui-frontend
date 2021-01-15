import useUser from 'commons/components/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import UnderConstruction from '../under_construction';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? <UnderConstruction page={t('title')} /> : <Redirect to="/forbidden" />;
}
