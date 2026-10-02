// import NoAccountsOutlinedIcon from '@mui/icons-material/NoAccountsOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageCenter from 'commons/components/pages/PageCenter';
import { useTranslation } from 'react-i18next';

const QuotaExceeded = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <BlockOutlinedIcon
          style={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
          fontSize="inherit"
        />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{t('quota.title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('quota.description')}</Typography>
      </div>
    </PageCenter>
  );
};

export default QuotaExceeded;
