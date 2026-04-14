import type { PaletteMode } from '@mui/material';
import type { AppDensityMode, AppLayoutMode } from '../app/AppConfigs';
import { AppDefaultsCookieConfigs } from '../app/AppDefaults';
export * from '../cookies/client';
export { useCookiesStore } from '../cookies/hooks/useCookiesStore';
export * from '../cookies/server';

export const TUI_COOKIE_OPTIONS = {
  path: '/',
  expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
};

export const TUI_COOKIE_KEYS = [
  'tui.lang',
  'tui.theme',
  'tui.mode',
  'tui.layout',
  'tui.density',
  'tui.drawerOpen',
  'tui.autoHideAppbar',
  'tui.showQuickSearch',
  'tui.showBreadcrumbs'
];

export type TuiParsedJsCookies = {
  [key: string]: string;
};

export type TuiCookieDef = {
  key: string;
  name: string;
  default?: any;
  type?: string;
};

export type TuiCookies = {
  theme: string;
  mode: PaletteMode;
  lang: string;
  layout: AppLayoutMode;
  density: AppDensityMode;
  drawerOpen: boolean;
  autoHideAppbar: boolean;
  showQuickSearch: boolean;
  showBreadcrumbs: boolean;
};

export type TuiCookiesStore = TuiCookies & {
  initialized: boolean;
  setTheme: (newTheme: string) => void;
  setMode: (newMode: PaletteMode) => void;
  setLang: (newLang: string) => void;
  setLayout: (newLayout: AppLayoutMode) => void;
  setAutoHideAppbar: (auto: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setShowQuickSearch: (show: boolean) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  setDensity: (density: AppDensityMode) => void;
  reset: () => void;
};

const defaultValue = <T>(appDefault: T, tuiDefault: T): T => {
  return appDefault !== undefined ? appDefault : tuiDefault;
};

export const parseTuiCookies = (cookies: TuiParsedJsCookies, defaults?: Partial<TuiCookies>): TuiCookies => {
  return parseCookies(
    cookies,
    { key: 'tui.lang', name: 'lang', type: 'string' },
    {
      key: 'tui.theme',
      name: 'theme',
      default: defaultValue(defaults?.theme, AppDefaultsCookieConfigs.theme)
    },
    {
      key: 'tui.mode',
      name: 'mode',
      default: defaultValue(defaults?.mode, AppDefaultsCookieConfigs.mode)
    },
    {
      key: 'tui.layout',
      name: 'layout',
      default: defaultValue(defaults?.layout, AppDefaultsCookieConfigs.layout)
    },
    {
      key: 'tui.drawerOpen',
      name: 'drawerOpen',
      type: 'boolean',
      default: defaultValue(defaults?.drawerOpen, AppDefaultsCookieConfigs.drawerOpen)
    },
    {
      key: 'tui.autoHideAppbar',
      name: 'autoHideAppbar',
      type: 'boolean',
      default: defaultValue(defaults?.autoHideAppbar, AppDefaultsCookieConfigs.autoHideAppbar)
    },
    {
      key: 'tui.showQuickSearch',
      name: 'showQuickSearch',
      type: 'boolean',
      default: defaultValue(defaults?.showQuickSearch, AppDefaultsCookieConfigs.showQuickSearch)
    },
    {
      key: 'tui.showBreadcrumbs',
      name: 'showBreadcrumbs',
      type: 'boolean',
      default: defaultValue(defaults?.showBreadcrumbs, AppDefaultsCookieConfigs.showBreadcrumbs)
    },
    {
      key: 'tui.density',
      name: 'density',
      default: defaultValue(defaults?.density, AppDefaultsCookieConfigs.density)
    }
  );
};

export const parseCookies = <T extends object>(cookies: TuiParsedJsCookies, ...include: TuiCookieDef[]): T => {
  return include.reduce((_cookies, _entry) => {
    const cookie = cookies[_entry.key] || _entry.default;

    if (cookie !== undefined) {
      if (_entry.type === 'json') {
        try {
          _cookies[_entry.name] = JSON.parse(cookie);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to parse cookie ${_entry.key} as JSON:`, error);
          _cookies[_entry.name] = _entry.default;
        }
      } else if (_entry.type === 'boolean') {
        _cookies[_entry.name] = typeof cookie === 'boolean' ? cookie : cookie === 'true';
      } else {
        _cookies[_entry.name] = cookie;
      }
    }

    return _cookies;
  }, {}) as T;
};
