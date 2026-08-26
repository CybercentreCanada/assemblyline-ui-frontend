import { useMediaQuery } from '@mui/material';
import { useCookiesStore, type TuiCookies } from '@tui/core';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore, useAppSetPreferenceStore } from 'core/preference';
import { parseAppThemeFromLegacy } from 'core/template';
import { useEffect, useLayoutEffect, useMemo } from 'react';

//*****************************************************************************************
// App Template Theme Initializer
//*****************************************************************************************

/**
 * @name useAppTemplateThemeInitializer
 * @description Fetches `/theme.json`, converts it from its legacy shape, and stores the
 * resulting `AppTheme` as the active skin in the interface store.
 * @returns Nothing
 */
export const useAppTemplateThemeInitializer = (): void => {
  const setInterfaceStore = useAppSetInterfaceStore();

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json() as Promise<unknown>)
      .then(data =>
        setInterfaceStore(s => {
          s.theme.initialized = true;
          s.theme.skin = parseAppThemeFromLegacy({
            id: 'theme.default',
            i18nKey: 'theme.default.label',
            default: true,
            configs: data
          });

          return s;
        })
      )
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, [setInterfaceStore]);
};

//*****************************************************************************************
// App Template Theme Mode
//*****************************************************************************************

/**
 * @name useAppTemplateThemeMode
 * @description Resolves the requested layout mode to a concrete 'light'/'dark' value,
 * following the OS preference when the requested mode is 'system'.
 * @returns The resolved `light`/`dark` mode
 */
export const useAppTemplateThemeMode = (): TuiCookies['mode'] => {
  const requestedMode = useAppPreferenceStore(s => s.template.mode);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};

//*****************************************************************************************
// App Template Theme Patcher
//*****************************************************************************************

/**
 * @name useAppTemplateThemePatcher
 * @description Applies runtime styling patches directly to DOM elements for cases the theme
 * itself can't express. Patches the `#appbar` element's background to the CSS variable for
 * `background.default` when the layout is 'side' (its default `MuiAppBar-colorPrimary`
 * styling is otherwise used). Uses the CSS variable so the patch tracks light/dark mode.
 * The `#appbar` element is rendered by `AppRoot`/`AppProvider` after this hook mounts, so a
 * `MutationObserver` waits for it to appear in the DOM instead of assuming it's already there.
 * @returns Nothing
 */
export const useAppTemplateThemePatcher = (): void => {
  const layout = useAppPreferenceStore(s => s.template.layout);
  const initialized = useAppInterfaceStore(s => s.theme.initialized);
  const skin = useAppInterfaceStore(s => s.theme.skin);
  const auth = useAppInterfaceStore(s => s.auth.mode === 'app');

  useEffect(() => {
    const patch = (appbar: HTMLElement) => {
      appbar.style.backgroundColor =
        layout === 'side'
          ? 'var(--mui-palette-background-default) !important'
          : 'var(--mui-palette-background-paper) !important';
    };

    const appbar = document.getElementById('appbar');

    if (appbar) {
      patch(appbar);
      return () => {
        appbar.style.backgroundColor = '';
      };
    }

    const observer = new MutationObserver(() => {
      const lateAppbar = document.getElementById('appbar');

      if (lateAppbar) {
        patch(lateAppbar);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.getElementById('appbar')?.style.removeProperty('background-color');
    };
  }, [auth, initialized, layout, skin]);
};

export const APPBAR_READY_EVENT = 'tui.event.appbar.ready';

//*****************************************************************************************
// App Template Bar Height Updater
//*****************************************************************************************

/**
 * @name useAppBarHeight
 * @description Tracks the current `#appbar` height and persists it to the interface store
 * so all consumers read a consistent value.
 * @returns Current appbar height in pixels, or `-1` before first measurement
 */
export const useAppTemplateBarHeight = (): number => {
  const height = useAppInterfaceStore(s => s.template.appBarHeight);
  const setInterfaceStore = useAppSetInterfaceStore();

  useLayoutEffect(() => {
    const updateHeight = () => {
      const appbar = document.getElementById('appbar');
      if (!appbar) return;

      const nextHeight = appbar.getBoundingClientRect().height;

      setInterfaceStore(s => {
        if (s.template.appBarHeight === nextHeight) return s;
        s.template.appBarHeight = nextHeight;
        return s;
      });
    };

    updateHeight();

    let observer: ResizeObserver | null = null;
    const appbar = document.getElementById('appbar');
    if (appbar && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateHeight);
      observer.observe(appbar);
    }

    window.addEventListener('resize', updateHeight);
    window.addEventListener(APPBAR_READY_EVENT, updateHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener(APPBAR_READY_EVENT, updateHeight);
    };
  }, [setInterfaceStore]);

  return height;
};

//*****************************************************************************************
// App Template Preference Overrider
//*****************************************************************************************

/**
 * @name useOverrideTemplatePreferences
 * @description Syncs template preference settings from `useCookiesStore` into the local preference store whenever cookie parameters change.
 * @returns Nothing
 */
export const useOverrideTemplatePreferences = (): void => {
  const autoHideAppbar = useCookiesStore(s => s?.autoHideAppbar);
  const density = useCookiesStore(s => s?.density);
  const drawerOpen = useCookiesStore(s => s?.drawerOpen);
  const lang = useCookiesStore(s => s?.lang);
  const layout = useCookiesStore(s => s?.layout);
  const leftNavHover = useCookiesStore(s => Boolean(s?.leftNavHover));

  const setPreferenceStore = useAppSetPreferenceStore();

  useEffect(() => {
    setPreferenceStore(s => {
      if (autoHideAppbar !== undefined) s.template.autoHideAppbar = autoHideAppbar;
      if (density !== undefined) s.template.density = density;
      if (drawerOpen !== undefined) s.template.drawerOpen = drawerOpen;
      if (lang !== undefined) s.template.lang = lang;
      if (layout !== undefined) s.template.layout = layout;
      if (leftNavHover !== undefined) s.template.leftNavHover = leftNavHover;

      return s;
    });
  }, [autoHideAppbar, density, drawerOpen, lang, layout, leftNavHover, setPreferenceStore]);

  return null;
};
