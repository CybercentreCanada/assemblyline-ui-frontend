import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';
import { ParamsBlueprint, ParamsBlueprints, ParamsValues, PathParamValue } from '../models/router.models';
import { RoutePanel } from '../providers/PanelProvider';
import { RouterStore } from '../providers/RouterProvider';

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
  const now = Date.now();
  const routeId = href;
  const routes = new Map(state.routes);
  const existing = routes.get(routeId);
  routes.set(routeId, existing ? { ...existing, path, href, lastVisitedAt: now } : { path, href, lastVisitedAt: now });

  return { ...state, routes };
};

export const assignRouteToPanel = (state: RouterStore, panelId: string, routeId: string): RouterStore => {
  const panels = new Map(state.panels);
  const panel = panels.get(panelId) ?? { nodeId: null, tabbedRouteIds: [] };

  let nodeId = panel.nodeId;
  const nodes = new Map(state.nodes);

  if (!nodeId) {
    const freeNode = Array.from(nodes.entries()).find(([, node]) => !node.routeId);
    if (freeNode) {
      nodeId = freeNode[0];
    } else {
      const leastUsedNode = Array.from(nodes.entries()).reduce((oldest, current) => {
        return current[1].lastUsedAt < oldest[1].lastUsedAt ? current : oldest;
      });
      nodeId = leastUsedNode?.[0] ?? null;
    }
  }

  if (!nodeId) return state;

  const now = Date.now();
  const currentNode = nodes.get(nodeId);
  if (!currentNode) return state;
  nodes.set(nodeId, {
    ...currentNode,
    routeId,
    lastUsedAt: now
  });

  panels.set(panelId, {
    ...panel,
    nodeId,
    tabbedRouteIds: panel.tabbedRouteIds.includes(routeId) ? panel.tabbedRouteIds : [...panel.tabbedRouteIds, routeId]
  });

  return { ...state, nodes, panels };
};
