import { deepCompare, generateRandomUUID } from 'core/app/utils/app.utils';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';
import type { Location, NavigateOptions, To } from 'react-router';
import { createReversePortalNode } from '../components/Portals';
import { DEFAULT_ROUTER_PANEL, DEFAULT_ROUTER_ROUTE, ROUTER_STORE_EXAMPLE } from '../models/router.defaults';
import { ParamsBlueprint, ParamsBlueprints, ParamsValues, RouterState, RouterStore } from '../models/router.models';

//*****************************************************************************************
// Route
//*****************************************************************************************

/**
 * @name sanitizeRoutes
 * @description Collects all route keys currently referenced by panels and nodes, then removes unreferenced routes from the store.
 * @param store - Router store
 * @returns Updated router store with orphaned routes removed
 */
export const sanitizeRoutes = (store: RouterStore): RouterStore => {
  const activeRoutes = new Set<string>();

  for (const panel of store.panels) {
    if (!panel) continue;

    if (panel.routeKey) activeRoutes.add(panel.routeKey);

    if (panel.temporaryRouteKey) activeRoutes.add(panel.temporaryRouteKey);

    if (panel.tabbedRouteKeys) {
      for (const route of panel.tabbedRouteKeys) activeRoutes.add(route);
    }

    if (panel.pinnedRouteKeys) {
      for (const route of panel.pinnedRouteKeys) activeRoutes.add(route);
    }
  }

  for (const nodeKey in store.nodes) {
    if (store.nodes[nodeKey].routeKey) activeRoutes.add(store.nodes[nodeKey].routeKey);
  }

  for (const routeKey in store.routes) {
    if (!activeRoutes.has(routeKey)) {
      delete store.routes[routeKey];
    }
  }

  return store;
};

/**
 * @name insertLeftRoute
 * @description Inserts a new panel route to the left of the given panel key and, if max capacity is exceeded, removes the last panel.
 * @param store - Router store
 * @param newRoute - Route data to insert
 * @param panelKey - Target panel index to insert to the left (defaults to 0)
 * @returns Updated router store with the route inserted from the left and overflow trimmed from the end
 */
export const insertLeftRoute = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  panelKey: number = 0
): RouterStore => {
  if (store.maxPanels <= 0) return store;

  const panelIndex = Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length);
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_ROUTER_ROUTE, ...newRoute };

  store.panels.splice(panelIndex, 0, {
    ...DEFAULT_ROUTER_PANEL,
    routeKey: newRouteKey,
    tabbedRouteKeys: [newRouteKey]
  });

  if (store.panels.length > store.maxPanels) {
    store.panels.splice(-1, 1);
  }

  return store;
};

/**
 * @name insertRightRoute
 * @description Inserts a new panel route to the right of the given panel key and, if max capacity is exceeded, removes the first panel.
 * @param store - Router store
 * @param newRoute - Route data to insert
 * @param panelKey - Base panel index used to insert at panelKey + 1 (defaults to last panel)
 * @returns Updated router store with the route inserted from the right and overflow trimmed from the start
 */
export const insertRightRoute = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  panelKey: number = Math.max(store.panels.length - 1, -1)
): RouterStore => {
  if (store.maxPanels <= 0) return store;

  const panelIndex = Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length - 1);
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_ROUTER_ROUTE, ...newRoute };

  store.panels.splice(panelIndex + 1, 0, {
    ...DEFAULT_ROUTER_PANEL,
    routeKey: newRouteKey,
    tabbedRouteKeys: [newRouteKey]
  });

  if (store.panels.length > store.maxPanels) {
    store.panels.splice(0, 1);
  }

  return store;
};

/**
 * @name addRoute
 * @description Adds a new route to an existing panel, removes invalid/non-permanent tabbed routes, sets the new route as active, and appends it to the panel tabs.
 * @param store - Router store
 * @param newRoute - Route data to add
 * @param panelKey - Target panel index (clamped to valid bounds)
 * @returns Updated router store with the route added to the target panel, or unchanged when no panel exists
 */
export const addRoute = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  panelKey: number
): RouterStore => {
  if (store.panels.length === 0) return store;

  const panelIndex = Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length - 1);

  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_ROUTER_ROUTE, ...newRoute };
  store.panels[panelIndex].routeKey = newRouteKey;
  store.panels[panelIndex].temporaryRouteKey = newRouteKey;

  return store;
};

/**
 * @name findRouteKey
 * @description Finds the key of a route in the store by deep value comparison.
 * @param store - Router store
 * @param route - Route value to find
 * @returns Matching route key, or null if none is found
 */
export const findRouteKey = (store: RouterStore, route: RouterStore['routes'][string]): keyof RouterStore['routes'] => {
  Object.keys(store.routes).forEach(key => {
    if (deepCompare(route, store.routes[key])) {
      return key;
    }
  });

  return null;
};

/**
 * @name findRoute
 * @description Finds and returns a matching route object from the store by deep value comparison.
 * @param store - Router store
 * @param route - Route value to find
 * @returns Matching route object, or null if none is found
 */
export const findRoute = (store: RouterStore, route: RouterStore['routes'][string]): RouterStore['routes'][string] => {
  const key = findRouteKey(store, route);
  return key !== null ? store.routes[key] : null;
};

/**
 * @name findPanel
 * @description Finds and returns a matching route object from the store by deep value comparison.
 * @param store - Router store
 * @param route - Route value to find
 * @returns Matching route object, or null if none is found
 */
export const findPanelKey = (
  store: RouterStore,
  routeKey: keyof RouterStore['routes'],
  source: ('temporary' | 'tabbed' | 'pinned')[]
): number => {
  for (let i = 0; i < store.panels.length; i++) {
    if (source.includes('temporary') && store.panels[i].temporaryRouteKey === routeKey) return i;
    else if (source.includes('tabbed') && store.panels[i].tabbedRouteKeys.includes(routeKey)) return i;
    else if (source.includes('pinned') && store.panels[i].pinnedRouteKeys.includes(routeKey)) return i;
  }

  return null;
};

/**
 * @name setPermanentRoute
 * @description Marks a route as permanent in the store.
 * @param store - Router store
 * @param routeKey - Route key to mark as permanent
 * @returns Updated router store with the route marked permanent
 */
export const setPermanentRoute = (store: RouterStore, routeKey: keyof RouterStore['routes']): RouterStore => {
  if (!(routeKey in store.routes)) return store;

  const panelIndex = findPanelKey(store, routeKey, ['temporary']);
  if (panelIndex === null) return store;

  store.panels[panelIndex].tabbedRouteKeys.push(store.panels[panelIndex].temporaryRouteKey);
  store.panels[panelIndex].temporaryRouteKey = null;

  return store;
};

/**
 * @name setPinnedRoute
 * @description Marks a route as permanent in the store.
 * @param store - Router store
 * @param routeKey - Route key to mark as permanent
 * @returns Updated router store with the route marked permanent
 */
export const setPinnedRoute = (store: RouterStore, routeKey: keyof RouterStore['routes']): RouterStore => {
  if (!(routeKey in store.routes)) return store;

  const panelIndex = findPanelKey(store, routeKey, ['temporary', 'tabbed']);
  if (panelIndex === null) return store;

  store.panels[panelIndex].tabbedRouteKeys.push(store.panels[panelIndex].temporaryRouteKey);
  store.panels[panelIndex].temporaryRouteKey = null;

  return store;
};

/**
 * @name setUnpinnedRoute
 * @description Removes a route key from the pinned route list and keeps it as a regular tabbed route.
 * @param store - Router store
 * @param routeKey - Route key to unpin
 * @param tabIndex - Target tab index for the unpinned route
 * @returns Updated router store with the route unpinned
 */
const setUnpinnedRoute = (store: RouterStore, routeKey: keyof RouterStore['routes'], tabIndex: number): RouterStore => {
  return store;
};

/**
 * @name moveRouteKey
 * @description Moves a route key between panel tab collections.
 * @param store - Router store
 * @param routeKey - Route key to move
 * @param panelKey - Destination panel index
 * @param tabIndex - Destination tab index
 * @param tab - Destination tab collection ('pinned' or 'permanent')
 * @returns Updated router store after moving the route key
 */
const moveTabbedRouteKey = (
  store: RouterStore,
  routeKey: keyof RouterStore['routes'],
  panelKey: number,
  tabIndex: number,
  tab: 'pinned' | 'tab'
): RouterStore => {
  if (
    !(routeKey in store.routes) ||
    panelKey < 0 ||
    panelKey >= store.panels.length ||
    (tab === 'tab' && (tabIndex < 0 || tabIndex >= store.panels[panelKey].tabbedRouteKeys.length))
  )
    return store;

  // Remove source

  // Add destination
  if (tab === 'pinned') {
  } else {
  }

  // Set it permanent

  // Set it in the panel

  return store;
};

// TODO
const insertRouteAtIndex = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  panelKey: number,
  evictionDirection: 'head' | 'tail'
): RouterStore => {
  return store;
};

//TODO
const replaceRouteAtIndex = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  panelKey: number
): RouterStore => {
  return store;
};

const openNewRouteAtPanelKey = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  toPanelKey: number
): RouterStore => {
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_ROUTER_ROUTE, ...newRoute };
  const maxPanels = store.maxPanels;

  if (toPanelKey < 0) {
    // TODO
    // for (let i = 0; i < maxPanels - 1; i++) {
    //   store.panels[i].route = store.panels[i + 1].route;
    //   store = updateNodeLastUsed(store, i);
    // }
    // store.panels[toPanelKey].route = newRouteKey;
    // store = updateNodeLastUsed(store, toPanelKey);
  } else if (toPanelKey >= maxPanels) {
    for (let i = 0; i < maxPanels - 1; i++) {
      store.panels[i].routeKey = store.panels[i + 1].routeKey;
      store = updateNodeLastUsed(store, i);
    }
    store.panels[toPanelKey - 1].routeKey = newRouteKey;
    store = updateNodeLastUsed(store, toPanelKey - 1);
  } else if (toPanelKey >= store.panels.length) {
    store.panels.push({ ...DEFAULT_ROUTER_PANEL, routeKey: newRouteKey });
  } else {
    store.panels[toPanelKey].routeKey = newRouteKey;
  }

  return store;
};

const pushNewRoute = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  fromPanelKey: number
): RouterStore => {
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_ROUTER_ROUTE, ...newRoute };

  const maxPanels = store.maxPanels;
  const nextPanelKey = fromPanelKey + 1;

  if (nextPanelKey >= maxPanels) {
    for (let i = 0; i < maxPanels - 1; i++) {
      store.panels[i].routeKey = store.panels[i + 1].routeKey;
      store = updateNodeLastUsed(store, i);
    }
    store.panels[nextPanelKey - 1].routeKey = newRouteKey;
    store = updateNodeLastUsed(store, nextPanelKey - 1);
  } else if (nextPanelKey >= store.panels.length) {
    store.panels.push({ ...DEFAULT_ROUTER_PANEL, routeKey: newRouteKey });
  } else {
    store.panels[nextPanelKey].routeKey = newRouteKey;
  }

  return store;
};

const loopNewRoute = (
  store: RouterStore,
  newRoute: RouterStore['routes'][string],
  fromPanelKey: number
): RouterStore => {
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = newRoute;

  const maxPanels = store.maxPanels;
  const nextPanelKey = fromPanelKey + 1;

  if (nextPanelKey >= maxPanels) {
    store.panels[0].routeKey = newRouteKey;
    store = updateNodeLastUsed(store, 0);
  } else if (nextPanelKey >= store.panels.length) {
    store.panels.push({ ...DEFAULT_ROUTER_PANEL, routeKey: newRouteKey });
    store = updateNodeLastUsed(store, store.panels.length - 1);
  } else {
    store.panels[nextPanelKey].routeKey = newRouteKey;
  }

  return store;
};

const updateRoute = (store: RouterStore, route: RouterStore['routes'][string], routeKey: string): RouterStore => {
  store.routes[routeKey] = { ...store.routes[routeKey], ...route };
  return store;
};

const removePanel = (store: RouterStore, panelKey: number): RouterStore => {
  if (panelKey >= 0 && panelKey < store.panels.length) {
    store.panels.splice(panelKey, 1);
  }

  return store;
};

//*****************************************************************************************
// Node
//*****************************************************************************************

const generateLastUsedAt = (store: RouterStore): number =>
  Math.max(0, ...Object.values(store.nodes).map(n => n.lastUsedAt)) + 1;

const rebaseAllLastUsedAt = (store: RouterStore): RouterStore => {
  const min = Math.min(...Object.values(store.nodes).map(x => x.lastUsedAt));

  for (const key in store.nodes) {
    store.nodes[key].lastUsedAt -= min;
  }

  return store;
};

const addNode = (store: RouterStore, panelKey: number): RouterStore => {
  store.nodes[generateRandomUUID(Object.keys(store.nodes))] = {
    routeKey: store.panels[panelKey].routeKey,
    portal: createReversePortalNode(),
    lastUsedAt: generateLastUsedAt(store)
  };

  return store;
};

const updateNodeLastUsed = (store: RouterStore, panelKey: number): RouterStore => {
  const nextLastUsedAt = generateLastUsedAt(store);
  for (const nodeKey in store.nodes) {
    if (store.panels[panelKey].routeKey === store.nodes[nodeKey].routeKey) {
      store.nodes[nodeKey].lastUsedAt = nextLastUsedAt;
    }
  }

  if (nextLastUsedAt > store.maxNodes + store.maxPanels + 50) {
    store = rebaseAllLastUsedAt(store);
  }

  return store;
};

const removeNode = (store: RouterStore): RouterStore => {
  let nodeKeyToRemove = null;
  let lowestLastUsedAt = Infinity;

  for (const nodeKey in store.nodes) {
    if (store.nodes[nodeKey].lastUsedAt < lowestLastUsedAt) {
      lowestLastUsedAt = store.nodes[nodeKey].lastUsedAt;
      nodeKeyToRemove = nodeKey;
    }
  }

  if (nodeKeyToRemove) {
    delete store.nodes[nodeKeyToRemove];
  }

  return store;
};

const sanitizeNodes = (store: RouterStore): RouterStore => {
  for (const [panelKey, panel] of store.panels.entries()) {
    let exists = false;
    for (const nodeKey in store.nodes) {
      if (panel.routeKey === store.nodes[nodeKey].routeKey) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      store = addNode(store, panelKey);
    }
  }

  while (Object.keys(store.nodes).length > store.maxPanels + store.maxNodes) {
    store = removeNode(store);
  }

  return store;
};

//*****************************************************************************************
// Panel
//*****************************************************************************************
const sanitizePanels = (store: RouterStore): RouterStore => {
  for (let i = store.panels.length - 1; i >= 0; i--) {
    if (!store.panels[i].routeKey || !(store.panels[i].routeKey in store.routes)) {
      store.panels.splice(i, 1);
    }
  }

  return store;
};

const findPanelFromRoute = (store: RouterStore, routeKey: string): number => {
  for (const [panelKey, panel] of store.panels.entries()) {
    if (panel.routeKey === routeKey) {
      return panelKey;
    }
  }

  return -1;
};
//*****************************************************************************************
// Location
//*****************************************************************************************

export const locationToStore = (store: RouterStore, location: Location<RouterState>): RouterStore => {
  try {
    if (!!location.state) {
      // Panels
      location.state.panels.forEach((panel, i) => {
        if (store?.panels?.[i]) store.panels[i].routeKey = panel.routeKey;
        else store.panels[i] = { ...DEFAULT_ROUTER_PANEL, routeKey: panel.routeKey };
      });
      store.panels.splice(location.state.panels.length);

      // Routes
      Object.entries(location.state.routes).forEach(([key, route], i) => {
        if (store?.routes?.[key]) {
          store.routes[key].href = route.href;
          store.routes[key].state = route.state;
        } else {
          store.routes[key] = { href: route.href, state: route.state };
        }
      });

      store = sanitizePanels(store);
      store = sanitizeRoutes(store);
      store = sanitizeNodes(store);

      return store;
    } else if (!!location.search) {
      const searchParams = new URLSearchParams(location.search ?? '');
      const hrefs = searchParams
        .getAll('p')
        .filter(Boolean)
        .map(value => {
          try {
            const decoded = decodeURIComponent(value);
            const url = new URL(decoded, window.location.origin);
            return `${url.pathname}${url.search}${url.hash}`;
          } catch {
            return null;
          }
        })
        .filter((href): href is string => href !== null);

      const nextPanels: RouterStore['panels'] = [];
      const nextNodes: RouterStore['nodes'] = {};
      const nextRoutes: RouterStore['routes'] = {};

      hrefs.map((href, i) => {
        const newRouteKey = generateRandomUUID(Object.keys(nextRoutes));
        const newNodeKey = generateRandomUUID(Object.keys(nextNodes));

        nextRoutes[newRouteKey] = { href, state: null };
        nextPanels.push({ ...DEFAULT_ROUTER_PANEL, routeKey: newRouteKey });

        nextNodes[newNodeKey] = {
          // panelKey: nextPanels.length - 1,
          routeKey: newRouteKey,
          portal: createReversePortalNode(),
          lastUsedAt: 0
        };
      });

      return {
        maxPanels: store.maxPanels,
        maxNodes: store.maxNodes,
        panels: nextPanels,
        nodes: nextNodes,
        routes: nextRoutes
      };
    }
  } catch (e) {
    console.error('error parsing the location', e);
  }

  return { ...ROUTER_STORE_EXAMPLE, maxPanels: store.maxPanels, maxNodes: store.maxNodes };
};

export type storeToNavigateReturnType = {
  to: To;
  options: NavigateOptions;
};

export const storeToNavigate = (store: RouterStore): storeToNavigateReturnType => {
  const searchParams = new URLSearchParams();

  store.panels.forEach((panel, i) => {
    searchParams.append('p', store.routes[panel.routeKey].href);
  });

  return {
    // to: { search: `/?${searchParams.toString()}` },
    to: `/?${searchParams.toString()}`,
    options: { state: { panels: store.panels, routes: store.routes } }
  };
};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

export const openRoute = (
  store: RouterStore,
  route: RouterStore['routes'][string],
  routeKey: string
): storeToNavigateReturnType => {
  const currentPanelKey = findPanelFromRoute(store, routeKey);

  if (currentPanelKey >= 0) {
    store = pushNewRoute(store, route, currentPanelKey);
    store = sanitizePanels(store);
    store = sanitizeNodes(store);
    store = sanitizeRoutes(store);
  }

  return storeToNavigate(store);
};

export const replaceRoute2 = (
  store: RouterStore,
  route: RouterStore['routes'][string],
  routeKey: string
): storeToNavigateReturnType => {
  if (routeKey in store.routes) {
    store = updateRoute(store, route, routeKey);
  }

  return storeToNavigate(store);
};

export const openRouteAtPanelKey = (
  store: RouterStore,
  route: RouterStore['routes'][string],
  panelKey: number
): storeToNavigateReturnType => {
  if (panelKey >= 0 && panelKey < store.maxPanels) {
    if (panelKey >= store.panels.length) store = pushNewRoute(store, route, panelKey);
    else store = openNewRouteAtPanelKey(store, route, panelKey);

    store = sanitizePanels(store);
    store = sanitizeNodes(store);
    store = sanitizeRoutes(store);
  }

  return storeToNavigate(store);
};

export const moveRouteToPanelKey = (
  store: RouterStore,
  route: RouterStore['routes'][string],
  panelKey: number
): storeToNavigateReturnType => {
  // if (panelKey >= 0 && panelKey < store.maxPanels) {
  //   if (panelKey >= store.panels.length) store = pushNewRoute(store, route, panelKey);
  //   else store = openNewRouteAtPanelKey(store, route, panelKey);
  //   store = sanitizePanels(store);
  //   store = sanitizeNodes(store);
  //   store = sanitizeRoutes(store);
  // }
  // return storeToNavigate(store);
};

//*****************************************************************************************
// Panel
//*****************************************************************************************
export const closeRouterPanel = (store: RouterStore, panelKey: number): storeToNavigateReturnType => {
  store.panels.splice(panelKey, 1);

  return storeToNavigate(store);
};

//*****************************************************************************************
// Path
//*****************************************************************************************

// export const buildPath = <Path extends string>(path: Path, params: Record<string, PathParamValue>) => {
//   return path.replace(/:([^/]+)/g, (_, key: string) => {
//     const value = params[key];
//     return encodeURIComponent(String(value));
//   });
// };

//*****************************************************************************************
// Params
//*****************************************************************************************

export const PARAM_PARSERS = {
  string: (defaultValue = ''): ParamsBlueprint<string> => ({
    type: '',
    parse: value => (value === undefined ? defaultValue : value),
    stringify: value => String(value)
  }),
  number: (defaultValue = 0): ParamsBlueprint<number> => ({
    type: 0,
    parse: value => {
      if (value === undefined) return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => String(value)
  }),
  boolean: (defaultValue = false): ParamsBlueprint<boolean> => ({
    type: false,
    parse: value => {
      if (value === undefined) return defaultValue;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return defaultValue;
    },
    stringify: value => String(value)
  })
};

export const createParamsParser = <Blueprints extends ParamsBlueprints>(
  input: (parsers: typeof PARAM_PARSERS) => Blueprints
) => {
  const blueprints = input(PARAM_PARSERS);

  return {
    type: Object.keys(blueprints).reduce((acc, key) => {
      const parser = blueprints[key];
      return { ...acc, [key]: parser.type };
    }, {} as ParamsValues<Blueprints>),
    blueprints,
    parse: (raw: Record<string, string | undefined>) => {
      return Object.keys(blueprints).reduce((acc, key) => {
        const parser = blueprints[key];
        return { ...acc, [key]: parser.parse(raw[key]) };
      }, {} as ParamsValues<Blueprints>);
    },
    stringify: (params: Partial<ParamsValues<Blueprints>>) => {
      return Object.keys(params).reduce(
        (acc, key) => {
          const parser = blueprints[key];
          const value = params[key as keyof typeof params];
          if (value === undefined || value === null || !parser) return acc;
          return { ...acc, [key]: parser.stringify(value as never) };
        },
        {} as Record<string, string>
      );
    }
  };
};

//*****************************************************************************************
// Component
//*****************************************************************************************

export const toElement = (value: ReactNode | MemoExoticComponent<ComponentType<any>>) => {
  if (React.isValidElement(value)) {
    return value;
  }

  const Component = value as ComponentType<any>;
  return <Component />;
};

//*****************************************************************************************
// Other
//*****************************************************************************************

// export type Params<Path extends string> = null;

// export const buildParams = <Path extends string>(path: Path) => {};

//*****************************************************************************************
// Router
//*****************************************************************************************

// export const getTargetPanel = (fromPanel: RoutePanel | null = 'panel-0', panel?: RoutePanel): RoutePanel => {
//   if (panel) return panel;
//   if (!fromPanel || fromPanel === 'panel-0') return 'panel-1';
//   if (fromPanel === 'panel-1') return 'panel-2';
//   if (fromPanel === 'panel-2') return 'panel-1';
//   return 'panel-1';
// };

// export const withParams = (path: string, params?: Record<string, string | number | boolean>) => {
//   if (!params) return path;
//   return Object.entries(params).reduce(
//     (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
//     path
//   );
// };

// export const toSearchString = (search?: Record<string, unknown>) => {
//   if (!search) return '';
//   const searchParams = new URLSearchParams();
//   Object.entries(search).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
//     if (Array.isArray(value)) {
//       value.forEach(item => searchParams.append(key, String(item)));
//       return;
//     }
//     searchParams.set(key, String(value));
//   });
//   const value = searchParams.toString();
//   return value ? `?${value}` : '';
// };

// export const upsertRouteInStore = (state: RouterStore, href: string, path: string): RouterStore => {
//   const routeId = href;
//   const routeKeys = state.routes.keys.includes(routeId) ? state.routes.keys : [...state.routes.keys, routeId];
//   const routeEntries = {
//     ...state.routes.entries,
//     [routeId]: {
//       href,
//       state: state.routes.entries[routeId]?.state ?? null
//     }
//   };

//   return {
//     ...state,
//     routes: {
//       keys: routeKeys,
//       entries: routeEntries
//     }
//   };
// };

// export const assignRouteToPanel = (state: RouterStore, panelId: string, routeId: string): RouterStore => {
//   const panel = state.panels.entries[panelId];
//   if (!panel) return state;

//   let nodeKey = panel.nodeKey;
//   if (!nodeKey) {
//     const freeNodeKey = state.nodes.keys.find(key => !state.nodes.entries[key]?.routeKey);
//     if (freeNodeKey) {
//       nodeKey = freeNodeKey;
//     } else {
//       const leastUsedNodeKey =
//         state.nodes.keys.reduce((oldestKey, currentKey) => {
//           const oldest = state.nodes.entries[oldestKey];
//           const current = state.nodes.entries[currentKey];
//           return current.lastUsedAt < oldest.lastUsedAt ? currentKey : oldestKey;
//         }, state.nodes.keys[0]) ?? null;
//       nodeKey = leastUsedNodeKey;
//     }
//   }

//   if (!nodeKey) return state;

//   const node = state.nodes.entries[nodeKey];
//   if (!node) return state;

//   const nodesEntries = {
//     ...state.nodes.entries,
//     [nodeKey]: {
//       ...node,
//       routeKey: routeId,
//       lastUsedAt: Date.now()
//     }
//   };

//   const panelsEntries = {
//     ...state.panels.entries,
//     [panelId]: {
//       ...panel,
//       nodeKey,
//       tabbedRoutes: panel.tabbedRouteKeys.includes(routeId) ? panel.tabbedRouteKeys : [...panel.tabbedRouteKeys, routeId]
//     }
//   };

//   return {
//     ...state,
//     nodes: { ...state.nodes, entries: nodesEntries },
//     panels: { ...state.panels, entries: panelsEntries }
//   };
// };
