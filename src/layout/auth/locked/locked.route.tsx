import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useALContext from 'core/config/useALContext';
import PageCenter from 'core/template/components/pages/PageCenter';
import { useTranslation } from 'react-i18next';
import ForbiddenPage from 'routes/forbidden/forbidden';

const LockedPage = () => {
  const { t } = useTranslation(['locked']);
  const { configuration } = useALContext();
  const theme = useTheme();

  return (
    <>
      {configuration.ui.tos ? (
        <PageCenter width="65%" margin={4}>
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
