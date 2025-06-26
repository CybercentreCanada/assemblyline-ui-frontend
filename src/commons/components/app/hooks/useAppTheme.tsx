import { type PaletteMode } from '@mui/material';
import { useMemo } from 'react';
import { useApp } from 'commons/components/app/hooks';

export type AppThemeType = {
  autoDetectColorScheme: boolean;
  theme: PaletteMode;
  isDark: boolean;
  isLight: boolean;
  toggle: () => void;
  toggleAutoDetectColorScheme: () => void;
};

export function useAppTheme(): AppThemeType {
  const { autoDetectColorScheme, toggleAutoDetectColorScheme, theme, toggleTheme } = useApp();
  return useMemo(
    () => ({
      autoDetectColorScheme,
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      toggle: toggleTheme,
      toggleAutoDetectColorScheme
    }),
    [autoDetectColorScheme, toggleAutoDetectColorScheme, theme, toggleTheme]
  );
}
