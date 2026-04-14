import type { TuiCookies } from '../cookies';
import type { AppLeftNavConfigs, AppPreferenceConfigs, AppThemeConfigs, AppTopNavConfigs } from './AppConfigs';

export const AppDefaultsCookieConfigs: Partial<TuiCookies> = {
  theme: 'theme.tui.default',
  mode: 'dark',
  layout: 'side',
  density: 'comfortable',
  drawerOpen: true,
  autoHideAppbar: false,
  showBreadcrumbs: true,
  showQuickSearch: true
};

// AppPreferenceConfigs defaults.
export const AppDefaultsPreferencesConfigs: AppPreferenceConfigs = {
  brand: undefined,
  appLink: '/',
  allowAutoHideTopbar: true,
  allowBreadcrumbs: true,
  allowQuickSearch: true,
  allowReset: true,
  allowLayoutSelection: true,
  allowThemeSelection: true,
  allowTranslate: true,
  allowDensitySelection: true
};

// AppLeftNavConfigs defaults.
export const AppDefaultsLeftNavConfigs: AppLeftNavConfigs = {
  width: 240
};

// AppTopNavConfigs defaults.
export const AppDefaultsTopNavConfigs: AppTopNavConfigs = {
  themeSelectionMode: 'profile',
  quickSearchURI: '/search/',
  quickSearchParam: 'q'
};

// AppThemeConfigs defaults.
export const AppDefaultsThemeConfigs: AppThemeConfigs = {};
