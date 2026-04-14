import type { ThemeOptions } from '@mui/material';
import type { FC, PropsWithChildren, ReactElement } from 'react';
import type { AppCommand } from '../commands';
import type { LeftNavMenuProps } from '../leftnav';
import type { AppBarUserMenuElement } from '../topnav';
import type { AppBrandProps } from './hooks';

// Declarative branding configuration.
// Client apps provide asset URLs and text — TUI owns rendering, sizing, and density scaling.
export type AppBrandConfig = {
  application: string; // Application identifier (used in alt text; available to custom branding components)
  appName?: string; // Application display name (used in drawer, topnav, tooltips)
  logo: {
    dark: string; // URL to dark-mode logo image
    light: string; // URL to light-mode logo image
  };
  name?: {
    dark?: string; // URL to dark-mode name image (optional)
    light?: string; // URL to light-mode name image (optional)
  };
  // Optional override component. If provided, TUI passes sizing specs and config through to it.
  component?: FC<AppBrandProps>;
};

// Specification interface for the AppProvider's 'preferences' attribute.
export type AppPreferenceConfigs = {
  brand?: AppBrandConfig; // Application branding configuration.
  appLink?: string; // Route to navigate to when the icon on the left nav bar is pressed
  allowAutoHideTopbar?: boolean; // Allow the user to toggle on/off the topbar autohide feature
  allowBreadcrumbs?: boolean; // Allow the user to toggle on/off the breadcrumb
  allowQuickSearch?: boolean; // Allow the user toggle on/off the quick search
  allowReset?: boolean; // Allow the user to reset preferences to the default values
  allowLayoutSelection?: boolean; // Allow the user to switch between "top" and "side" layout
  allowThemeSelection?: boolean; // Allow the user to toggle between 'dark' and 'light' mode
  allowTranslate?: boolean; // Allow the user to switch language
  allowFocusMode?: boolean; // Allow user to remove navigation elements (side nav, top bar) from layout.
  allowPersonalization?: boolean; // Allow personalization menu in user profile.
  allowDensitySelection?: boolean; // Allow user to change information density (default, compact, dense).
  topnav?: AppTopNavConfigs; // top nav appbar specific configurations.
  leftnav?: AppLeftNavConfigs; // left nav drawer specific configurations.
  commands?: AppCommand[]; // Configure custom application commands (included in quick-commands menu)
  // Application layout level slots configuration.
  slots?: {
    layout?: FC<PropsWithChildren>;
  };
};

// Specification interface for supported application themes.
export type AppTheme = {
  id: string; // Unique identifier for application theme.
  configs: AppThemeConfigs; // Material UI theme configs.
  i18nKey: string; // An i18nKey to use as the option displayed in the select menu.
  default?: boolean; // Indicates if the theme should be default.
};

// Specification interface for the AppProvider's 'theme' attribute.
export type AppThemeConfigs = {
  global?: Partial<ThemeOptions>;
  light?: Partial<ThemeOptions>;
  dark?: Partial<ThemeOptions>;
};

// Specification inteface for 'topnav' configurations.
// These configurations apply to the top navigation appbar.
export type AppTopNavConfigs = {
  themeSelectionMode?: AppThemeSelectionMode; // Where does the theme selection menu shows up either. In separate icon ("icon") or under user profile ("profile").
  quickSearchURI?: string; // Uri to redirect to for the appbar quick search.
  quickSearchParam?: string; // Request parameter used to set the quick search query.
  quickSearchIconOnly?: boolean; // Only show the icon, and not the inline textbox, for the quick search.
  hideUserAvatar?: boolean; // Do not show the user profile avatar and menu.
  // AppBar slots placeholders.
  slots?: {
    left?: ReactElement[]; // Absolute left of the AppBar.
    right?: ReactElement[]; // Absolute right of the AppBar.
    // Slots relative to the breadcrumbs component.
    breadcrumbs?: {
      left?: ReactElement[]; // To the left of the breadcrumbs.
      right?: ReactElement[]; // To the right of the breadcrumbs.
    };
    // Slots relative to the search component.
    search?: {
      left?: ReactElement[]; // To the left of the search.
      right?: ReactElement[]; // To the right of the search.
    };
  };
  // App user profile configuration.
  profile?: {
    // Configurable user profile menus.
    menus?: {
      // User menu configurations.
      user?: {
        i18nKey?: string; // The i18nKey of the user menu title.
        title?: string; // The title of the user menu if `i18nKey` is not provided.
        slot?: AppBarUserMenuElement[]; // The items composing the user menu.
      };
      // Admin menu configurations.
      admin?: {
        i18nKey?: string; // The i18nKey of the admin menu title.
        title?: string; // The title of the admin menu if `i18nKey` is not provided.
        slot?: AppBarUserMenuElement[]; // The items composing the admin menu.
      };
    };
  };
};

// Specification inteface for 'leftnav' configurations.
// These configurations apply to the left navigation drawer.
export type AppLeftNavConfigs = {
  menus?: LeftNavMenuProps[]; // The list of menus to render in the left-nav drawer.
  width?: number | string; // The width of the left nav drawer when open. Supports px number or theme.spacing() string.
};

// Specification type describing the layout supported by the applications.
// 'side' will anchor the leftnav drawer at the same elevation as the appbar and content area (entire height of winddow).
// 'top' will anchor the leftnav drawer under the appbar (which will stick to the top).
export type AppLayoutMode = 'side' | 'top';

// Specification type describing the where to render the theming/preferences options.
// 'profile' will render them under the userprofile menu.
// 'icon' will render a separate icon within which the theming/preferences options will be rendered.
export type AppThemeSelectionMode = 'profile' | 'icon';

// Specification type describing the information density levels supported by the applications.
// 'comfortable' is the default MUI spacing (mobile-first).
// 'compact' reduces padding and font sizes for typical desktop workflows.
// 'dense' aggressively compresses spacing for power users and data-heavy dashboards.
export type AppDensityMode = 'comfortable' | 'compact' | 'dense';
