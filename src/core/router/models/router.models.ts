import type { ReversePortalNode } from 'features/portal';

//*****************************************************************************************
// Router Panel
//*****************************************************************************************

/** Represents a single panel in the multi-panel router. */
export type AppRouterPanel = {
  /** Currently active route key for this panel. */
  pageKey: keyof AppRouterStore['pages'];
  // /** Keys of pinned routes in this panel. */
  // pinnedPageKeys: (keyof AppRouterStore['pages'])[];
  // /** Keys of tabbed routes in this panel. */
  // tabbedPageKeys: (keyof AppRouterStore['pages'])[];
  // /** Key of the temporary (unsaved) route. */
  // temporaryPageKey: keyof AppRouterStore['pages'];
};

//*****************************************************************************************
// Router Node
//*****************************************************************************************

/** Represents a cached portal node in the router. */
export type AppRouterNode = {
  /** Reverse portal node reference. */
  portal: ReversePortalNode;
  /** Route key this node renders. */
  pageKey: keyof AppRouterStore['pages'];
};

//*****************************************************************************************
// Router Page
//*****************************************************************************************

/** Represents a single page entry in the router. */
export type AppRouterPage<State = unknown, Transient = unknown> = {
  /** Deterministic content-addressable hash generated from {href, state}. Enables fast route identity comparison. */
  digest: string;
  /** Full href string for this page. */
  href: string;
  /** Page state payload. */
  state?: State;
  /** Page transient payload. */
  transient?: Transient;
  /** Age counter for eviction priority. */
  age?: number;
  /** Scroll position for this page. */
  scroll?: number;
};

//*****************************************************************************************
// Router Store
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
export type AppRouterStore = {
  /** Store revision id for sync checks. */
  id: string;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Portal node cache. */
  nodes: Record<string, AppRouterNode>;
  /** Page entries keyed by unique ID. */
  pages: Record<string, AppRouterPage>;
};
