import type { InferAppRouteSearchValuesFromPath, InferAppRouteValuesFromRoute } from 'core/routes';
import type { ReversePortalNode } from 'features/portal';
import { createReversePortalNode } from 'features/portal';
import type { SetStateAction } from 'react';
import type { NavigateOptions, NavigateProps } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// To
//*****************************************************************************************

export type AppLinkTo<Path extends AppRoute['path']> = {
  openRoute: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>;
  replaceRoute: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>;
  replaceSearchObject: SetStateAction<InferAppRouteSearchValuesFromPath<Path>>;
  replaceURLSearchParams: SetStateAction<URLSearchParams>;
};

export type AppLinkToOptions<Path extends AppRoute['path']> = {
  [K in keyof AppLinkTo<Path>]: Record<K, AppLinkTo<Path>[K]>;
}[keyof AppLinkTo<Path>];

export type AppLinkToTuple<Path extends AppRoute['path']> =
  AppLinkTo<Path> extends infer T
    ? T extends Record<PropertyKey, unknown>
      ? { [K in keyof T]-?: [K, T[K]] }[keyof T]
      : never
    : never;

//*****************************************************************************************
// To Options
//*****************************************************************************************

export const DEFAULT_NAVIGATE_OPTIONS: NavigateOptions = {
  replace: false
};

//*****************************************************************************************
// Blocker
//*****************************************************************************************

export type AppRouterBlocker = {
  /** Whether the panel currently blocks this request. */
  isBlocked: boolean;
  /** Optional message to show in confirmation dialog. */
  message?: string;
};

export const DEFAULT_APP_ROUTER_BLOCKER: AppRouterBlocker = {
  isBlocked: false,
  message: null
};

//*****************************************************************************************
// Navigation
//*****************************************************************************************

export type AppRouterNavigation = {
  href: NavigateProps['to'];
  replace: NavigateProps['replace'];
  state: NavigateProps['state'];
  type: 'create' | 'update' | 'delete';
};

export const DEFAULT_APP_ROUTER_NAVIGATION: AppRouterNavigation = {
  href: null,
  replace: false,
  state: null,
  type: 'create'
};

//*****************************************************************************************
// Panel
//*****************************************************************************************

/** Represents a single panel in the multi-panel router. */
export type AppRouterPanel = {
  /** Current blocker state for this panel. */
  blocker: AppRouterBlocker;
  /** Current/pending navigation request for this panel. */
  navigation: AppRouterNavigation;
  /** Keys of pinned routes in this panel. */
  pinnedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Currently active route key for this panel. */
  routeKey: keyof AppRouterStore['routes'];
  /** Keys of tabbed routes in this panel. */
  tabbedRouteKeys: (keyof AppRouterStore['routes'])[];
  /** Key of the temporary (unsaved) route. */
  temporaryRouteKey: keyof AppRouterStore['routes'];
};

export const DEFAULT_APP_ROUTER_PANEL: AppRouterPanel = {
  blocker: DEFAULT_APP_ROUTER_BLOCKER,
  navigation: DEFAULT_APP_ROUTER_NAVIGATION,
  pinnedRouteKeys: [],
  routeKey: null,
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
// State
//*****************************************************************************************

/** Serializable subset of AppRouterStore for navigation state. */
export type AppRouterState = {
  /** Snapshot id for fast equality checks. */
  id: AppRouterStore['id'];
  /** Panel configurations. */
  panels: AppRouterStore['panels'];
  /** Route entries. */
  routes: AppRouterStore['routes'];
};

export const DEFAULT_APP_ROUTER_STATE: AppRouterState = {
  id: null,
  panels: [],
  routes: {}
};

//*****************************************************************************************
// Store
//*****************************************************************************************

/** Full router store shape. */
export type AppRouterStore = {
  id: string;
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

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  id: generateRandomUUID(),
  maxNodes: 2,
  maxPanels: 2,
  nodes: {},
  panels: [],
  routes: {}
};

export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  id: 'test',
  maxNodes: 0,
  maxPanels: 0,
  nodes: { default: { portal: createReversePortalNode(), routeKey: 'default' } },
  panels: [
    {
      blocker: DEFAULT_APP_ROUTER_BLOCKER,
      navigation: null,
      pinnedRouteKeys: [],
      routeKey: 'default',
      tabbedRouteKeys: [],
      temporaryRouteKey: 'default'
    }
  ],
  routes: { default: { age: 0, href: '/submit', state: null } }
};
