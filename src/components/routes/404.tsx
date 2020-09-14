import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation(['error404']);
  return (
    <PageCenter width="65%">
      <Box pt={6} textAlign="center" fontSize={200}>
        <LinkOffIcon color="secondary" fontSize="inherit" />
      </Box>
      <Box pb={2}>
        <Typography variant="h3">{t('title')}</Typography>
      </Box>
      <Box>
        <Typography variant="h6">{t('description')}</Typography>
      </Box>
    </PageCenter>
  );
};

export default NotFoundPage;
