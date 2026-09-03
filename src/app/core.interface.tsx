import type { AppTheme } from '@tui/core';
import type { AssistantInsightProps, ContextMessageProps } from 'layout/assistant';
import type { AppDebugStoreHistory, AppDebugStoreName } from 'layout/debug';
import { getDefaultAppDebugStoreHistory } from 'layout/debug/debug.models';
import type { ExternalEnrichmentState } from 'layout/external-lookup';
import type { JSONFeedItem } from 'layout/notifications';
import type { QuickSearchItem } from 'layout/quick-search';
import type { SystemMessage } from 'models/api/user';

declare global {
  /** Transient UI state managed by the interface store — nothing is persisted. */
  type AppInterfaceStore = {
    /** AI assistant panel state. */
    assistant: {
      /** Current context messages passed to the assistant. */
      currentContext: ContextMessageProps[];
      /** Current conversation history shown in the panel. */
      currentHistory: ContextMessageProps[];
      /** Current value of the assistant input field. */
      currentInput: string;
      /** Insight cards surfaced by the assistant. */
      currentInsights: AssistantInsightProps[];
      /** Whether there are active insights to display. */
      hasInsights: boolean;
      /** Whether the assistant panel is open. */
      open: boolean;
      /** Whether the assistant is awaiting a response. */
      thinking: boolean;
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
    /** Debug panel state. */
    debug: {
      /** Captured snapshot history per observed store. */
      history: AppDebugStoreHistory;
      /** Active debug panel, or null when the panel is closed. */
      mode: null | 'api' | 'store';
      /** Identifier handed to the next captured snapshot. */
      nextSnapshotId: number;
      /** Selected snapshot, or null to follow the latest one. */
      snapshotId: number;
      /** Store currently inspected in the debug panel. */
      store: AppDebugStoreName;
    };
    /** Side drawer panel state. */
    drawer: {
      /** Whether the drawer is expanded to maximized width. */
      maximized: boolean;
    };
    /** External data source enrichment query state. */
    externalLookup: {
      /** Cached enrichment results indexed by tag key. */
      enrichment: ExternalEnrichmentState;
    };
    /** Highlighter state used across detail/section components. */
    highlighter: {
      /** Directly highlighted keys. */
      keys: Set<string>;
      /** Map of key to related keys that should be highlighted together. */
      links: Record<string, string[]>;
      /** Derived related highlighted keys from `highlightMap`. */
      related: Set<string>;
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
    /** Topnav quick search state. */
    quicksearch: {
      /** Whether selecting a result or pressing enter resets the input. */
      autoReset: boolean;
      /** Whether the input currently has focus. */
      focused: boolean;
      /** Search results, or null before a search has been made. */
      items: QuickSearchItem[] | null;
      /** Whether the results dropdown/dialog is open. */
      menu: boolean;
      /** Display mode: inline dropdown or fullscreen dialog. */
      mode: 'inline' | 'fullscreen';
      /** Whether a search request is in flight. */
      searching: boolean;
      /** Current input value. */
      value: string;
    };
    /** Template-level runtime measurements. */
    template: {
      /** Last measured appbar height in pixels. */
      appBarHeight: number;
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

export const DEFAULT_APP_INTERFACE_STORE: AppInterfaceStore = {
  assistant: {
    currentContext: [],
    currentHistory: [],
    currentInput: '',
    currentInsights: [],
    hasInsights: false,
    open: false,
    thinking: false
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
  debug: {
    history: getDefaultAppDebugStoreHistory(),
    mode: null,
    nextSnapshotId: 0,
    snapshotId: null,
    store: 'Config'
  },
  drawer: {
    maximized: false
  },
  externalLookup: {
    enrichment: {}
  },
  highlighter: {
    keys: new Set(),
    links: {},
    related: new Set()
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
  quicksearch: {
    autoReset: true,
    focused: false,
    items: null,
    menu: false,
    mode: 'inline',
    searching: false,
    value: ''
  },
  template: {
    appBarHeight: -1
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
