import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

export default function Users() {
  const { t } = useTranslation(['adminUsers']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter>
      <div>{t('Users')}</div>
    </PageCenter>
  ) : (
    <Redirect to="/forbidden" />
  );
}
