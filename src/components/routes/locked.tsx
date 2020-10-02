import { useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import ForbiddenPage from 'components/routes/403';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LockedPage = () => {
  const { t } = useTranslation(['locked']);
  const { configuration } = useAppContext();
  const theme = useTheme();

  return (
    <>
      {configuration.ui.tos ? (
        <PageCenter width="65%">
          <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
            <HourglassEmptyOutlinedIcon color="secondary" fontSize="inherit" />
          </div>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Typography variant="h3">{t('title')}</Typography>
          </div>
          {configuration.ui.tos_lockout_notify ? (
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
};

export default LockedPage;
