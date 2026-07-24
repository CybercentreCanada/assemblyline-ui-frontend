import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// Missing Node Page
//*****************************************************************************************

export const MissingNodePage = memo(() => {
  const { t } = useTranslation(['missingNode']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <AccountTreeOutlinedIcon fontSize="inherit" />
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

MissingNodePage.displayName = 'MissingNodePage';

//*****************************************************************************************
// Missing Node Route
//*****************************************************************************************

export const MissingNodeRoute = createAppRoute({
  title: {
    ns: 'missingNode',
    key: 'title'
  },
  icon: {
    primary: <LinkOffIcon />
  },
  ancestor: null,
  component: MissingNodePage,
  path: '/missing-node'
});
