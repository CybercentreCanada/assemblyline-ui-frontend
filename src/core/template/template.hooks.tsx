import { useMediaQuery } from '@mui/material';
import type { TuiCookies } from '@tui/core';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import { parseAppThemeFromLegacy } from 'core/template';
import { useEffect, useMemo } from 'react';

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
  const requestedMode = useAppPreferenceStore(s => s.layout.mode);

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
  const layout = useAppPreferenceStore(s => s.layout.layout);
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
