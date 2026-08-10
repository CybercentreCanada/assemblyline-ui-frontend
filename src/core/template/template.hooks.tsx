import { useMediaQuery } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import { useMemo } from 'react';

//*****************************************************************************************
// Theme
//*****************************************************************************************

/**
 * @name useAppTemplateThemeMode
 * @description Resolves the effective theme mode, following the OS preference when set to `system`.
 * @returns Effective theme mode (`dark` or `light`)
 */
export const useAppTemplateThemeMode = (): 'dark' | 'light' => {
  const requestedMode = useAppPreferenceStore(s => s.layout.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};
