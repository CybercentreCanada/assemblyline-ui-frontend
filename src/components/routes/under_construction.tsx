import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import DeveloperModeOutlinedIcon from '@mui/icons-material/DeveloperModeOutlined';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { useTranslation } from 'react-i18next';

const UnderConstruction = ({ page }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <DeveloperModeOutlinedIcon color="secondary" fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{page}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('under_construction')}</Typography>
      </div>
    </PageCenter>
  );
};

export default UnderConstruction;
