import { useTheme } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const AppVerticalBanner = memo(() => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  switch (theme.palette.mode) {
    case 'dark':
      return (
        <img
          alt={t('banner.alt')}
          src="/images/vertical_banner_dark.svg"
          style={{ display: 'inline-block', width: '100%' }}
        />
      );
    case 'light':
      return (
        <img
          alt={t('banner.alt')}
          src="/images/vertical_banner.svg"
          style={{ display: 'inline-block', width: '100%' }}
        />
      );
    default:
      return null;
  }
});

AppVerticalBanner.displayName = 'AppVerticalBanner';
