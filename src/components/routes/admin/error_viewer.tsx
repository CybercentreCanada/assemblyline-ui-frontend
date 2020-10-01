import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ErrorViewer() {
  const { t } = useTranslation(['adminErrorViewer']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter>
      <div>{t('Error Viewer')}</div>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}
