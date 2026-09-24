import { type PaletteMode } from '@mui/material';
import { useApp } from 'commons/components/app/hooks';
import { useMemo } from 'react';

export type AppThemeType = {
  autoDetectColorScheme: boolean;
  isDark: boolean;
  isLight: boolean;
  theme: PaletteMode;
  setAutoDetectColorScheme: (value: boolean) => void;
  setMode: (value: PaletteMode) => void;
  toggle: () => void;
  toggleAutoDetectColorScheme: () => void;
};

export function useAppTheme(): AppThemeType {
  const { autoDetectColorScheme, toggleAutoDetectColorScheme, theme, toggleTheme, setMode, setAutoDetectColorScheme } =
    useApp();
  return useMemo(
    () => ({
      autoDetectColorScheme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      theme,
      setAutoDetectColorScheme,
      setMode,
      toggle: toggleTheme,
      toggleAutoDetectColorScheme
    }),
    [autoDetectColorScheme, theme, toggleTheme, toggleAutoDetectColorScheme, setMode, setAutoDetectColorScheme]
  );
}
