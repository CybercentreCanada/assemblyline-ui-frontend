import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/layouts/PageCenter';

//*****************************************************************************************
// Quota Page
//*****************************************************************************************
type QuotaPageProps = {
  disabled?: boolean;
};

export const QuotaPage = React.memo(({ disabled = false }: QuotaPageProps) => {
  const { t } = useTranslation(['quota']);
  const theme = useTheme();

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <BlockOutlinedIcon
          style={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
          fontSize="inherit"
        />
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
// Quota Route
//*****************************************************************************************

export const QuotaRoute = createAppRoute({
  component: QuotaPage,
  path: '/quota'
});

export default QuotaRoute;
