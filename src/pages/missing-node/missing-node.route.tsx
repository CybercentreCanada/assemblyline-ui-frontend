import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Typography, useTheme } from '@mui/material';
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

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <HelpOutlineOutlinedIcon
          style={{ color: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark }}
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

MissingNodePage.displayName = 'MissingNodePage';

//*****************************************************************************************
// Missing Node Route
//*****************************************************************************************

export const MissingNodeRoute = createAppRoute({
  component: MissingNodePage,
  route: '/missing-node'
});
