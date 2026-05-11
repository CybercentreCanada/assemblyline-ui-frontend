import { useMediaQuery } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import { useMemo } from 'react';

export const useAppTemplateThemeMode = () => {
  const requestedMode = useAppPreferenceStore(s => s.layout.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};
