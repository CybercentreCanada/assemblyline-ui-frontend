import type { InferAppRouteSearchValuesFromPath, InferAppRouteValuesFromPath } from 'core/routes';
import type { ReversePortalNode } from 'features/portal';
import { createReversePortalNode } from 'features/portal';
import type { DependencyList, SetStateAction } from 'react';
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

export type RouteKeyOf<Store extends AppLocationState> = Extract<keyof Store['routes'], string>;

//*****************************************************************************************
// Blocker
//*****************************************************************************************

/** Route blocker registry keyed by route ids. */
export type AppRouterBlockedRoutes = Record<keyof AppRouterStore['routes'], unknown>;

export const DEFAULT_APP_ROUTER_BLOCKED_ROUTES: AppRouterBlockedRoutes = {};

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
    /** Routes that are blocked from navigation */
    blockedRoutes: AppRouterBlockedRoutes
    /** Portal node cache. */
    nodes: Record<string, AppRouterNode>;
  };

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  blockedRoutes: {},
  nodes: {}
};

/** Example router store shape used for parsing fallbacks and tests. */
export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  id: 'default',
  blockedRoutes: DEFAULT_APP_ROUTER_BLOCKED_ROUTES,
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
// Navigate
//*****************************************************************************************

/** Route transition intents accepted by router link helpers. */
export type InferNavigationIntentFromPath<Path extends AppRoute['path']> = {
  /** Opens a route, typically in the next panel. */
  openRoute: SetStateAction<InferAppRouteValuesFromPath<Path>>;
  /** Replaces the current route values. */
  replaceRoute: SetStateAction<InferAppRouteValuesFromPath<Path>>;
  /** Replaces only route search values using typed objects. */
  replaceSearchObject: SetStateAction<InferAppRouteSearchValuesFromPath<Path>>;
  /** Replaces only route search values using URLSearchParams. */
  replaceURLSearchParams: SetStateAction<URLSearchParams>;
  /** Closes the selected panel */
  closePanel: number;
};

/** Tuple form `[key, value, dependencies?, options?]` for DX-friendly navigation intent metadata. */
export type InferNavigationInputFromPath<Path extends AppRoute['path']> = {
  [Key in keyof InferNavigationIntentFromPath<Path>]: readonly [
    key: Key,
    dispatch: InferNavigationIntentFromPath<Path>[Key],
    dependencies?: DependencyList,
    options?: NavigateOptions
  ];
}[keyof InferNavigationIntentFromPath<Path>];

/** Normalized parsed navigation payload used by parseNavigationInput. */
export type InferNavigationMapFromPath<Path extends AppRoute['path']> = {
  [Key in keyof InferNavigationIntentFromPath<Path>]: {
    key: Key;
    dispatch: InferNavigationIntentFromPath<Path>[Key];
    dependencies: DependencyList | null;
    options: NavigateOptions | null;
  };
}[keyof InferNavigationIntentFromPath<Path>];

/** Default options for programmatic router navigation. */
export const DEFAULT_NAVIGATE_OPTIONS: NavigateOptions = {
  replace: false
};

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

// prettier-ignore
export type AppNavigationStore =
  & AppLocationState
  & {
    /** Check if this navigation should replace the current history entry */
    replace?: boolean;
  };

export type AppRouterState = Pick<AppNavigationStore, 'id' | 'panels' | 'routes'>;

export const DEFAULT_APP_NAVIGATION_STORE: AppNavigationStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  replace: false
};
