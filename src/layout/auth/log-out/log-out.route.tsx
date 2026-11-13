import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import { createAppRoute } from 'core/router';
import PageCardCentered from 'core/template/branding/AppPageCardCentered';
import { useAppLayout } from 'core/template/components/app/hooks';
import useAppBannerVert from 'core/template/components/app/hooks/useAppBannerVert';
import { useEffectOnce } from 'core/template/components/utils/hooks/useEffectOnce';
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
          window.location.replace('/');
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

export const LogoutRoute = createAppRoute({
  component: <Logout />,

  path: '/logout',

  ancestor: null,
  shortname: () => ['app_route.log_out.shortname', { ns: 'logout' }],
  fullname: () => ['app_route.log_out.fullname', { ns: 'logout' }],
  shorticon: () => <LogoutOutlinedIcon />,
  fullicon: () => <LogoutOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
