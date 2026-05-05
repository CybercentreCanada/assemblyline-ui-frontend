import { useMediaQuery } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import { useMemo } from 'react';

// const cookies: {
//   theme: string;
//   mode: 'light' | 'dark';
//   lang: string;
//   layout: 'top' | 'side';
//   density: 'dense' | 'comfortable' | 'compact';
//   drawerOpen: boolean;
//   autoHideAppbar: boolean;
//   showQuickSearch: boolean;
//   showBreadcrumbs: boolean;
// };

export const useAppTemplateThemeMode = () => {
  const requestedMode = useAppPreferenceStore(s => s.layout.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};
