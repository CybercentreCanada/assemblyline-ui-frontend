import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { AppPageCenter } from 'core/template';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// Missing Node Page
//*****************************************************************************************

export const MissingNodePage = memo(() => {
  const { t } = useTranslation(['missingNode']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppPageCenter>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <AccountTreeOutlinedIcon fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography children={t('description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
      </div>
    </AppPageCenter>
  );
});

MissingNodePage.displayName = 'MissingNodePage';

//*****************************************************************************************
// Missing Node Route
//*****************************************************************************************

export const MissingNodeRoute = createAppRoute({
  component: MissingNodePage,

  path: '/missing-node',

  ancestor: null,
  shortname: () => ['app_route.missing_node.shortname', { ns: 'missingNode' }],
  fullname: () => ['app_route.missing_node.fullname', { ns: 'missingNode' }],
  shorticon: () => <LinkOffIcon />,
  fullicon: () => <LinkOffIcon />,

  disabled: () => false,
  forbidden: () => false
});
