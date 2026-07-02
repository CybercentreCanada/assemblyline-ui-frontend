import type { ReversePortalNode } from 'features/portal';
import { createReversePortalNode } from 'features/portal';
import type { NavigateOptions } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// Panel
//*****************************************************************************************

/** Represents a single panel in the multi-panel router. */
export type AppRouterPanel = {
  /** Currently active route key for this panel. */
  routeKey: keyof AppRouterStore['routes'];
  /** Keys of pinned routes in this panel. */
  pinnedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Keys of tabbed routes in this panel. */
  tabbedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Key of the temporary (unsaved) route. */
  temporaryRouteKey: keyof AppRouterStore['routes'];
};

export const DEFAULT_APP_ROUTER_PANEL: AppRouterPanel = {
  routeKey: null,
  pinnedRouteKeys: [],
  tabbedRouteKeys: [],
  temporaryRouteKey: null
};

//*****************************************************************************************
// Node
//*****************************************************************************************

/** Represents a cached portal node in the router. */
export type AppRouterNode = {
  /** Timestamp of last use for cache eviction. */
  lastUsedAt?: number;
  /** Reverse portal node reference. */
  portal: ReversePortalNode;
  /** Route key this node renders. */
  routeKey: keyof AppRouterStore['routes'];
};

export const DEFAULT_APP_ROUTER_NODE: AppRouterNode = {
  portal: createReversePortalNode(),
  routeKey: null
};

//*****************************************************************************************
// Route
//*****************************************************************************************

/** Represents a single route entry in the router. */
export type AppRouterRoute<State = unknown> = {
  /** Age counter for eviction priority. */
  age?: number;
  /** Full href string for this route. */
  href: string;
  /** Route state payload. */
  state?: State;
};

export const DEFAULT_APP_ROUTER_ROUTE: AppRouterRoute = {
  age: 0,
  href: null,
  state: null
};

//*****************************************************************************************
// Location State
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
export type AppLocationState = {
  /** Store revision id for sync checks. */
  id: string;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Route entries keyed by unique ID. */
  routes: Record<string, AppRouterRoute>;
};

export const DEFAULT_APP_LOCATION_STATE: AppLocationState = {
  id: generateRandomUUID(),
  panels: [],
  routes: {}
};

//*****************************************************************************************
// Router
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
// prettier-ignore
export type AppRouterStore =
  & AppLocationState
  & {
    /** Maximum allowed portal nodes. */
    maxNodes: number;
    /** Maximum allowed panels. */
    maxPanels: number;
    /** Portal node cache. */
    nodes: Record<string, AppRouterNode>;
  };

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  maxNodes: 2,
  maxPanels: 2,
  nodes: {}
};

/** Example router store shape used for parsing fallbacks and tests. */
export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  id: 'default',
  maxNodes: 0,
  maxPanels: 0,
  nodes: { default: { portal: createReversePortalNode(), routeKey: 'default' } },
  panels: [
    {
      pinnedRouteKeys: [],
      routeKey: 'default',
      tabbedRouteKeys: [],
      temporaryRouteKey: 'default'
    }
  ],
  routes: { default: { age: 0, href: '/submit', state: null } }
};

//*****************************************************************************************
// Blocker
//*****************************************************************************************

/** Route blocker registry keyed by route ids. */
export type AppRouterBlockedRoutes = Record<keyof AppRouterStore['routes'], unknown>;

export const DEFAULT_APP_ROUTER_BLOCKED_ROUTES: AppRouterBlockedRoutes = {};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

// prettier-ignore
export type AppNavigationStore =
  & AppLocationState
  & {
    /** Routes that are blocked from navigation */
    blockedRoutes: Record<string, boolean>;
    /** Check if this navigation should replace the current history entry */
    replace?: boolean;
  };

export type AppRouterState = Pick<AppNavigationStore, 'id' | 'panels' | 'routes'>;

export const DEFAULT_APP_NAVIGATION_STORE: AppNavigationStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  blockedRoutes: {},
  replace: false
};

//*****************************************************************************************
// To Options
//*****************************************************************************************

/** Default options for programmatic router navigation. */
export const DEFAULT_NAVIGATE_OPTIONS: NavigateOptions = {
  replace: false
};
