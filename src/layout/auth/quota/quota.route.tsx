import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// Quota Page
//*****************************************************************************************
export const QuotaPage = memo(() => {
  const { t } = useTranslation(['quota']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <SpeedOutlinedIcon fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography children={t('description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
      </div>
    </PageCenter>
  );
});

QuotaPage.displayName = 'QuotaPage';

//*****************************************************************************************
// Quota Route
//*****************************************************************************************

export const QuotaRoute = createAppRoute({
  component: QuotaPage,
  path: '/quota'
});
