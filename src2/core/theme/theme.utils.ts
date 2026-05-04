import type { ThemeOptions } from '@mui/material';
import { deepmerge } from '@mui/utils';
import type { AppThemeConfigs } from '@tui/core';

/**
 * @name mergeThemeConfigs
 * @description Merges the global theme config with the mode-specific (light/dark) overrides.
 * @param configs - The full theme configs object containing global, light, and dark keys
 * @param mode - The resolved color mode to apply
 * @returns A merged ThemeOptions object ready for createTheme
 */
export const mergeThemeConfigs = (configs: AppThemeConfigs, mode: 'light' | 'dark'): ThemeOptions => {
  const globalConfigs = configs.global ?? {};
  const modeConfigs = mode === 'dark' ? (configs.dark ?? {}) : (configs.light ?? {});

  return deepmerge(globalConfigs, modeConfigs);
};
