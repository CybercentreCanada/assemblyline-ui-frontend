import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';
import type { Location, NavigateOptions, To } from 'react-router';
import { createReversePortalNode } from '../components/Portals';
import {
  ParamsBlueprint,
  ParamsBlueprints,
  ParamsValues,
  PathParamValue,
  RouterRoute,
  RouterState,
  RouterStore
} from '../models/router.models';
import { RoutePanel } from '../providers/PanelProvider';

const DEFAULT_ROUTER_STORE: RouterStore = {
  maxPanels: 3,
  maxNodes: 3,
  panels: [],
  nodes: {},
  routes: {}
};

const generateRandomUUID = (existingUUIDs: string[] = []) => {
  let uuid = null;

  while (uuid === null || existingUUIDs.findIndex(u => u === uuid) >= 0) {
    uuid = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(12))));
  }

  return uuid;
};

//*****************************************************************************************
// Route
//*****************************************************************************************

const sanitizeRoutes = (store: RouterStore): RouterStore => {
  const activeRoutes = new Set<string>();

  for (const panel of store.panels) {
    if (!panel) continue;

    if (panel.route) activeRoutes.add(panel.route);

    if (panel.tabbedRoutes) {
      for (const route of panel.tabbedRoutes) activeRoutes.add(route);
    }

    if (panel.pinnedRoutes) {
      for (const route of panel.pinnedRoutes) activeRoutes.add(route);
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

const pushNewRoute = (store: RouterStore, newRoute: RouterRoute, fromPanelKey: number): RouterStore => {
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { href: null, state: null, ...newRoute };

  const maxPanels = store.maxPanels;
  const nextPanelKey = fromPanelKey + 1;

  if (nextPanelKey >= maxPanels) {
    for (let i = 0; i < maxPanels - 1; i++) {
      store.panels[i].route = store.panels[i + 1].route;
      store = usingNode(store, i);
    }
    store.panels[nextPanelKey - 1].route = newRouteKey;
    store = usingNode(store, nextPanelKey - 1);
  } else if (nextPanelKey >= store.panels.length) {
    store.panels.push({ route: newRouteKey, pinnedRoutes: [], tabbedRoutes: [] });
  } else {
    store.panels[nextPanelKey].route = newRouteKey;
  }

  return store;
};

const loopNewRoute = (store: RouterStore, newRoute: RouterRoute, fromPanelKey: number): RouterStore => {
  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = newRoute;

  const maxPanels = store.maxPanels;
  const nextPanelKey = fromPanelKey + 1;

  if (nextPanelKey >= maxPanels) {
    store.panels[0].route = newRouteKey;
    store = usingNode(store, 0);
  } else if (nextPanelKey >= store.panels.length) {
    store.panels.push({ route: newRouteKey, pinnedRoutes: [], tabbedRoutes: [] });
    store = usingNode(store, store.panels.length - 1);
  } else {
    store.panels[nextPanelKey].route = newRouteKey;
  }

  return store;
};

const splicePanel = (store: RouterStore, panelKey: number): RouterStore => {
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

const addNode = (store: RouterStore, panelKey: number): RouterStore => {
  store.nodes[generateRandomUUID(Object.keys(store.nodes))] = {
    // panelKey,
    routeKey: store.panels[panelKey].route,
    portal: createReversePortalNode(),
    lastUsedAt: generateLastUsedAt(store)
  };

  return store;
};

const usingNode = (store: RouterStore, panelKey: number): RouterStore => {
  for (const nodeKey in store.nodes) {
    if (store.panels[panelKey].route === store.nodes[nodeKey].routeKey) {
      store.nodes[nodeKey].lastUsedAt = generateLastUsedAt(store);
    }
  }

  return store;
};

const removeNode = (store: RouterStore): RouterStore => {
  let nodeKeyToRemove = null;
  let lowestLastUsedAt = Infinity;

  // make sure its not being used
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
  // debugger;
  for (const [panelKey, panel] of store.panels.entries()) {
    let exists = false;
    for (const nodeKey in store.nodes) {
      // remap here
      if (panel.route === store.nodes[nodeKey].routeKey) {
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

// const sanitizeNodes = (store: RouterStore): RouterStore => {
//   const maxAllowedNodes = store.maxPanels + store.maxNodes;
//   const validPairKey = (panelKey: number, routeKey: string) => `${panelKey}::${routeKey}`;
//   const nodes = Object.entries(store.nodes);

//   const validPairs = new Set<string>();
//   for (const [panelKey, panel] of store.panels.entries()) {
//     if (panel?.route && panel.route in store.routes) {
//       validPairs.add(validPairKey(panelKey, panel.route));
//     }
//   }

//   // Keep only nodes that still match an existing panel-route pair.
//   let activeNodes = nodes.filter(([, node]) => validPairs.has(validPairKey(node.panelKey, node.routeKey)));

//   // Ensure each panel-route pair has a node connection.
//   for (const [panelKey, panel] of store.panels.entries()) {
//     if (!panel?.route) continue;
//     if (!(panel.route in store.routes)) continue;

//     const currentPair = validPairKey(panelKey, panel.route);
//     const hasNode = activeNodes.some(([, node]) => validPairKey(node.panelKey, node.routeKey) === currentPair);
//     if (hasNode) continue;

//     if (activeNodes.length < maxAllowedNodes) {
//       const newNodeKey = generateRandomUUID(Object.keys(store.nodes));
//       activeNodes.push([
//         newNodeKey,
//         {
//           panelKey,
//           routeKey: panel.route,
//           portal: createReversePortalNode(),
//           lastUsedAt: newLastUsedAt(store)
//         }
//       ]);
//       continue;
//     }

//     // At capacity: remap the oldest node.
//     if (activeNodes.length > 0) {
//       let oldestIndex = 0;
//       let oldestTime = activeNodes[0][1].lastUsedAt ?? 0;

//       for (let i = 1; i < activeNodes.length; i++) {
//         const time = activeNodes[i][1].lastUsedAt ?? 0;
//         if (time < oldestTime) {
//           oldestTime = time;
//           oldestIndex = i;
//         }
//       }

//       activeNodes[oldestIndex][1].panelKey = panelKey;
//       activeNodes[oldestIndex][1].routeKey = panel.route;
//       activeNodes[oldestIndex][1].lastUsedAt = newLastUsedAt(store);
//     }
//   }

//   // If overflow exists, remove oldest nodes until capacity is respected.
//   if (activeNodes.length > maxAllowedNodes) {
//     const indexesByOldest = activeNodes
//       .map(([, node], index) => ({ index, time: node.lastUsedAt ?? 0 }))
//       .sort((a, b) => a.time - b.time);

//     const toDelete = activeNodes.length - maxAllowedNodes;
//     const deleteSet = new Set(indexesByOldest.slice(0, toDelete).map(item => item.index));
//     activeNodes = activeNodes.filter((_, index) => !deleteSet.has(index));
//   }

//   store.nodes = Object.fromEntries(activeNodes);

//   return store;
// };

//*****************************************************************************************
// Panel
//*****************************************************************************************
const sanitizePanels = (store: RouterStore): RouterStore => {
  for (let i = store.panels.length - 1; i >= 0; i--) {
    if (!store.panels[i].route || !(store.panels[i].route in store.routes)) {
      store.panels.splice(i, 1);

      // for (let j = store.nodes.length - 1; j >= 0; j--) {
      //   if (store.nodes[j].panelKey > i) store.nodes[j].panelKey -= 1;
      //   else if (store.nodes[j].panelKey === i) store.nodes.splice(j, 1);
      // }
    }
  }

  return store;
};

const findPanelFromRoute = (store: RouterStore, routeKey: string): number => {
  for (const [panelKey, panel] of store.panels.entries()) {
    if (panel.route === routeKey) {
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
        if (store?.panels?.[i]) store.panels[i].route = panel.route;
        else store.panels[i] = { route: panel.route, pinnedRoutes: [], tabbedRoutes: [] };
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
        nextPanels.push({ route: newRouteKey, pinnedRoutes: [], tabbedRoutes: [] });

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

  return {
    maxPanels: store.maxPanels,
    maxNodes: store.maxNodes,
    panels: [{ route: 'default', pinnedRoutes: [], tabbedRoutes: [] }],
    // nodes: { default: { panelKey: 0, routeKey: 'default', portal: createReversePortalNode(), lastUsedAt: 0 } },
    nodes: { default: { routeKey: 'default', portal: createReversePortalNode(), lastUsedAt: 0 } },
    routes: { default: { href: '/submit', state: null } }
  };
};

export type storeToNavigateToReturnType = {
  to: To;
  options: NavigateOptions;
};

export const storeToNavigateTo = (store: RouterStore): storeToNavigateToReturnType => {
  const searchParams = new URLSearchParams();

  store.panels.forEach((panel, i) => {
    searchParams.append('p', store.routes[panel.route].href);
  });

  return {
    to: { search: `/?${searchParams.toString()}` },
    options: { state: { panels: store.panels, routes: store.routes } }
  };
};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

export const navigateOpenRoute = (
  store: RouterStore,
  href: string,
  currentRouteKey: string
): storeToNavigateToReturnType => {
  const currentPanelKey = findPanelFromRoute(store, currentRouteKey);

  if (currentPanelKey >= 0) {
    store = pushNewRoute(store, { href }, currentPanelKey);
    store = sanitizePanels(store);
    store = sanitizeNodes(store);
    store = sanitizeRoutes(store);
  }

  // const currentPanelIndex = store.panels.findIndex(p => p.route === currentRouteKey);
  // const nextPanelIndex = currentPanelIndex + 1 >= store.maxPanels ? 0 : currentPanelIndex + 1;

  // let newRouteKey = null;
  // while (newRouteKey === null || newRouteKey in store.routes) {
  //   newRouteKey = generateRandomUUID();
  // }
  // store.routes[newRouteKey] = { href, state: null };

  // if (nextPanelIndex >= store.panels.length) {
  //   store.panels.push({ route: newRouteKey, pinnedRoutes: [], tabbedRoutes: [] });
  // } else {
  //   store.panels[nextPanelIndex].route = newRouteKey;
  // }

  console.log(store);

  return storeToNavigateTo(store);
};

//*****************************************************************************************
// Panel
//*****************************************************************************************
export const closeRouterPanel = (store: RouterStore, panelKey: number): storeToNavigateToReturnType => {
  store.panels.splice(panelKey, 1);
  // Object.values(store.nodes).map(node => {
  //   if (node.panelKey === panelKey) node.panelKey = null;
  //   return node;
  // });

  return storeToNavigateTo(store);
};

//*****************************************************************************************
// Path
//*****************************************************************************************

export const buildPath = <Path extends string>(path: Path, params: Record<string, PathParamValue>) => {
  return path.replace(/:([^/]+)/g, (_, key: string) => {
    const value = params[key];
    return encodeURIComponent(String(value));
  });
};

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

export type Params<Path extends string> = null;

export const buildParams = <Path extends string>(path: Path) => {};

//*****************************************************************************************
// Router
//*****************************************************************************************

export const getTargetPanel = (fromPanel: RoutePanel | null = 'panel-0', panel?: RoutePanel): RoutePanel => {
  if (panel) return panel;
  if (!fromPanel || fromPanel === 'panel-0') return 'panel-1';
  if (fromPanel === 'panel-1') return 'panel-2';
  if (fromPanel === 'panel-2') return 'panel-1';
  return 'panel-1';
};

export const withParams = (path: string, params?: Record<string, string | number | boolean>) => {
  if (!params) return path;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
    path
  );
};

export const toSearchString = (search?: Record<string, unknown>) => {
  if (!search) return '';
  const searchParams = new URLSearchParams();
  Object.entries(search).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)));
      return;
    }
    searchParams.set(key, String(value));
  });
  const value = searchParams.toString();
  return value ? `?${value}` : '';
};

export const upsertRouteInStore = (state: RouterStore, href: string, path: string): RouterStore => {
  const routeId = href;
  const routeKeys = state.routes.keys.includes(routeId) ? state.routes.keys : [...state.routes.keys, routeId];
  const routeEntries = {
    ...state.routes.entries,
    [routeId]: {
      href,
      state: state.routes.entries[routeId]?.state ?? null
    }
  };

  return {
    ...state,
    routes: {
      keys: routeKeys,
      entries: routeEntries
    }
  };
};

export const assignRouteToPanel = (state: RouterStore, panelId: string, routeId: string): RouterStore => {
  const panel = state.panels.entries[panelId];
  if (!panel) return state;

  let nodeKey = panel.nodeKey;
  if (!nodeKey) {
    const freeNodeKey = state.nodes.keys.find(key => !state.nodes.entries[key]?.routeKey);
    if (freeNodeKey) {
      nodeKey = freeNodeKey;
    } else {
      const leastUsedNodeKey =
        state.nodes.keys.reduce((oldestKey, currentKey) => {
          const oldest = state.nodes.entries[oldestKey];
          const current = state.nodes.entries[currentKey];
          return current.lastUsedAt < oldest.lastUsedAt ? currentKey : oldestKey;
        }, state.nodes.keys[0]) ?? null;
      nodeKey = leastUsedNodeKey;
    }
  }

  if (!nodeKey) return state;

  const node = state.nodes.entries[nodeKey];
  if (!node) return state;

  const nodesEntries = {
    ...state.nodes.entries,
    [nodeKey]: {
      ...node,
      routeKey: routeId,
      lastUsedAt: Date.now()
    }
  };

  const panelsEntries = {
    ...state.panels.entries,
    [panelId]: {
      ...panel,
      nodeKey,
      tabbedRoutes: panel.tabbedRoutes.includes(routeId) ? panel.tabbedRoutes : [...panel.tabbedRoutes, routeId]
    }
  };

  return {
    ...state,
    nodes: { ...state.nodes, entries: nodesEntries },
    panels: { ...state.panels, entries: panelsEntries }
  };
};
