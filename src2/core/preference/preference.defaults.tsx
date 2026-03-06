import { AppPreferenceStore, AppThemePreference } from './preference.models';

export const APP_THEME_PREFERENCE: AppThemePreference = {
  mode: 'dark'
};

export const APP_PREFERENCE_DEFAULTS: AppPreferenceStore = {
  theme: APP_THEME_PREFERENCE
};
