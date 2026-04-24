import { useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const AppLogo = React.memo(() => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  switch (theme.palette.mode) {
    case 'dark':
      return (
        <img alt={t('logo.alt')} src="/images/noswoop_dark.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
      );
    case 'light':
      return (
        <img alt={t('logo.alt')} src="/images/noswoop.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
      );
    default:
      return null;
  }
});
