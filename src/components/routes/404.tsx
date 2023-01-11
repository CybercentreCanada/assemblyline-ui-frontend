import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation(['error404']);
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <LinkOffIcon color="secondary" fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{t('title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('description')}</Typography>
      </div>
    </PageCenter>
  );
};

export default NotFoundPage;
