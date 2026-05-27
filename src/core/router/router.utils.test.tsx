import type { AppRouterStore } from 'core/router/router.models';
import { DEFAULT_APP_ROUTER_PANEL, DEFAULT_APP_ROUTER_STORE } from 'core/router/router.models';
import { addRouteToPanel, getRouteFromPanelKey, sanitizeRoutes } from 'core/router/router.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// sanitizeRoutes
//*****************************************************************************************
describe('sanitizeRoutes', () => {
  it('removes routes not referenced by panels or nodes', () => {
    const store: AppRouterStore = {
      ...DEFAULT_APP_ROUTER_STORE,
      panels: [{ ...DEFAULT_APP_ROUTER_PANEL, routeKey: 'r1' }],
      routes: {
        r1: { href: '/page1', state: null },
        orphan: { href: '/orphan', state: null }
      }
    };

    const next = sanitizeRoutes(store);
    expect(next.routes.r1).toBeDefined();
    expect(next.routes.orphan).toBeUndefined();
  });

  it('keeps routes referenced by node keys', () => {
    const store: AppRouterStore = {
      ...DEFAULT_APP_ROUTER_STORE,
      nodes: {
        n1: {
          routeKey: 'from-node',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 1
        }
      },
      routes: {
        'from-node': { href: '/from-node', state: null },
        orphan: { href: '/orphan', state: null }
      }
    };

    const next = sanitizeRoutes(store);
    expect(next.routes['from-node']).toBeDefined();
    expect(next.routes.orphan).toBeUndefined();
  });
});

//*****************************************************************************************
// addRouteToPanel / getRouteFromPanelKey
//*****************************************************************************************
describe('panel route helpers', () => {
  it('adds a route to panel and reads it back by panel key', () => {
    const store: AppRouterStore = {
      ...DEFAULT_APP_ROUTER_STORE,
      panels: [{ ...DEFAULT_APP_ROUTER_PANEL }],
      routes: {}
    };

    const next = addRouteToPanel(store, 0, { href: '/submit', state: { source: 'test' } });
    const route = getRouteFromPanelKey(next, 0);

    expect(route.href).toBe('/submit');
    expect(route.state).toEqual({ source: 'test' });
  });
});
