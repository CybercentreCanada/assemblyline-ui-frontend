import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createAppRoute } from 'core/router';
import PageCenter from 'core/template/components/pages/PageCenter';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation(['error404']);
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <LinkOffIcon color="secondary" fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{t('title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('description')}</Typography>
      </div>
    </PageCenter>
  );
};

export default NotFoundPage;

export const NotFoundRoute = createAppRoute({
  component: <NotFoundPage />,

  path: '/not-found',
  search: s => ({
    values: s.object(null).source('transient').ephemeral().ignored().nullable()
  }),

  ancestor: null,
  shortname: () => ['app_route.not_found.shortname', { ns: 'error404' }],
  fullname: () => ['app_route.not_found.fullname', { ns: 'error404' }],
  shorticon: () => <LinkOffIcon />,
  fullicon: () => <LinkOffIcon />,

  disabled: () => false,
  forbidden: () => false
});
