import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import PageCenter from 'core/template/components/pages/PageCenter';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const MissingNodePage = memo(() => {
  const { t } = useTranslation(['missingNode']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageCenter>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        <AccountTreeOutlinedIcon fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography children={t('title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography children={t('description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
      </div>
    </PageCenter>
  );
});

MissingNodePage.displayName = 'MissingNodePage';
