import React from 'react';
import { describe, expect, it } from 'vitest';
import type { RouterStore } from '../models/router.models';
import {
  PARAM_PARSERS,
  closeRouterPanel,
  createParamsParser,
  locationToStore,
  navigateOpenRoute,
  storeToNavigateTo,
  toElement
} from './router.utils';

const createStore = (): RouterStore => ({
  maxPanels: 2,
  maxNodes: 2,
  panels: [
    { route: 'r1', pinnedRoutes: [], tabbedRoutes: [] },
    { route: 'r2', pinnedRoutes: [], tabbedRoutes: [] }
  ],
  nodes: {
    n1: { routeKey: 'r1', portal: { hostEl: document.createElement('div'), setOutlet: () => {} }, lastUsedAt: 1 },
    n2: { routeKey: 'r2', portal: { hostEl: document.createElement('div'), setOutlet: () => {} }, lastUsedAt: 2 }
  },
  routes: {
    r1: { href: '/page1', state: null },
    r2: { href: '/page2', state: null }
  }
});

describe('router.utils', () => {
  it('storeToNavigateTo builds search and state', () => {
    const store = createStore();
    const result = storeToNavigateTo(store);

    expect(result.to).toEqual({ search: '/?p=%2Fpage1&p=%2Fpage2' });
    expect(result.options.state).toEqual({ panels: store.panels, routes: store.routes });
  });

  it('navigateOpenRoute updates the next panel route', () => {
    const store = createStore();
    const result = navigateOpenRoute(store, '/new', 'r1');
    const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

    const nextRouteKey = nextState.panels[1].route;
    expect(nextRouteKey).not.toBe('r2');
    expect(nextState.routes[nextRouteKey].href).toBe('/new');
  });

  it('navigateOpenRoute at max panel shifts and writes to last panel', () => {
    const store = createStore();
    const result = navigateOpenRoute(store, '/last', 'r2');
    const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

    expect(nextState.routes[nextState.panels[1].route].href).toBe('/last');
  });

  it('navigateOpenRoute is no-op for unknown current route', () => {
    const store = createStore();
    const result = navigateOpenRoute(store, '/ignored', 'missing');
    const nextState = result.options.state as { panels: RouterStore['panels']; routes: RouterStore['routes'] };

    expect(nextState.panels.map(p => p.route)).toEqual(['r1', 'r2']);
    expect(Object.values(nextState.routes).map(r => r.href)).not.toContain('/ignored');
  });

  it('closeRouterPanel removes panel and updates navigation search', () => {
    const store = createStore();
    const result = closeRouterPanel(store, 1);

    expect(store.panels).toHaveLength(1);
    expect(result.to).toEqual({ search: '/?p=%2Fpage1' });
  });

  it('locationToStore maps location.state', () => {
    const store = createStore();
    const next = locationToStore(store, {
      state: {
        panels: [{ route: 'x', pinnedRoutes: [], tabbedRoutes: [] }],
        routes: { x: { href: '/x', state: null } }
      },
      search: '',
      hash: '',
      key: 'k1',
      pathname: '/x'
    } as any);

    expect(next.panels).toHaveLength(1);
    expect(next.panels[0].route).toBe('x');
    expect(next.routes.x.href).toBe('/x');
    expect(Object.values(next.nodes).some(n => n.routeKey === 'x')).toBe(true);
  });

  it('locationToStore maps location.search', () => {
    const store = createStore();
    const next = locationToStore(store, {
      state: null,
      search: '?p=%2Fsubmit&p=%2Fsubmissions%2Fabc',
      hash: '',
      key: 'k2',
      pathname: '/'
    } as any);

    expect(next.panels).toHaveLength(2);
    expect(Object.keys(next.nodes)).toHaveLength(2);
    expect(Object.values(next.routes).map(r => r.href)).toEqual(
      expect.arrayContaining(['/submit', '/submissions/abc'])
    );
  });

  it('locationToStore returns default state when empty input', () => {
    const store = createStore();
    const next = locationToStore(store, {
      state: null,
      search: '',
      hash: '',
      key: 'k3',
      pathname: '/'
    } as any);

    expect(next.panels[0].route).toBe('default');
    expect(next.routes.default.href).toBe('/submit');
    expect(next.nodes.default.routeKey).toBe('default');
  });

  it('createParamsParser parse/stringify works', () => {
    const parser = createParamsParser(p => ({
      page: p.number(1),
      active: p.boolean(false),
      q: p.string('')
    }));

    expect(parser.parse({ page: '3', active: 'true', q: 'abc' })).toEqual({ page: 3, active: true, q: 'abc' });
    expect(parser.stringify({ page: 2, active: false, q: 'z' })).toEqual({ page: '2', active: 'false', q: 'z' });
  });

  it('PARAM_PARSERS default and invalid handling', () => {
    expect(PARAM_PARSERS.number(10).parse(undefined)).toBe(10);
    expect(PARAM_PARSERS.number(10).parse('bad')).toBe(10);
    expect(PARAM_PARSERS.boolean(true).parse('0')).toBe(false);
    expect(PARAM_PARSERS.string('fallback').parse(undefined)).toBe('fallback');
  });

  it('toElement returns valid element unchanged and wraps memo component', () => {
    const el = <div>ok</div>;
    expect(toElement(el)).toBe(el);

    const MemoComp = React.memo(() => <span>memo</span>);
    const rendered = toElement(MemoComp) as React.ReactElement;
    expect(rendered.type).toBe(MemoComp);
  });
});
