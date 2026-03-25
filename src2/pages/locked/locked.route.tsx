import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { Typography, useTheme } from '@mui/material';
import { useAppConfig } from 'core/config';
import { createAppRoute } from 'core/router/route/route.utils';
import { ForbiddenPage } from 'pages/forbidden/forbidden.route';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageCenter from 'ui/layouts/PageCenter';

//*****************************************************************************************
// Locked Page
//*****************************************************************************************
export type LockedPageProps = {};

export const LockedPage = React.memo(({}: LockedPageProps) => {
  const { t } = useTranslation(['locked']);
  const theme = useTheme();

  const tos = useAppConfig(s => s.configuration?.ui?.tos);
  const tos_lockout_notify = useAppConfig(s => s.configuration?.ui?.tos_lockout_notify);

  return (
    <>
      {tos ? (
        <PageCenter width="65%" margin={4}>
          <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
            <HourglassEmptyOutlinedIcon color="secondary" fontSize="inherit" />
          </div>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Typography variant="h3">{t('title')}</Typography>
          </div>
          {tos_lockout_notify ? (
            <div>
              <Typography variant="h6">{t('auto_notify')}</Typography>
            </div>
          ) : (
            <div>
              <Typography variant="h6">{t('contact_admin')}</Typography>
            </div>
          )}
        </PageCenter>
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
  path: '/locked'
});

export default LockedRoute;
