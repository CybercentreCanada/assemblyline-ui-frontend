import { CircularProgress, Typography, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import CardCentered from 'commons/components/layout/pages/CardCentered';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Optout() {
  const { t } = useTranslation(['optout']);
  const theme = useTheme();
  const apiCall = useMyAPI();
  const { getBanner, hideMenus } = useAppLayout();

  useEffect(() => {
    hideMenus();

    apiCall({
      body: false,
      method: 'PUT',
      url: '/api/v4/user/ui4/',
      onSuccess: () => {
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CardCentered>
      <div style={{ textAlign: 'center' }}>
        {getBanner(theme)}
        <div style={{ marginBottom: theme.spacing(3) }}>
          <Typography>{t('title')}</Typography>
        </div>
        <CircularProgress size={24} />
      </div>
    </CardCentered>
  );
}

export default Optout;
