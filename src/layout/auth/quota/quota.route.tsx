import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppSetInterfaceStore } from 'core/interface';
import { createAppRoute } from 'core/routes';
import { AppPageCenter } from 'core/template';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';

//*****************************************************************************************
// Quota Page
//*****************************************************************************************
export const QuotaPage = memo(() => {
  const { t } = useTranslation(['quota']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const setInterfaceStore = useAppSetInterfaceStore();

  const handleLogout = useCallback(() => {
    setInterfaceStore(s => {
      s.auth.mode = 'logout';
      return s;
    });
  }, [setInterfaceStore]);

  return (
    <AppPageCenter>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <SpeedOutlinedIcon fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography children={t('description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
      </div>
      <div style={{ paddingTop: theme.spacing(2) }}>
        <Button color="secondary" variant="contained" onClick={handleLogout}>
          {t('logout')}
        </Button>
      </div>
    </AppPageCenter>
  );
});

QuotaPage.displayName = 'QuotaPage';

//*****************************************************************************************
// Quota Route
//*****************************************************************************************

export const QuotaRoute = createAppRoute({
  component: QuotaPage,

  path: '/quota',

  ancestor: null,
  shortname: () => ({ i18nKey: 'quota', ns: 'app' }),
  fullname: () => ({ i18nKey: 'quota', ns: 'app' }),
  shorticon: () => <SpeedOutlinedIcon />,
  fullicon: () => <SpeedOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
