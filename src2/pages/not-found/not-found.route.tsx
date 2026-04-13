import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/layouts/PageCenter';

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************
type NotFoundPageProps = {};

export const NotFoundPage = React.memo(({}: NotFoundPageProps) => {
  const { t } = useTranslation(['error404']);
  const theme = useTheme();

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), paddingBottom: theme.spacing(6) }}>
        <Typography variant="h1">{t('title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('description')}</Typography>
      </div>
    </PageCenter>
  );

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
});

//*****************************************************************************************
// NotFound Route
//*****************************************************************************************

export const NotFoundRoute = createAppRoute({
  component: NotFoundPage,
  path: '/not-found'
});

export default NotFoundRoute;
