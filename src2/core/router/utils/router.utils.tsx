import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';
import type { Location, NavigateOptions, To } from 'react-router';
import { createReversePortalNode } from '../components/Portals';
import {
  ParamsBlueprint,
  ParamsBlueprints,
  ParamsValues,
  PathParamValue,
  RouterState,
  RouterStore
} from '../models/router.models';
import { RoutePanel } from '../providers/PanelProvider';

export const generateRandomUUID = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(12))));

//*****************************************************************************************
// Location
//*****************************************************************************************

export const parseLocationToRouterStore = (store: RouterStore, location: Location<RouterState>): RouterStore => {
  try {
    if (!!location.state) {
      console.log(location.state);

      // Panels
      location.state.panels.forEach((panel, i) => {
        if (store?.panels?.[i]) store.panels[i].route = panel.route;
        else store.panels[i] = { route: panel.route, pinnedRoutes: [], tabbedRoutes: [] };
      });
      store.panels.splice(location.state.panels.length + 1);

      // Routes
      Object.entries(location.state.routes).forEach(([key, route], i) => {
        if (store?.routes?.[key]) {
          store.routes[key].href = route.href;
          store.routes[key].state = route.state;
        } else {
          store.routes[key] = { href: route.href, state: route.state };
        }
      });

      Object.keys(store.routes)
        .filter(k => !(k in location.state.routes))
        .forEach(key => {
          delete store.routes[key];
        });

      // Nodes
      store.panels.forEach((panel, i) => {
        const nodeIndex = store.nodes.findIndex(n => n.panelKey === i);

        if (nodeIndex >= 0) store.nodes[nodeIndex].routeKey = panel.route;
        else
          store.nodes.push({
            panelKey: i,
            routeKey: panel.route,
            portal: createReversePortalNode(),
            lastUsedAt: 0
          });
      });

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
      const nextNodes: RouterStore['nodes'] = [];
      const nextRoutes: RouterStore['routes'] = {};

      hrefs.map((href, i) => {
        let newRouteID = null;
        while (newRouteID === null || newRouteID in nextRoutes) {
          newRouteID = generateRandomUUID();
        }

        nextRoutes[newRouteID] = { href, state: null };
        nextPanels.push({ route: newRouteID, pinnedRoutes: [], tabbedRoutes: [] });
        nextNodes.push({
          panelKey: nextPanels.length - 1,
          routeKey: newRouteID,
          portal: createReversePortalNode(),
          lastUsedAt: 0
        });
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
    nodes: [{ panelKey: 0, routeKey: 'default', portal: createReversePortalNode(), lastUsedAt: 0 }],
    routes: { default: { href: '/submit', state: null } }
  };

  const primaryHref = '/submit';

  const stateRoutes = state?.routes ?? [];
  const routeKeys: string[] = [];
  const routeEntries: RouterStore['routes']['entries'] = {};

  if (stateRoutes.length > 0) {
    stateRoutes.forEach(route => {
      routeKeys.push(route.key);
      routeEntries[route.key] = { href: route.href, state: route.state };
    });
  } else {
    const key = 'route-1';
    routeKeys.push(key);
    routeEntries[key] = { href: primaryHref, state: null };
  }

  const hrefToRouteKey = Object.entries(routeEntries).reduce<Record<string, string>>((acc, [key, route]) => {
    acc[route.href] = key;
    return acc;
  }, {});

  // Parse panel route overrides from URL query params: p1, p2, p3, ...
  const panelHrefOverrides = new Map<number, string>();
  const searchParams = new URLSearchParams(search ?? '');
  searchParams.forEach((value, key) => {
    const match = key.match(/^p(\d+)$/);
    if (!match || !value) return;
    const panelIndex = Number(match[1]);
    if (!Number.isFinite(panelIndex) || panelIndex < 1) return;
    panelHrefOverrides.set(panelIndex, value);
  });

  const statePanels = state?.panels ?? [];
  const panelKeys: string[] = [];
  const panelEntries: RouterStore['panels']['entries'] = {};
  const nodeKeys: string[] = [];
  const nodeEntries: RouterStore['nodes']['entries'] = {};

  const panelCount = Math.max(
    statePanels.length,
    panelHrefOverrides.size > 0 ? Math.max(...Array.from(panelHrefOverrides.keys())) : 0,
    1
  );

  const nextRouteKey = () => `route-${routeKeys.length + 1}`;
  const ensureRouteKey = (href: string) => {
    const existing = hrefToRouteKey[href];
    if (existing) return existing;
    const key = nextRouteKey();
    routeKeys.push(key);
    routeEntries[key] = { href, state: null };
    hrefToRouteKey[href] = key;
    return key;
  };

  for (let index = 0; index < panelCount; index++) {
    const panelNumber = index + 1;
    const basePanel = statePanels[index];
    const activeHref = panelHrefOverrides.get(panelNumber) ?? basePanel?.route ?? '/page1';
    const routeKey = ensureRouteKey(activeHref);
    const panelKey = `panel-${index + 1}`;
    const nodeKey = `node-${index + 1}`;

    panelKeys.push(panelKey);
    nodeKeys.push(nodeKey);

    panelEntries[panelKey] = {
      nodeKey,
      pinnedRoutes: basePanel?.pinnedRoutes ?? [],
      tabbedRoutes: basePanel?.tabbedRoutes?.length ? basePanel.tabbedRoutes : [activeHref]
    };

    nodeEntries[nodeKey] = {
      portal: createReversePortalNode(),
      routeKey,
      lastUsedAt: Date.now() - index
    };
  }

  return {
    maxPanels: Math.max(panelKeys.length, 1),
    maxNodes: Math.max(nodeKeys.length, 1),
    panels: { keys: panelKeys, entries: panelEntries },
    nodes: { keys: nodeKeys, entries: nodeEntries },
    routes: { keys: routeKeys, entries: routeEntries }
  };
};

export const parseRouterStoreToLocation = (
  { panels, routes }: RouterStore,
  { state }: Location<RouterState>
): Pick<Location<RouterState>, 'pathname' | 'search' | 'hash' | 'state'> => {
  const searchParams = new URLSearchParams();

  panels.forEach((panel, i) => {
    searchParams.append('p', routes[panel.route].href);
  });

  return {
    pathname: null,
    search: searchParams.toString(),
    hash: null,
    state
  };

  // const routes: RouterState['routes'] = store.routes.keys
  //   .map(key => {
  //     const route = store.routes.entries[key];
  //     if (!route) return null;
  //     return { key, href: route.href, state: route.state ?? null };
  //   })
  //   .filter((route): route is RouterState['routes'][number] => route !== null);

  // const panels: RouterState['panels'] = store.panels.keys
  //   .map(panelKey => {
  //     const panel = store.panels.entries[panelKey];
  //     if (!panel) return null;

  //     const node = store.nodes.entries[panel.nodeKey];
  //     const activeRouteHref = node?.routeKey ? store.routes.entries[node.routeKey]?.href : undefined;

  //     return {
  //       route: activeRouteHref ?? '/submit',
  //       tabbedRoutes: panel.tabbedRoutes,
  //       pinnedRoutes: panel.pinnedRoutes
  //     };
  //   })
  //   .filter((panel): panel is RouterState['panels'][number] => panel !== null);

  // const panelSearchParams = new URLSearchParams();
  // panels.forEach((panel, index) => {
  //   panelSearchParams.set(`p${index + 1}`, panel.route);
  // });

  // const primaryHref = panels[0]?.route ?? '/submit';
  // const primaryUrl = new URL(primaryHref, window.location.origin);

  // return {
  //   key: null,
  //   pathname: null,
  //   search: panelSearchParams.toString() ? `?${panelSearchParams.toString()}` : '',
  //   hash: primaryUrl.hash,
  //   state: { panels, routes }
  // };
};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

export const navigateOpenRoute = (
  store: RouterStore,
  href: string,
  currentRouteKey: string
): { to: To; options: NavigateOptions } => {
  const currentPanelIndex = store.panels.findIndex(p => p.route === currentRouteKey);
  const nextPanelIndex = (currentPanelIndex + 1) % store.maxPanels;

  let newRouteKey = null;
  while (newRouteKey === null || newRouteKey in store.routes) {
    newRouteKey = generateRandomUUID();
  }
  store.routes[newRouteKey] = { href, state: null };
  store.panels[nextPanelIndex].route = newRouteKey;

  const searchParams = new URLSearchParams();

  store.panels.forEach((panel, i) => {
    searchParams.append('p', store.routes[panel.route].href);
  });

  return {
    to: { pathname: null, search: searchParams.toString(), hash: null },
    options: { state: { panels: store.panels, routes: store.routes } }
  };
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
