import { createReversePortalNode } from '../components/Portals';
import { RouterNode, RouterPanel, RouterRoute, RouterState, RouterStore } from './router.models';

export const DEFAULT_ROUTER_PANEL: RouterPanel = {
  routeKey: null,
  temporaryRouteKey: null,
  pinnedRouteKeys: [],
  tabbedRouteKeys: []
};

export const DEFAULT_ROUTER_NODE: RouterNode = {
  routeKey: null,
  portal: createReversePortalNode(),
  lastUsedAt: 0
};

export const DEFAULT_ROUTER_ROUTE: RouterRoute = {
  href: null,
  state: null
};

export const DEFAULT_ROUTER_STATE: RouterState = {
  panels: [],
  routes: {}
};

export const DEFAULT_ROUTER_STORE: RouterStore = {
  maxPanels: 1,
  maxNodes: 0,
  panels: [],
  nodes: {},
  routes: {}
};

export const ROUTER_STORE_EXAMPLE: RouterStore = {
  maxPanels: 1,
  maxNodes: 0,
  panels: [{ routeKey: 'default', temporaryRouteKey: 'default', pinnedRouteKeys: [], tabbedRouteKeys: [] }],
  nodes: { default: { routeKey: 'default', portal: createReversePortalNode(), lastUsedAt: 0 } },
  routes: { default: { href: '/submit', state: null } }
};
