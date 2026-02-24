import { createStoreContext } from 'core/store/createStoreContext';
import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { createReversePortalNode, type ReversePortalNode } from '../components/Portals';
import type { NavigateTo } from '../hooks/useNavigate';
import {
  assignRouteToPanel,
  getTargetPanel,
  toSearchString,
  upsertRouteInStore,
  withParams
} from '../utils/router.utils';
import type { RoutePanel } from './PanelProvider';

// ********************************************************************************************
// Router Store
// ********************************************************************************************

export type RouteInstance = {
  id: string;
  pathname: string;
  search?: string;
  hash?: string;
  state?: any;
};

export type NodeState = {
  id: string;
  portal: ReversePortalNode;
  routeKey: string | null;
  lastUsedAt: number;
};

export type PanelState = {
  id: string;
  nodeKey: string | null;
  tabbedRouteKeys: string[];
};

export type RouterStore = {
  panels: PanelState[];
  nodes: NodeState[];
  routes: RouteInstance[];
};

// const createDefaultRouterStore2 = (): RouterStore => {
//   const now = Date.now();

//   return {
//     maxNodes: 3,
//     routesById: {
//       'route-1': { id: 'route-1', path: '/page1', href: '/page1', lastVisitedAt: now },
//       'route-2': { id: 'route-2', path: '/page2/:fileID', href: '/page2/asd', lastVisitedAt: now },
//       submission: { id: 'submission', path: '/submissions/:query', href: '/submissions/asd', lastVisitedAt: now }
//     },
//     routeOrder: ['route-1', 'route-2', 'submission'],
//     nodesById: {
//       'node-1': { id: `node-1`, portal: createReversePortalNode(), routeId: `route-1`, lastUsedAt: 0 },
//       'node-2': { id: `node-2`, portal: createReversePortalNode(), routeId: `route-2`, lastUsedAt: 0 },
//       submission: { id: `submission`, portal: createReversePortalNode(), routeId: `submission`, lastUsedAt: 0 }
//     },
//     nodeOrder: ['node-1', 'node-2'],
//     panelsById: {
//       1: { id: 1, nodeId: 'node-1' },
//       2: { id: 2, nodeId: 'node-2' },
//       3: { id: 2, nodeId: 'submission' }
//     },
//     panelOrder: [1, 2, 3]
//   };
// };

const createDefaultRouterStore = (): RouterStore => {
  const now = Date.now();

  return {
    panels: [
      { id: 'panel-1', nodeKey: 'node-1', tabbedRouteKeys: ['route-1'] },
      { id: 'panel-2', nodeKey: 'node-2', tabbedRouteKeys: ['route-2'] },
      { id: 'panel-3', nodeKey: 'node-3', tabbedRouteKeys: ['route-3'] }
    ],
    nodes: [
      { id: 'node-1', portal: createReversePortalNode(), routeKey: `route-1`, lastUsedAt: 0 },
      { id: 'node-2', portal: createReversePortalNode(), routeKey: `route-2`, lastUsedAt: 0 },
      { id: 'node-3', portal: createReversePortalNode(), routeKey: `route-3`, lastUsedAt: 0 }
    ],
    routes: [
      { id: 'route-1', pathname: '/page1' },
      { id: 'route-2', pathname: '/page2/asd' },
      { id: 'route-3', pathname: '/submissions/asd' }
    ]
  };
};

const { StoreProvider, useStore: useRouterStore } = createStoreContext<RouterStore>(createDefaultRouterStore());

export { useRouterStore };

export const RouterProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  return <StoreProvider data={createDefaultRouterStore()}>{children}</StoreProvider>;
});

// ********************************************************************************************
// Router Actions
// ********************************************************************************************
export type UseRouterActions = {
  resolveHref: (href: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }) => string;
  resolveTo: (
    to:
      | NavigateTo
      | {
          path: string;
          params?: Record<string, string | number | boolean>;
          search?: Record<string, unknown>;
          hash?: string;
        },
    options?: {
      fromPanel?: RoutePanel;
      panel?: RoutePanel;
      params?: Record<string, string | number | boolean>;
      search?: Record<string, unknown>;
      hash?: string;
    }
  ) => string;
  navigateTo: (
    href: string,
    options?: { fromPanel?: RoutePanel; panel?: RoutePanel; replace?: boolean; keepAlive?: boolean }
  ) => void;
};

export const useRouterActions = (): UseRouterActions => {
  const [, setStore] = useRouterStore(s => s);
  const location = useLocation();
  const navigate = useNavigate();

  const resolveHref = useCallback(
    (href: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }) => {
      const targetPanel = getTargetPanel(options?.fromPanel ?? 'panel-0', options?.panel);
      return targetPanel !== 'panel-1' ? `${location.pathname}#${href}` : `${href}${location.hash}`;
    },
    [location.hash, location.pathname]
  );

  const resolveTo = useCallback<UseRouterActions['resolveTo']>(
    (to, options) => {
      const path = withParams(to.path, to.params ?? options?.params);
      const search = toSearchString((to.search as Record<string, unknown> | undefined) ?? options?.search);
      const hashValue = (to.hash as string | undefined) ?? options?.hash;
      const hash = hashValue ? `#${hashValue}` : '';
      const href = `${path}${search}${hash}`;
      return resolveHref(href, options);
    },
    [resolveHref]
  );

  const navigateTo = useCallback<UseRouterActions['navigateTo']>(
    (href, options) => {
      const targetPanel = getTargetPanel(options?.fromPanel ?? 'panel-0', options?.panel);
      const basePath = href.split('?')[0]?.split('#')[0] ?? href;
      const routeId = href;

      setStore(prev => {
        const current = prev as RouterStore;
        const withRoute = upsertRouteInStore(current, href, basePath);
        return assignRouteToPanel(withRoute, targetPanel, routeId);
      });

      const resolved = resolveHref(href, options);
      navigate(resolved, { replace: options?.replace });
    },
    [navigate, resolveHref, setStore]
  );

  return { resolveHref, resolveTo, navigateTo };
};
