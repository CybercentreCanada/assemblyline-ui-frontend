import { CircularProgress, Typography, useTheme } from '@mui/material';
import useAppBannerVert from 'commons/components/app/hooks/useAppBannerVert';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import PageCardCentered from 'commons/components/pages/PageCardCentered';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import { useTranslation } from 'react-i18next';

function Logout() {
  const { t } = useTranslation(['logout']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { hideMenus } = useAppLayout();
  const banner = useAppBannerVert();

  useEffectOnce(() => {
    hideMenus();

    apiCall({
      url: '/api/v4/auth/logout/',
      onSuccess: () => {
        setTimeout(() => {
          window.location.replace(`${process.env.PUBLIC_URL}/`);
        }, 500);
      }
    });
  });

  return (
    <PageCardCentered>
      <div style={{ textAlign: 'center' }}>
        {banner}
        <div style={{ marginBottom: theme.spacing(3) }}>
          <Typography>{t('title')}</Typography>
        </div>
        <CircularProgress size={24} />
      </div>
    </PageCardCentered>
  );
}

export default Logout;
