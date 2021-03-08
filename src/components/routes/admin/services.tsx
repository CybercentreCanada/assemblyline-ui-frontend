import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter margin={4} width="100%">
      <div>{t('Services')}</div>
    </PageCenter>
  ) : (
    <Redirect to="/forbidden" />
  );
}
