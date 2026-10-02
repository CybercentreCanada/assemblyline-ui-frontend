import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { AppPageCenter } from 'core/template';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

type ForbiddenPageProps = {
  disabled?: boolean;
};

export const ForbiddenPage = memo(({ disabled = false }: ForbiddenPageProps) => {
  const { t } = useTranslation(['error403']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppPageCenter>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        {disabled ? <BedtimeOutlinedIcon fontSize="inherit" /> : <LockOutlinedIcon fontSize="inherit" />}
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography
          children={disabled ? t('disabled.title') : t('title')}
          variant={downSM ? 'h4' : 'h3'}
          gutterBottom
        />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography
          children={disabled ? t('disabled.description') : t('description')}
          variant={downSM ? 'body1' : 'h6'}
          gutterBottom
        />
      </div>
    </AppPageCenter>
  );
});

ForbiddenPage.displayName = 'ForbiddenPage';
