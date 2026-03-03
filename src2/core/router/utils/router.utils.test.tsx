import { describe, expect, it } from 'vitest';
import { DEFAULT_ROUTER_PANEL, DEFAULT_ROUTER_STORE } from '../models/router.defaults';
import type { RouterStore } from '../models/router.models';
import { addRoute, insertLeftRoute, insertRightRoute, refreshLastUsedAt, sanitizeRoutes } from './router.utils';

//*****************************************************************************************
// sanitizeRoutes
//*****************************************************************************************
describe('sanitizeRoutes', () => {
  it('removes routes that are not referenced by panels or nodes', () => {
    const store: RouterStore = {
      ...DEFAULT_ROUTER_STORE,
      panels: [{ ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' }],
      routes: {
        r1: { href: '/page1', state: null },
        orphan: { href: '/orphan', state: null }
      }
    };

    const next = sanitizeRoutes(store);
    expect(next.routes.r1).toBeDefined();
    expect(next.routes.orphan).toBeUndefined();
  });

  it('keeps routes referenced by panel tabbed/pinned keys', () => {
    const store: RouterStore = {
      ...DEFAULT_ROUTER_STORE,
      panels: [
        {
          ...DEFAULT_ROUTER_PANEL,
          routeKey: 'active',
          pinnedRouteKeys: ['pin'],
          tabbedRouteKeys: ['tab']
        }
      ],
      routes: {
        active: { href: '/active', state: null },
        pin: { href: '/pin', state: null },
        tab: { href: '/tab', state: null },
        orphan: { href: '/orphan', state: null }
      }
    };

    const next = sanitizeRoutes(store);
    expect(next.routes.active).toBeDefined();
    expect(next.routes.pin).toBeDefined();
    expect(next.routes.tab).toBeDefined();
    expect(next.routes.orphan).toBeUndefined();
  });

  it('keeps routes referenced by nodes even when not in panels', () => {
    const store: RouterStore = {
      ...DEFAULT_ROUTER_STORE,
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
// insertLeftRoute
//*****************************************************************************************
describe('insertLeftRoute', () => {
  it('inserts at index and trims overflow from tail', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' },
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r2' }
      ],
      nodes: {},
      routes: {
        r1: { href: '/page1', state: null },
        r2: { href: '/page2', state: null }
      }
    };

    const next = insertLeftRoute(store, { href: '/new-left', state: null }, 1);

    expect(next.panels).toHaveLength(2);
    expect(next.panels[0].routeKey).toBe('r1');
    expect(next.panels[1].routeKey).not.toBe('r2');
    expect(next.routes[next.panels[1].routeKey].href).toBe('/new-left');
  });

  it('default inserts at beginning', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [{ ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' }],
      nodes: {},
      routes: { r1: { href: '/page1', state: null } }
    };

    const next = insertLeftRoute(store, { href: '/new-default-left', state: null });
    expect(next.routes[next.panels[0].routeKey].href).toBe('/new-default-left');
  });
});

//*****************************************************************************************
// insertRightRoute
//*****************************************************************************************
describe('insertRightRoute', () => {
  it('inserts after index and trims overflow from head', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' },
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r2' }
      ],
      nodes: {},
      routes: {
        r1: { href: '/page1', state: null },
        r2: { href: '/page2', state: null }
      }
    };

    const next = insertRightRoute(store, { href: '/new-right', state: null }, 0);

    expect(next.panels).toHaveLength(2);
    expect(next.panels[0].routeKey).not.toBe('r1');
    expect(next.panels[1].routeKey).toBe('r2');
    expect(next.routes[next.panels[0].routeKey].href).toBe('/new-right');
  });

  it('default inserts at end', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [{ ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' }],
      nodes: {},
      routes: { r1: { href: '/page1', state: null } }
    };

    const next = insertRightRoute(store, { href: '/new-default-right', state: null });
    expect(next.routes[next.panels[next.panels.length - 1].routeKey].href).toBe('/new-default-right');
  });

  it('adds the new route key to tabbedRouteKeys for inserted panel', () => {
    const store: RouterStore = {
      maxPanels: 3,
      maxNodes: 2,
      panels: [{ ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' }],
      nodes: {},
      routes: { r1: { href: '/page1', state: null } }
    };

    const next = insertRightRoute(store, { href: '/pinned', state: null }, 0);
    const inserted = next.panels[1];

    expect(inserted.tabbedRouteKeys).toHaveLength(1);
    expect(inserted.tabbedRouteKeys[0]).toBe(inserted.routeKey);
    expect(next.routes[inserted.routeKey].href).toBe('/pinned');
  });
});

//*****************************************************************************************
// addRoute
//*****************************************************************************************
describe('addRoute', () => {
  it('replaces active route for the panel and marks it as temporary', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [{ ...DEFAULT_ROUTER_PANEL, routeKey: 'r1', tabbedRouteKeys: ['r1'] }],
      nodes: {},
      routes: { r1: { href: '/page1', state: null } }
    };

    const next = addRoute(store, { href: '/page2', state: { q: 'x' } }, 0);
    const panel = next.panels[0];

    expect(panel.routeKey).not.toBe('r1');
    expect(panel.tabbedRouteKeys).toEqual(['r1']);
    expect(panel.temporaryRouteKey).toBe(panel.routeKey);
    expect(next.routes[panel.routeKey].href).toBe('/page2');
    expect(next.routes[panel.routeKey].state).toEqual({ q: 'x' });
  });

  it('clamps out-of-range panel index to first panel', () => {
    const store: RouterStore = {
      maxPanels: 3,
      maxNodes: 2,
      panels: [
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' },
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r2' }
      ],
      nodes: {},
      routes: {
        r1: { href: '/page1', state: null },
        r2: { href: '/page2', state: null }
      }
    };

    const next = addRoute(store, { href: '/clamped-low', state: null }, -99);
    expect(next.routes[next.panels[0].routeKey].href).toBe('/clamped-low');
    expect(next.panels[1].routeKey).toBe('r2');
  });

  it('clamps out-of-range panel index to last panel', () => {
    const store: RouterStore = {
      maxPanels: 3,
      maxNodes: 2,
      panels: [
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r1' },
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'r2' }
      ],
      nodes: {},
      routes: {
        r1: { href: '/page1', state: null },
        r2: { href: '/page2', state: null }
      }
    };

    const next = addRoute(store, { href: '/clamped-high', state: null }, 999);
    expect(next.panels[0].routeKey).toBe('r1');
    expect(next.routes[next.panels[1].routeKey].href).toBe('/clamped-high');
  });

  it('is a no-op when panels array is empty', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [],
      nodes: {},
      routes: {}
    };

    const next = addRoute(store, { href: '/no-op', state: null }, 0);
    expect(next.panels).toHaveLength(0);
    expect(Object.keys(next.routes)).toHaveLength(0);
  });

  it('preserves existing tabbed and pinned keys while swapping active route', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [
        {
          ...DEFAULT_ROUTER_PANEL,
          routeKey: 'keep',
          pinnedRouteKeys: ['pin'],
          tabbedRouteKeys: ['keep', 'tmp', 'missing']
        }
      ],
      nodes: {},
      routes: {
        keep: { href: '/keep', state: null },
        pin: { href: '/pin', state: null },
        tmp: { href: '/tmp', state: null }
      }
    };

    const next = addRoute(store, { href: '/new', state: null }, 0);
    const panel = next.panels[0];

    expect(panel.tabbedRouteKeys).toEqual(['keep', 'tmp', 'missing']);
    expect(panel.pinnedRouteKeys).toEqual(['pin']);
    expect(panel.temporaryRouteKey).toBe(panel.routeKey);
    expect(panel.routeKey).not.toBe('keep');
    expect(next.routes[panel.routeKey].href).toBe('/new');
  });
});

//*****************************************************************************************
// refreshLastUsedAt
//*****************************************************************************************
describe('refreshLastUsedAt', () => {
  it('prioritizes nodes currently displayed by panels, then sorts by lastUsedAt and reindexes', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 3,
      panels: [
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'panel-route-a' },
        { ...DEFAULT_ROUTER_PANEL, routeKey: 'panel-route-b' }
      ],
      nodes: {
        n1: {
          routeKey: 'offscreen-1',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 1
        },
        n2: {
          routeKey: 'panel-route-a',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 5
        },
        n3: {
          routeKey: 'panel-route-b',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 2
        },
        n4: {
          routeKey: 'offscreen-2',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 0
        }
      },
      routes: {
        'panel-route-a': { href: '/a', state: null },
        'panel-route-b': { href: '/b', state: null },
        'offscreen-1': { href: '/1', state: null },
        'offscreen-2': { href: '/2', state: null }
      }
    };

    const next = refreshLastUsedAt(store);

    expect(next.nodes.n3.lastUsedAt).toBe(0);
    expect(next.nodes.n2.lastUsedAt).toBe(1);
    expect(next.nodes.n4.lastUsedAt).toBe(2);
    expect(next.nodes.n1.lastUsedAt).toBe(3);
  });

  it('uses node key as a deterministic tie-breaker when lastUsedAt is equal', () => {
    const store: RouterStore = {
      maxPanels: 0,
      maxNodes: 3,
      panels: [],
      nodes: {
        b: { routeKey: 'r-b', portal: { hostEl: document.createElement('div'), setOutlet: () => {} }, lastUsedAt: 7 },
        a: { routeKey: 'r-a', portal: { hostEl: document.createElement('div'), setOutlet: () => {} }, lastUsedAt: 7 }
      },
      routes: {
        'r-a': { href: '/a', state: null },
        'r-b': { href: '/b', state: null }
      }
    };

    const next = refreshLastUsedAt(store);
    expect(next.nodes.a.lastUsedAt).toBe(0);
    expect(next.nodes.b.lastUsedAt).toBe(1);
  });
});

// it('storeToNavigateTo builds search and state', () => {
//   const store = createStore();
//   const result = storeToNavigate(store);

//   expect(result.to).toEqual({ search: '/?p=%2Fpage1&p=%2Fpage2' });
//   expect(result.options.state).toEqual({ panels: store.panels, routes: store.routes });
// });

// it('navigateOpenRoute updates the next panel route', () => {
//   const store = createStore();
//   const result = openRoute(store, { href: '/new', state: null }, 'r1');
//   const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

//   const nextRouteKey = nextState.panels[1].route;
//   expect(nextRouteKey).not.toBe('r2');
//   expect(nextState.routes[nextRouteKey].href).toBe('/new');
// });

// it('navigateOpenRoute at max panel shifts and writes to last panel', () => {
//   const store = createStore();
//   const result = openRoute(store, { href: '/last', state: null }, 'r2');
//   const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

//   expect(nextState.routes[nextState.panels[1].route].href).toBe('/last');
// });

// it('navigateOpenRoute is no-op for unknown current route', () => {
//   const store = createStore();
//   const result = openRoute(store, { href: '/ignored', state: null }, 'missing');
//   const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

//   expect(nextState.panels.map(p => p.route)).toEqual(['r1', 'r2']);
//   expect(Object.values(nextState.routes).map(r => r.href)).not.toContain('/ignored');
// });

// it('closeRouterPanel removes panel and updates navigation search', () => {
//   const store = createStore();
//   const result = closeRouterPanel(store, 1);

//   expect(store.panels).toHaveLength(1);
//   expect(result.to).toEqual({ search: '/?p=%2Fpage1' });
// });

// it('locationToStore maps location.state', () => {
//   const store = createStore();
//   const next = locationToStore(store, {
//     state: {
//       panels: [{ route: 'x', pinnedRoutes: [], tabbedRoutes: [] }],
//       routes: { x: { href: '/x', state: null } }
//     },
//     search: '',
//     hash: '',
//     key: 'k1',
//     pathname: '/x'
//   } as any);

//   expect(next.panels).toHaveLength(1);
//   expect(next.panels[0].route).toBe('x');
//   expect(next.routes.x.href).toBe('/x');
//   expect(Object.values(next.nodes).some(n => n.routeKey === 'x')).toBe(true);
// });

// it('locationToStore maps location.search', () => {
//   const store = createStore();
//   const next = locationToStore(store, {
//     state: null,
//     search: '?p=%2Fsubmit&p=%2Fsubmissions%2Fabc',
//     hash: '',
//     key: 'k2',
//     pathname: '/'
//   } as any);

//   expect(next.panels).toHaveLength(2);
//   expect(Object.keys(next.nodes)).toHaveLength(2);
//   expect(Object.values(next.routes).map(r => r.href)).toEqual(expect.arrayContaining(['/submit', '/submissions/abc']));
// });

// it('locationToStore returns default state when empty input', () => {
//   const store = createStore();
//   const next = locationToStore(store, {
//     state: null,
//     search: '',
//     hash: '',
//     key: 'k3',
//     pathname: '/'
//   } as any);

//   expect(next.panels[0].route).toBe('default');
//   expect(next.routes.default.href).toBe('/submit');
//   expect(next.nodes.default.routeKey).toBe('default');
// });

// it('createParamsParser parse/stringify works', () => {
//   const parser = createParamsParser(p => ({
//     page: p.number(1),
//     active: p.boolean(false),
//     q: p.string('')
//   }));

//   expect(parser.parse({ page: '3', active: 'true', q: 'abc' })).toEqual({ page: 3, active: true, q: 'abc' });
//   expect(parser.stringify({ page: 2, active: false, q: 'z' })).toEqual({ page: '2', active: 'false', q: 'z' });
// });

// it('PARAM_PARSERS default and invalid handling', () => {
//   expect(PARAM_PARSERS.number(10).parse(undefined)).toBe(10);
//   expect(PARAM_PARSERS.number(10).parse('bad')).toBe(10);
//   expect(PARAM_PARSERS.boolean(true).parse('0')).toBe(false);
//   expect(PARAM_PARSERS.string('fallback').parse(undefined)).toBe('fallback');
// });

// it('toElement returns valid element unchanged and wraps memo component', () => {
//   const el = <div>ok</div>;
//   expect(toElement(el)).toBe(el);

//   const MemoComp = React.memo(() => <span>memo</span>);
//   const rendered = toElement(MemoComp) as React.ReactElement;
//   expect(rendered.type).toBe(MemoComp);
// });
