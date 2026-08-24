import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import { createAppRoute } from 'core/routes';
import { AppPageCenter } from 'core/template';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

//*****************************************************************************************
// Locked Page
//*****************************************************************************************

export const LockedPage = memo(() => {
  const { t } = useTranslation(['locked']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const tos = useAppConfigStore(s => s.configuration?.ui?.tos);
  const tosLockoutNotify = useAppConfigStore(s => s.configuration?.ui?.tos_lockout_notify);

  return (
    <>
      {tos ? (
        <AppPageCenter>
          <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
            <HourglassEmptyOutlinedIcon fontSize="inherit" />
          </div>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
          </div>
          <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
            <Typography
              children={tosLockoutNotify ? t('auto_notify') : t('contact_admin')}
              variant={downSM ? 'body1' : 'h6'}
              gutterBottom
            />
          </div>
        </AppPageCenter>
      ) : (
        <ForbiddenPage disabled />
      )}
    </>
  );
});

LockedPage.displayName = 'LockedPage';

//*****************************************************************************************
// Locked Route
//*****************************************************************************************

export const LockedRoute = createAppRoute({
  component: LockedPage,

  path: '/locked',

  ancestor: null,
  shortname: () => ['app_route.locked.shortname', { ns: 'locked' }],
  fullname: () => ['app_route.locked.fullname', { ns: 'locked' }],
  shorticon: () => <HourglassEmptyOutlinedIcon />,
  fullicon: () => <HourglassEmptyOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
