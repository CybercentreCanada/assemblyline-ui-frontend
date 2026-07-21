import type { useAppNavigate } from 'core/router';
import type { InferAppRouteSpecFromPath, InferAppRouteValuesFromPath } from 'core/routes';
import type { ReversePortalNode } from 'features/portal';
import type { InferSearchParamSnapshotFromEngine } from 'features/search-params';
import type { DependencyList } from 'react';
import type { Location as ReactRouterLocation } from 'react-router';

//*****************************************************************************************
// Panel
//*****************************************************************************************

/** Represents a single panel in the multi-panel router. */
export type AppRouterPanel = {
  /** Currently active route key for this panel. */
  routeKey: keyof AppRouterStore['routes'];
  // /** Keys of pinned routes in this panel. */
  // pinnedRouteKeys: (keyof AppRouterStore['routes'])[];
  // /** Keys of tabbed routes in this panel. */
  // tabbedRouteKeys: (keyof AppRouterStore['routes'])[];
  // /** Key of the temporary (unsaved) route. */
  // temporaryRouteKey: keyof AppRouterStore['routes'];
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

//*****************************************************************************************
// Route
//*****************************************************************************************

/** Represents a single route entry in the router. */
export type AppRouterRoute<State = unknown, Transient = unknown> = {
  /** Deterministic content-addressable hash generated from {href, state}. Enables fast route identity comparison. */
  digest: string;
  /** Full href string for this route. */
  href: string;
  /** Route state payload. */
  state?: State;
  /** Route transient payload. */
  transient?: Transient;
  /** Age counter for eviction priority. */
  age?: number;
  /** Scroll position for this route. */
  scroll?: number;
};

export type RouteKeyOf<Store extends AppLocationState> = Extract<keyof Store['routes'], string>;

//*****************************************************************************************
// Blocker
//*****************************************************************************************

/** Route blocker registry keyed by route ids. */
export type AppRouterBlockedRoutes = Record<keyof AppRouterStore['routes'], unknown>;

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
  routes: Record<string, Pick<AppRouterRoute, 'href' | 'state' | 'scroll'>>;
};

export type AppRouterState = Pick<AppNavigationStore, 'id' | 'panels' | 'routes'>;

//*****************************************************************************************
// Router
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
export type AppRouterStore = {
  /** Store revision id for sync checks. */
  id: string;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Portal node cache. */
  nodes: Record<string, AppRouterNode>;
  /** Route entries keyed by unique ID. */
  routes: Record<string, AppRouterRoute>;
};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

export type AppNavigateOptions = {
  // `hashScrollIntoView` is a boolean or object that determines whether an id matching the hash will be scrolled into view after the location is committed to history.
  hashScrollIntoView?: boolean;
  // `href` is a string that can be used in place of `to` to navigate to a full built href, e.g. pointing to an external target.
  href?: string;
  // `ignoreBlocker` is a boolean that determines if navigation should ignore any blockers that might prevent it.
  ignoreBlocker?: boolean;
  // `nextTitle` defines the next document title
  nextTitle?: string;
  // `reloadDocument` is a boolean that determines if navigation to a route inside of router will trigger a full page load instead of the traditional SPA navigation.
  reloadDocument?: boolean;
  // `replace` is a boolean that determines whether the navigation should replace the current history entry or push a new one.
  replace?: boolean;
  // `resetScroll` is a boolean that determines whether scroll position will be reset to 0,0 after the location is committed to browser history.
  resetScroll?: boolean;
  // `viewTransition` is either a boolean or function that determines if and how the browser will call document.startViewTransition() when navigating.
  viewTransition?: boolean;
};

export type InferAppNavigationInputFromPath<Origin extends AppRoute['route']> =
  | InferAppRouteValuesFromPath<Origin>
  | string
  | ReactRouterLocation;

export type InferAppNavigationOperationMapFromPath<Origin extends AppRoute['route']> = {
  create:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteValuesFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  update:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteValuesFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  search:
    | InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Origin>['search']>
    | ((
        props: InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Origin>['search']>
      ) => InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Origin>['search']>);
  only:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteValuesFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  closePanel: boolean | ((props: InferAppRouteValuesFromPath<Origin>) => boolean);
  delete: boolean | ((props: InferAppRouteValuesFromPath<Origin>) => boolean);
};

export type InferAppNavigationPropsFromPath<Origin extends AppRoute['route']> = {
  nav?: (navigate: ReturnType<typeof useAppNavigate<Origin>>) => void;
  navDeps?: DependencyList;
};

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
export type AppNavigationStore = {
  /** Store revision id for sync checks. */
  id: string;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Portal node cache. */
  nodes: Record<string, Omit<AppRouterNode, 'portal'>>;
  /** Route entries keyed by unique ID. */
  routes: Record<string, AppRouterRoute>;
  /** Routes that are blocked from navigation */
  blockedRoutes: AppRouterBlockedRoutes;
  /** Check if this navigation should replace the current history entry */
  options?: AppNavigateOptions;
};

/**
 * Compatible overlap between router and navigation stores.
 * Keeps only shared keys and narrows each key to the mutually usable shape.
 */
export type AppSharedRouterStore = {
  [Key in keyof AppRouterStore & keyof AppNavigationStore]: AppRouterStore[Key] extends AppNavigationStore[Key]
    ? AppNavigationStore[Key]
    : AppNavigationStore[Key] extends AppRouterStore[Key]
      ? AppRouterStore[Key]
      : never;
};
