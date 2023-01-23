import { CircularProgress, Typography, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useAppLayout from 'commons_deprecated/components/hooks/useAppLayout';
import CardCentered from 'commons_deprecated/components/layout/pages/CardCentered';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Logout() {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { hideMenus } = useAppLayout();
  const banner = useAppBanner();

  useEffect(() => {
    hideMenus();

    apiCall({
      url: '/api/v4/auth/logout/',
      onSuccess: () => {
        setTimeout(() => {
          window.location.replace(`${process.env.PUBLIC_URL}/`);
        }, 500);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <CardCentered>
      <div style={{ textAlign: 'center' }}>
        {banner}
        <div style={{ marginBottom: theme.spacing(3) }}>
          <Typography>{t('title')}</Typography>
        </div>
        <CircularProgress size={24} />
      </div>
    </CardCentered>
  );
}

export default Logout;
