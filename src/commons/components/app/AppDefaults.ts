import type {
  AppLeftNavConfigs,
  AppPreferenceConfigs,
  AppSiteMapConfigs,
  AppThemeConfigs,
  AppTopNavConfigs
} from './AppConfigs';

// AppPreferenceConfigs defaults.
export const AppDefaultsPreferencesConfigs: AppPreferenceConfigs = {
  appName: null,
  appLink: '/',
  appIconDark: null,
  appIconLight: null,
  bannerDark: null,
  bannerLight: null,
  bannerVertDark: null,
  bannerVertLight: null,
  defaultLayout: 'side',
  defaultTheme: 'dark',
  defaultShowBreadcrumbs: true,
  allowAutoHideTopbar: true,
  allowBreadcrumbs: true,
  allowQuickSearch: true,
  allowReset: true,
  allowLayoutSelection: true,
  allowThemeSelection: true,
  allowTranslate: true,
  allowShowSafeResults: true,
  avatarD: 'mp'
};

// AppLeftNavConfigs defaults.
export const AppDefaultsLeftNavConfigs: AppLeftNavConfigs = {
  elements: [],
  width: 240
};

// AppTopNavConfigs defaults.
export const AppDefaultsTopNavConfigs: AppTopNavConfigs = {
  themeSelectionMode: 'profile',
  quickSearchURI: '/search/',
  quickSearchParam: 'q',
  userMenuType: 'list'
};

// AppSiteMapConfigs defaults.
export const AppDefaultsSitemapConfigs: AppSiteMapConfigs = {
  routes: [],
  itemsBefore: 1,
  itemsAfter: 2
};

// AppThemeConfigs defaults.
export const AppDefaultsThemeConfigs: AppThemeConfigs = {};
