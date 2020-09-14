import { Box, CircularProgress, Typography, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import CardCentered from 'commons/components/layout/pages/CardCentered';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Logout() {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();
  const apiCall = useMyAPI();
  const { getBanner, hideMenus } = useAppLayout();

  useEffect(() => {
    hideMenus();

    apiCall({
      url: '/api/v4/auth/logout/',
      onSuccess: () => {
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <CardCentered>
      <Box textAlign="center">
        {getBanner(theme)}
        <Box mb={3}>
          <Typography>{t('title')}</Typography>
        </Box>
        <CircularProgress size={24} />
      </Box>
    </CardCentered>
  );
}

export default Logout;
