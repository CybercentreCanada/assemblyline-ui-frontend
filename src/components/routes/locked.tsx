import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import ForbiddenPage from 'components/routes/403';
import React from 'react';
import { useTranslation } from 'react-i18next';

type LockedPageProps = {
  autoNotify: boolean;
  hasTOS: boolean;
};

const LockedPage = (props: LockedPageProps) => {
  const { autoNotify, hasTOS } = props;
  const { t } = useTranslation();
  return (
    <>
      {hasTOS ? (
        <PageCenter width="65%">
          <Box pt={6} textAlign="center" fontSize={200}>
            <HourglassEmptyOutlinedIcon color="secondary" fontSize="inherit" />
          </Box>
          <Box pb={2}>
            <Typography variant="h3">{t('page.locked.title')}</Typography>
          </Box>
          {autoNotify ? (
            <Box>
              <Typography variant="h6">{t('page.locked.auto_notify')}</Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6">{t('page.locked.contact_admin')}</Typography>
            </Box>
          )}
        </PageCenter>
      ) : (
        <ForbiddenPage disabled />
      )}
    </>
  );
};

export default LockedPage;
