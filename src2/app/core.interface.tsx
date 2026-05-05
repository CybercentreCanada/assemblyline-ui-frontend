import type { AppTheme } from '@tui/core';

declare global {
  /** Transient UI state managed by the interface store — nothing is persisted. */
  type AppInterface = {
    /** API developer tools configuration. */
    api: {
      /** Whether to show React Query devtools panel. */
      showDevtools: boolean;
    };
    /** Authentication state machine data. */
    auth: {
      /** Whether to skip the whoami call. */
      disableWhoAmI: boolean;
      /** Login provider configuration. */
      login: {
        /** Whether SAML-based login is allowed. */
        allow_saml_login: boolean;
        /** Whether user signup is allowed. */
        allow_signup: boolean;
        /** Whether user/pass login is allowed. */
        allow_userpass_login: boolean;
        /** List of OAuth provider identifiers. */
        oauth_providers: string[];
      };
      /** Current authentication mode/page. */
      mode: 'app' | 'loading' | 'locked' | 'login' | 'logout' | 'quota' | 'tos';
    };
    /** API usage quota counters. */
    quota: {
      /** General API call quota. */
      api: number;
      /** Submission quota. */
      submission: number;
    };
    /** Theme skin and initialization state. */
    theme: {
      /** Whether to inject MUI styles first (for CSS override ordering). */
      injectFirst?: boolean;
      /** Whether the theme has been loaded from the server. */
      initialized?: boolean;
      /** The active theme skin configuration. */
      skin?: AppTheme;
    };
    /** User menu visibility state. */
    usermenu: {
      /** Whether the user menu popover is open. */
      open: boolean;
    };
  };
}

export const DEFAULT_APP_INTERFACE_STORE: AppInterface = {
  api: {
    showDevtools: false
  },
  auth: {
    disableWhoAmI: false,
    login: {
      allow_saml_login: false,
      allow_signup: false,
      allow_userpass_login: false,
      oauth_providers: []
    },
    mode: 'loading'
  },
  quota: {
    api: 0,
    submission: 0
  },
  theme: {
    injectFirst: false,
    initialized: false,
    skin: null
  },
  usermenu: {
    open: false
  }
};
