// import NoAccountsOutlinedIcon from '@mui/icons-material/NoAccountsOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createAppRoute } from 'core/router';
import PageCenter from 'core/template/components/pages/PageCenter';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const QuotaPage = memo(() => {
  const { t } = useTranslation();
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
        <Typography variant="h3">{t('quota.title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('quota.description')}</Typography>
      </div>
    </PageCenter>
  );
});

export const QuotaRoute = createAppRoute({
  component: QuotaPage,

  path: '/quota',

  ancestor: null,
  shortname: () => ['app_route.quota.shortname', { ns: 'quota' }],
  fullname: () => ['app_route.quota.fullname', { ns: 'quota' }],
  shorticon: () => <SpeedOutlinedIcon />,
  fullicon: () => <SpeedOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
