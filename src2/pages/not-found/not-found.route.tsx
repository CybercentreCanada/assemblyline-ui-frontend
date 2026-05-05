import { Typography, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************

export const NotFoundPage = memo(() => {
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
});

NotFoundPage.displayName = 'NotFoundPage';

//*****************************************************************************************
// NotFound Route
//*****************************************************************************************

export const NotFoundRoute = createAppRoute({
  component: NotFoundPage,
  path: '/not-found'
});
