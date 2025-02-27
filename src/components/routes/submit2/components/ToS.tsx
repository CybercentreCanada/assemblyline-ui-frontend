import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <div style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
      <Typography variant="body2">
        {t('terms1')}
        <i>{t('file.button')}</i>
        {t('terms2')}
        <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
          {t('terms3')}
        </Link>
        .
      </Typography>
    </div>
  );
});
