import { Box } from '@material-ui/core';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import NotFoundPage from 'components/routes/404_dl';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Classification() {
  const { t } = useTranslation(['helpClassification']);
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.c12n_enforcing ? (
    <PageCenter>
      <Box textAlign="left">{t('Classification')}</Box>
    </PageCenter>
  ) : (
    <NotFoundPage />
  );
}
