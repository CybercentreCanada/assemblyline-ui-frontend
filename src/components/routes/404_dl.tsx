import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation(['error404']);
  return (
    <PageCenter width="65%">
      <Box pt={10} pb={6}>
        <img alt={t('dl.alt')} src="/images/dead_link.png" style={{ maxHeight: '300px', maxWidth: '90%' }} />
      </Box>
      <Box>
        <Typography variant="h6">{t('dl.description')}</Typography>
      </Box>
    </PageCenter>
  );
};

export default NotFoundPage;
