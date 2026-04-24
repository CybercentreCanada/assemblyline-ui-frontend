import { useMediaQuery } from '@mui/material';
import { useAppConfig } from 'core/config';
import { useMemo } from 'react';

export const useAppLayoutThemeMode = () => {
  const requestedMode = useAppConfig(s => s.layout.cookies.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};
