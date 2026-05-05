import type { AppTheme } from '@tui/core';
import type { JSONFeedItem } from 'layout/notifications/notifications.models';
import type { SystemMessage } from 'models/api/user';

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
    /** Side drawer panel state. */
    drawer: {
      /** Whether the drawer is expanded to maximized width. */
      maximized: boolean;
    };
    /** Notification panel state. */
    notifications: {
      /** Whether the announcement delete dialog is open. */
      announcementDeleteOpen: boolean;
      /** Draft system message being edited. */
      announcementDraft: SystemMessage;
      /** Whether the announcement edit dialog is open. */
      announcementEditOpen: boolean;
      /** Whether the announcement is currently being saved. */
      announcementSaving: boolean;
      /** Fetched and processed notification items. */
      items: JSONFeedItem[];
      /** Whether notifications are currently loading. */
      loading: boolean;
      /** Whether the notification drawer is open. */
      open: boolean;
      /** Whether the system message has been read. */
      read: boolean;
      /** Whether the save confirmation dialog is open. */
      saveConfirmationOpen: boolean;
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
  drawer: {
    maximized: false
  },
  notifications: {
    announcementDeleteOpen: false,
    announcementDraft: {
      message: '',
      severity: 'info',
      title: '',
      user: ''
    },
    announcementEditOpen: false,
    announcementSaving: false,
    items: [],
    loading: false,
    open: false,
    read: false,
    saveConfirmationOpen: false
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
