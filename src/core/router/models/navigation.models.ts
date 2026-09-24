import type {
  AppRouterBlockedPages,
  AppRouterNode,
  AppRouterPage,
  AppRouterPanel,
  AppRouterStore,
  InferAppRouteFromPath,
  InferAppRouteParamFromPath,
  useAppNavigate
} from 'core/router';
import type { InferSearchParamSnapshotFromEngine } from 'features/search-params';
import type { DependencyList } from 'react';
import type { Location as ReactRouterLocation } from 'react-router';

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

export type InferAppNavigationInputFromPath<Origin extends AppRoute['path']> =
  | InferAppRouteParamFromPath<Origin>
  | string
  | ReactRouterLocation;

export type InferAppNavigationOperationMapFromPath<Origin extends AppRoute['path']> = {
  create:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteParamFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  update:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteParamFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  search:
    | InferSearchParamSnapshotFromEngine<InferAppRouteFromPath<Origin>['search']>
    | ((
        props: InferSearchParamSnapshotFromEngine<InferAppRouteFromPath<Origin>['search']>
      ) => InferSearchParamSnapshotFromEngine<InferAppRouteFromPath<Origin>['search']>);
  only:
    | InferAppNavigationInputFromPath<Origin>
    | ((props: InferAppRouteParamFromPath<Origin>) => InferAppNavigationInputFromPath<Origin>);
  closePanel:
    | InferAppNavigationInputFromPath<AppRoute['path']>
    | ((props: InferAppRouteParamFromPath<Origin>) => InferAppNavigationInputFromPath<AppRoute['path']>);
  delete: boolean | ((props: InferAppRouteParamFromPath<Origin>) => boolean);
};

export type InferAppNavigationPropsFromPath<Origin extends AppRoute['path']> = {
  nav?: (navigate: ReturnType<typeof useAppNavigate<Origin>>) => void;
  navDeps?: DependencyList;
};

export type ExtractNavReturn<Origin extends AppRoute['path']> = {
  target: 'from' | 'here' | 'to' | 'at' | null;
  panelKey: number | null;
  operation: 'create' | 'update' | 'search' | 'only' | 'closePanel' | null;
  options: AppNavigateOptions;
  dispatch:
    | InferAppNavigationOperationMapFromPath<Origin>['create']
    | InferAppNavigationOperationMapFromPath<Origin>['update']
    | InferAppNavigationOperationMapFromPath<Origin>['search']
    | InferAppNavigationOperationMapFromPath<Origin>['only']
    | InferAppNavigationOperationMapFromPath<Origin>['closePanel']
    | null;
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
  /** Page entries keyed by unique ID. */
  pages: Record<string, AppRouterPage>;
  /** Pages that are blocked from navigation */
  blockedPages: AppRouterBlockedPages;
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
