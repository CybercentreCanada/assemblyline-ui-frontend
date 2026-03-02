import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ROUTER_PANEL, DEFAULT_ROUTER_STORE } from '../models/router.defaults';
import type { RouterStore } from '../models/router.models';
import { addRoute, generateRandomUUID, insertLeftRoute, insertRightRoute, sanitizeRoutes } from './router.utils';

//*****************************************************************************************
// generateRandomUUID
//*****************************************************************************************
describe('generateRandomUUID', () => {
  it('returns a base64 id string', () => {
    const id = generateRandomUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('retries when generated id already exists', () => {
    const firstBytes = new Uint8Array(12).fill(1);
    const secondBytes = new Uint8Array(12).fill(2);
    const firstId = btoa(String.fromCharCode(...firstBytes));
    const secondId = btoa(String.fromCharCode(...secondBytes));

    const spy = vi.spyOn(crypto, 'getRandomValues');
    spy
      .mockImplementationOnce((typedArray: Uint8Array) => {
        typedArray.set(firstBytes);
        return typedArray;
      })
      .mockImplementationOnce((typedArray: Uint8Array) => {
        typedArray.set(secondBytes);
        return typedArray;
      });

    const id = generateRandomUUID([firstId]);

    expect(id).toBe(secondId);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});

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
        { routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] },
        { routeKey: 'r2', pinnedRouteKeys: [], tabbedRouteKeys: [] }
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
      panels: [{ routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] }],
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
        { routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] },
        { routeKey: 'r2', pinnedRouteKeys: [], tabbedRouteKeys: [] }
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
      panels: [{ routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] }],
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
      panels: [{ routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] }],
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
  it('replaces active route for the panel and appends the new route to tabbedRouteKeys', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [{ routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: ['r1'] }],
      nodes: {},
      routes: { r1: { href: '/page1', state: null } }
    };

    const next = addRoute(store, { href: '/page2', state: { q: 'x' } }, 0);
    const panel = next.panels[0];

    expect(panel.routeKey).not.toBe('r1');
    expect(panel.tabbedRouteKeys).toHaveLength(2);
    expect(panel.tabbedRouteKeys[1]).toBe(panel.routeKey);
    expect(next.routes[panel.routeKey].href).toBe('/page2');
    expect(next.routes[panel.routeKey].state).toEqual({ q: 'x' });
  });

  it('clamps out-of-range panel index to first panel', () => {
    const store: RouterStore = {
      maxPanels: 3,
      maxNodes: 2,
      panels: [
        { routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] },
        { routeKey: 'r2', pinnedRouteKeys: [], tabbedRouteKeys: [] }
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
        { routeKey: 'r1', pinnedRouteKeys: [], tabbedRouteKeys: [] },
        { routeKey: 'r2', pinnedRouteKeys: [], tabbedRouteKeys: [] }
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

  it('removes invalid and non-permanent tabbed routes before appending the new route', () => {
    const store: RouterStore = {
      maxPanels: 2,
      maxNodes: 2,
      panels: [{ routeKey: 'keep', pinnedRouteKeys: [], tabbedRouteKeys: ['keep', 'tmp', 'missing'] }],
      nodes: {},
      routes: {
        keep: { href: '/keep', state: null, permanent: true },
        tmp: { href: '/tmp', state: null, permanent: false }
      }
    };

    const next = addRoute(store, { href: '/new', state: null }, 0);
    const panel = next.panels[0];

    expect(panel.tabbedRouteKeys).toHaveLength(2);
    expect(panel.tabbedRouteKeys[0]).toBe('keep');
    expect(panel.tabbedRouteKeys[1]).toBe(panel.routeKey);
    expect(panel.tabbedRouteKeys).not.toContain('tmp');
    expect(panel.tabbedRouteKeys).not.toContain('missing');
    expect(next.routes[panel.routeKey].href).toBe('/new');
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
