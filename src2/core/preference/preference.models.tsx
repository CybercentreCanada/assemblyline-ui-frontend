import type { PaletteMode } from '@mui/material';

export type AppThemePreference = {
  mode: PaletteMode;
};

export type AppPreferenceStore = {
  theme: AppThemePreference;
};
