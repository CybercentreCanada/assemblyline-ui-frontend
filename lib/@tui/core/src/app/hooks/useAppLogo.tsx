import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useAppPreferences } from './useAppPreferences';

export const useAppLogo = (): string | undefined => {
  const { palette } = useTheme();
  const { brand } = useAppPreferences();
  return useMemo(
    () => (brand ? (palette.mode === 'dark' ? brand.logo.dark : brand.logo.light) : undefined),
    [brand, palette.mode]
  );
};
