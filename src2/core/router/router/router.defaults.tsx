import { createReversePortalNode } from 'features/portal';
import { AppRouterConfig } from '../router.config';
import { AppRouterNode, AppRouterPanel, AppRouterRoute, AppRouterState, AppRouterStore } from './router.models';

export const DEFAULT_APP_ROUTER_PANEL: AppRouterPanel = {
  routeKey: null,
  temporaryRouteKey: null,
  pinnedRouteKeys: [],
  tabbedRouteKeys: []
};

export const DEFAULT_APP_ROUTER_NODE: AppRouterNode = {
  routeKey: null,
  portal: createReversePortalNode()
};

export const DEFAULT_APP_ROUTER_ROUTE: AppRouterRoute = {
  href: null,
  state: null,
  age: 0
};

export const DEFAULT_APP_ROUTER_STATE: AppRouterState = {
  panels: [],
  routes: {}
};

export const DEFAULT_APP_ROUTER_STORE: AppRouterStore = {
  maxPanels: 0,
  maxNodes: 0,
  panels: [],
  nodes: {},
  routes: {}
};

export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  maxPanels: 0,
  maxNodes: 0,
  panels: [{ routeKey: 'default', temporaryRouteKey: 'default', pinnedRouteKeys: [], tabbedRouteKeys: [] }],
  nodes: { default: { routeKey: 'default', portal: createReversePortalNode() } },
  routes: { default: { href: '/submit', state: null, age: 0 } }
};

export const DEFAULT_APP_ROUTER_CONFIGS: AppRouterConfig = {
  maxPanels: 2,
  maxNodes: 2
};
