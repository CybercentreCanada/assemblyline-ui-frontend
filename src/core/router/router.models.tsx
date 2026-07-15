import type { InferAppRouteValuesFromPath } from 'core/routes';
import type { ReversePortalNode } from 'features/portal';
import { createReversePortalNode } from 'features/portal';
import type { DependencyList } from 'react';
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
    /** Portal node cache. */
    nodes: Record<string, AppRouterNode>;
  };

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  nodes: {}
};

/** Example router store shape used for parsing fallbacks and tests. */
export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  id: 'default',
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

export type AppNavigateOptions = {
  // `replace` is a boolean that determines whether the navigation should replace the current history entry or push a new one.
  replace?: boolean;
  // `resetScroll` is a boolean that determines whether scroll position will be reset to 0,0 after the location is committed to browser history.
  resetScroll?: boolean;
  // `hashScrollIntoView` is a boolean or object that determines whether an id matching the hash will be scrolled into view after the location is committed to history.
  hashScrollIntoView?: boolean;
  // `viewTransition` is either a boolean or function that determines if and how the browser will call document.startViewTransition() when navigating.
  viewTransition?: boolean;
  // `ignoreBlocker` is a boolean that determines if navigation should ignore any blockers that might prevent it.
  ignoreBlocker?: boolean;
  // `reloadDocument` is a boolean that determines if navigation to a route inside of router will trigger a full page load instead of the traditional SPA navigation.
  reloadDocument?: boolean;
  // `href` is a string that can be used in place of `to` to navigate to a full built href, e.g. pointing to an external target.
  href?: string;
};

export const DEFAULT_APP_NAVIGATE_OPTIONS: AppNavigateOptions = {
  hashScrollIntoView: false,
  href: '',
  ignoreBlocker: false,
  reloadDocument: false,
  replace: false,
  resetScroll: false,
  viewTransition: false
};

type ExactlyOneKey<T extends Record<string, unknown>> = {
  [K in keyof T]: { [P in K]-?: T[P] } & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];

export type InferAppNavigationOperationMapFromPath<Path extends AppRoute['route']> = {
  create:
    | InferAppRouteValuesFromPath<AppRoute['route']>
    | ((props: InferAppRouteValuesFromPath<Path>) => InferAppRouteValuesFromPath<AppRoute['route']>);
  update:
    | InferAppRouteValuesFromPath<AppRoute['route']>
    | ((props: InferAppRouteValuesFromPath<Path>) => InferAppRouteValuesFromPath<AppRoute['route']>);
  delete: boolean | ((props: InferAppRouteValuesFromPath<Path>) => boolean);
};

// export type InferAppNavigationOperationObjectFromPath<Path extends AppRoute['route']> = ExactlyOneKey<{
//   create: InferAppNavigationOperationMapFromPath<Path>['create'];
//   update: InferAppNavigationOperationMapFromPath<Path>['update'];
//   delete: InferAppNavigationOperationMapFromPath<Path>['delete'];
// }>;

// export type AppNavigationTarget = 'from' | 'here' | 'to' | 'at';

// export type AppNavigationOperation = 'create' | 'update' | 'delete';

export type InferAppNavigationIntentMapFromPath<Path extends AppRoute['route']> = {
  from: InferAppNavigationOperationMapFromPath<Path>;
  here: InferAppNavigationOperationMapFromPath<Path>;
  to: InferAppNavigationOperationMapFromPath<Path>;
  at: { panelKey: number } & InferAppNavigationOperationMapFromPath<Path>;
};

export type InferAppNavigationPropsFromPath<Path extends AppRoute['route']> = {
  navDeps?: DependencyList;
  navOptions?: AppNavigateOptions;
} & Partial<
  ExactlyOneKey<{
    from: ExactlyOneKey<InferAppNavigationOperationMapFromPath<Path>>;
    here: ExactlyOneKey<InferAppNavigationOperationMapFromPath<Path>>;
    to: ExactlyOneKey<InferAppNavigationOperationMapFromPath<Path>>;
    at: { panelKey: number } & ExactlyOneKey<InferAppNavigationOperationMapFromPath<Path>>;
  }>
>;

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

// prettier-ignore
export type AppNavigationStore =
  & AppLocationState
  & {
    /** Routes that are blocked from navigation */
    blockedRoutes: AppRouterBlockedRoutes
    /** Check if this navigation should replace the current history entry */
    options?: AppNavigateOptions;
  };

export type AppRouterState = Pick<AppNavigationStore, 'id' | 'panels' | 'routes'>;

export const DEFAULT_APP_NAVIGATION_STORE: AppNavigationStore = {
  ...DEFAULT_APP_LOCATION_STATE,
  blockedRoutes: {},
  options: { ...DEFAULT_APP_NAVIGATE_OPTIONS }
};
