import { createStoreContext } from 'core/store/createStoreContext';
import React, { useMemo } from 'react';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';
import { RouterState, RouterStore } from '../models/router.models';
import { parseLocationToRouterStore } from '../utils/router.utils';

// import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

// ********************************************************************************************
// Router Store
// ********************************************************************************************

// const payload2 = [
//   { pathname: '/a/very/long/path', search: '?q=test&offset=10', hash: '#tab-1' },
//   { pathname: '/a/very/long/path', search: '?q=test&offset=20', hash: '#tab-2' },
//   { pathname: '/another/path', search: '?filter=x&sort=desc', hash: '#details' }
// ];

// const payload = [
//   '/a/very/long/path?q=test&offset=10#tab-1',
//   '/a/very/long/path?q=test&offset=20#tab-2',
//   '/another/path?filter=x&sort=desc#details'
// ];

// const json = JSON.stringify(payload);
// const safe_json = encodeURIComponent(json);
// const compressed = compressToEncodedURIComponent(json);

// console.log('raw', safe_json.length);
// console.log('raw length', json.length);
// console.log('compressed length', compressed.length);

// restore
// const restored = JSON.parse(decompressFromEncodedURIComponent(compressed) ?? '[]');
// console.log(restored);

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

// const createDefaultRouterStore2 = (): RouterStore => {
//   return {
//     maxPanels: 3,
//     maxNodes: 3,
//     panels: {
//       keys: ['panel-1', 'panel-2', 'panel-3'],
//       entries: {
//         'panel-1': { nodeKey: 'node-1', tabbedRoutes: ['route-1'], pinnedRoutes: [] },
//         'panel-2': { nodeKey: 'node-2', tabbedRoutes: ['route-2'], pinnedRoutes: [] },
//         'panel-3': { nodeKey: 'node-3', tabbedRoutes: ['route-3'], pinnedRoutes: [] }
//       }
//     },
//     nodes: {
//       keys: ['node-1', 'node-2', 'node-3'],
//       entries: {
//         'node-1': { portal: createReversePortalNode(), routeKey: 'route-1', lastUsedAt: 0 },
//         'node-2': { portal: createReversePortalNode(), routeKey: 'route-2', lastUsedAt: 0 },
//         'node-3': { portal: createReversePortalNode(), routeKey: 'route-3', lastUsedAt: 0 }
//       }
//     },
//     routes: {
//       keys: ['route-1', 'route-2', 'route-3'],
//       entries: {
//         'route-1': { href: '/page1', state: null },
//         'route-2': { href: '/page2/asd', state: null },
//         'route-3': { href: '/submissions/asd', state: null }
//       }
//     }
//   };
// };

const createDefaultRouterStore = (): RouterStore => ({
  maxPanels: 3,
  maxNodes: 3,
  panels: { keys: [], entries: {} },
  nodes: { keys: [], entries: {} },
  routes: { keys: [], entries: {} }
});

const { StoreProvider, useStore: useRouterStore } = createStoreContext<RouterStore>(createDefaultRouterStore());

export { useRouterStore };

export const RouterProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const location: Location<RouterState> = useLocation();

  const data = useMemo<Partial<RouterStore>>(() => parseLocationToRouterStore(location), []);

  return <StoreProvider data={data}>{children}</StoreProvider>;
});

// ********************************************************************************************
// Router Actions
// ********************************************************************************************
// export type UseRouterActions = {
//   resolveHref: (href: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }) => string;
//   resolveTo: (
//     to:
//       | NavigateTo
//       | {
//           path: string;
//           params?: Record<string, string | number | boolean>;
//           search?: Record<string, unknown>;
//           hash?: string;
//         },
//     options?: {
//       fromPanel?: RoutePanel;
//       panel?: RoutePanel;
//       params?: Record<string, string | number | boolean>;
//       search?: Record<string, unknown>;
//       hash?: string;
//     }
//   ) => string;
//   navigateTo: (
//     href: string,
//     options?: { fromPanel?: RoutePanel; panel?: RoutePanel; replace?: boolean; keepAlive?: boolean }
//   ) => void;
// };

// export const useRouterActions = (): UseRouterActions => {
//   const [, setStore] = useRouterStore(s => s);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const resolveHref = useCallback(
//     (href: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }) => {
//       const targetPanel = getTargetPanel(options?.fromPanel ?? 'panel-0', options?.panel);
//       return targetPanel !== 'panel-1' ? `${location.pathname}#${href}` : `${href}${location.hash}`;
//     },
//     [location.hash, location.pathname]
//   );

//   const resolveTo = useCallback<UseRouterActions['resolveTo']>(
//     (to, options) => {
//       const path = withParams(to.path, to.params ?? options?.params);
//       const search = toSearchString((to.search as Record<string, unknown> | undefined) ?? options?.search);
//       const hashValue = (to.hash as string | undefined) ?? options?.hash;
//       const hash = hashValue ? `#${hashValue}` : '';
//       const href = `${path}${search}${hash}`;
//       return resolveHref(href, options);
//     },
//     [resolveHref]
//   );

//   const navigateTo = useCallback<UseRouterActions['navigateTo']>(
//     (href, options) => {
//       const targetPanel = getTargetPanel(options?.fromPanel ?? 'panel-0', options?.panel);
//       const basePath = href.split('?')[0]?.split('#')[0] ?? href;
//       const routeId = href;

//       setStore(prev => {
//         const current = prev as RouterStore;
//         const withRoute = upsertRouteInStore(current, href, basePath);
//         return assignRouteToPanel(withRoute, targetPanel, routeId);
//       });

//       const resolved = resolveHref(href, options);
//       navigate(resolved, { replace: options?.replace });
//     },
//     [navigate, resolveHref, setStore]
//   );

//   return { resolveHref, resolveTo, navigateTo };
// };
