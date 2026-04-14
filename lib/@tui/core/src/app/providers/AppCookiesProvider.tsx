import type { PaletteMode } from '@mui/material';
import { type i18n } from 'i18next';
import { createContext, useMemo, type FC, type PropsWithChildren } from 'react';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { TUI_COOKIE_KEYS, type TuiCookies, type TuiCookiesStore } from '../../cookies';
import { setClientCookie } from '../../cookies/client';
import type { AppDensityMode, AppLayoutMode } from '../AppConfigs';

export const createCookieStore = (cookies: TuiCookies, _i18n: i18n) => {
  const store = create<TuiCookiesStore>(set => {
    return {
      ...cookies,
      initialized: true,
      setTheme: (newTheme: string) => {
        setClientCookie('tui.theme', newTheme);
        set({ theme: newTheme });
      },
      setMode: (newMode: PaletteMode) => {
        setClientCookie('tui.mode', newMode);
        set({ mode: newMode });
      },
      setLang: (newLang: string) => {
        _i18n.changeLanguage(newLang);
        set({ lang: newLang });
      },
      setLayout: (newLayout: AppLayoutMode) => {
        setClientCookie('tui.layout', newLayout);
        set({ layout: newLayout });
      },
      setAutoHideAppbar: (auto: boolean) => {
        setClientCookie('tui.autoHideAppbar', `${auto}`);
        set({ autoHideAppbar: auto });
      },
      setDrawerOpen: (open: boolean) => {
        setClientCookie('tui.drawerOpen', `${open}`);
        set({ drawerOpen: open });
      },
      setShowQuickSearch: (show: boolean) => {
        setClientCookie('tui.showQuickSearch', `${show}`);
        set({ showQuickSearch: show });
      },
      setShowBreadcrumbs: (show: boolean) => {
        setClientCookie('tui.showBreadcrumbs', `${show}`);
        set({ showBreadcrumbs: show });
      },
      setDensity: (newDensity: AppDensityMode) => {
        setClientCookie('tui.density', newDensity);
        set({ density: newDensity });
      },
      reset: () => {
        for (const key of TUI_COOKIE_KEYS) {
          const cookieKey = key.split('.')[1];
          const cookieValue = cookies[cookieKey];
          setClientCookie(key, `${cookieValue}`);
          if (key === 'tui.lang') {
            _i18n.changeLanguage(cookieValue);
          }
        }
        set({ ...cookies });
      }
    };
  });

  // Make sure i18n language is sync with cookie language.
  if (cookies.lang !== _i18n.language) {
    _i18n.changeLanguage(cookies.lang);
  }

  return store;
};

type AppCookiesProviderProps = PropsWithChildren & { cookies: TuiCookies; i18n: i18n };

export const AppCookiesContext = createContext<UseBoundStore<StoreApi<TuiCookiesStore>>>(undefined);

export const AppCookiesProvider: FC<AppCookiesProviderProps> = ({ cookies, i18n, children }) => {
  const store = useMemo(() => {
    return createCookieStore(cookies, i18n);
  }, [cookies, i18n]);

  return <AppCookiesContext.Provider value={store}>{children}</AppCookiesContext.Provider>;
};
