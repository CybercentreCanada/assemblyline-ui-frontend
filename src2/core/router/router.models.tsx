import type { AppRoute, CreatedAppRouteParamsMap } from 'core/routes';
import type { ReversePortalNode } from 'features/portal';
import { createReversePortalNode } from 'features/portal';
import type { LinkProps } from 'react-router';

//*****************************************************************************************
// App Router
//*****************************************************************************************

/** Represents a single panel in the multi-panel router. */
export type AppRouterPanel = {
  /** Keys of pinned routes in this panel. */
  pinnedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Currently active route key for this panel. */
  routeKey: keyof AppRouterStore['routes'];
  /** Keys of tabbed routes in this panel. */
  tabbedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Key of the temporary (unsaved) route. */
  temporaryRouteKey: keyof AppRouterStore['routes'];
};

/** Represents a cached portal node in the router. */
export type AppRouterNode = {
  /** Timestamp of last use for cache eviction. */
  lastUsedAt?: number;
  /** Reverse portal node reference. */
  portal: ReversePortalNode;
  /** Route key this node renders. */
  routeKey: keyof AppRouterStore['routes'];
};

/** Represents a single route entry in the router. */
export type AppRouterRoute<State = unknown> = {
  /** Age counter for eviction priority. */
  age?: number;
  /** Full href string for this route. */
  href: string;
  /** Route state payload. */
  state?: State;
};

/** Serializable subset of AppRouterStore for navigation state. */
export type AppRouterState = {
  /** Panel configurations. */
  panels: AppRouterStore['panels'];
  /** Route entries. */
  routes: AppRouterStore['routes'];
};

/** Full router store shape. */
export type AppRouterStore = {
  /** Maximum allowed portal nodes. */
  maxNodes: number;
  /** Maximum allowed panels. */
  maxPanels: number;
  /** Portal node cache. */
  nodes: Record<string, AppRouterNode>;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Route entries keyed by unique ID. */
  routes: Record<string, AppRouterRoute>;
};

export const DEFAULT_APP_ROUTER_PANEL: AppRouterPanel = {
  pinnedRouteKeys: [],
  routeKey: null,
  tabbedRouteKeys: [],
  temporaryRouteKey: null
};

export const DEFAULT_APP_ROUTER_NODE: AppRouterNode = {
  portal: createReversePortalNode(),
  routeKey: null
};

export const DEFAULT_APP_ROUTER_ROUTE: AppRouterRoute = {
  age: 0,
  href: null,
  state: null
};

export const DEFAULT_APP_ROUTER_STATE: AppRouterState = {
  panels: [],
  routes: {}
};

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  maxNodes: 0,
  maxPanels: 0,
  nodes: {},
  panels: [],
  routes: {}
};

export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  maxNodes: 0,
  maxPanels: 0,
  nodes: { default: { portal: createReversePortalNode(), routeKey: 'default' } },
  panels: [{ pinnedRouteKeys: [], routeKey: 'default', tabbedRouteKeys: [], temporaryRouteKey: 'default' }],
  routes: { default: { age: 0, href: '/submit', state: null } }
};

//*****************************************************************************************
// App Router Link
//*****************************************************************************************

/** Variant options for navigation links. */
export type AppLinkOptions =
  | { panel?: never; variant?: 'open' }
  | { panel?: never; variant?: 'replace' }
  | { panel: number; variant?: 'to' };

/** Props for the AppLink component. */
export type AppLinkProps<Route extends AppRoute> = Omit<LinkProps, 'to' | 'pathname' | 'search' | 'hash'> &
  AppLinkOptions & {
    /** Route target configuration. */
    to?: CreatedAppRouteParamsMap<Route>;
  };
