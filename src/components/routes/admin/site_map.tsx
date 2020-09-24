import { Box } from '@material-ui/core';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SiteMap() {
  const { t } = useTranslation(['adminSiteMap']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter>
      <Box>{t('Site Map')}</Box>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}
