import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import type { Location } from 'react-router';
import { describe, expect, it } from 'vitest';

const makeLocation = (overrides: Partial<Location> = {}): Location => ({
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
  key: 'default',
  ...overrides
});

//*****************************************************************************************
// getDefaultValues / setDefaultValues
//*****************************************************************************************

describe('SearchParamEngine.getDefaultValues', () => {
  it('returns a snapshot of every blueprint default value', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.getDefaultValues().toObject()).toEqual({ page: 1, query: '' });
  });
});

describe('SearchParamEngine.setDefaultValues', () => {
  it('overrides blueprint defaults using provided URLSearchParams', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    engine.setDefaultValues(new URLSearchParams('page=5'));
    expect(engine.getDefaultValues().toObject()).toEqual({ page: 5 });
  });

  it('merges restored object deltas while replacing arrays and preserving nullable values', () => {
    const engine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ a: 1, b: 2 }),
      list: SEARCH_PARAM_BLUEPRINTS_MAP.object([1, 2]),
      nullable: SEARCH_PARAM_BLUEPRINTS_MAP.object({ a: 1 }).nullable(),
      untouched: SEARCH_PARAM_BLUEPRINTS_MAP.object({ keep: true }).nullable()
    });
    const values = new URLSearchParams();
    values.set('config', JSON.stringify({ a: 3 }));
    values.set('list', JSON.stringify([3]));
    values.set('nullable', 'null');

    engine.setDefaultValues(values);

    expect(engine.getDefaultValues().toObject()).toEqual({
      config: { a: 3, b: 2 },
      list: [3],
      nullable: null,
      untouched: { keep: true }
    });
  });

  it('returns itself unchanged when no values are provided', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    const result = engine.setDefaultValues(null);
    expect(result).toBe(engine);
    expect(engine.getDefaultValues().toObject()).toEqual({ page: 1 });
  });

  it('uses nullable object defaults for missing or invalid values and preserves explicit null', () => {
    const engine = new SearchParamEngine({
      search: SEARCH_PARAM_BLUEPRINTS_MAP.object({ source: 'search' }).nullable(),
      state: SEARCH_PARAM_BLUEPRINTS_MAP.object({ source: 'state' }).nullable().source('state'),
      transient: SEARCH_PARAM_BLUEPRINTS_MAP.object({ source: 'transient' }).nullable().source('transient')
    });
    const defaults = { search: { source: 'search' }, state: { source: 'state' }, transient: { source: 'transient' } };

    expect(engine.full(new URLSearchParams()).toObject()).toEqual(defaults);
    expect(engine.full(new URLSearchParams('search=%7Binvalid')).toObject()).toEqual(defaults);
    expect(engine.fromLocation(makeLocation()).toObject()).toEqual(defaults);
    expect(engine.fromLocation(makeLocation({ state: { state: true } })).toObject()).toEqual(defaults);
    expect(engine.fromRoute('/list').toObject()).toEqual(defaults);
    expect(engine.fromRoute('/list', { state: null }, { transient: true }).toObject()).toEqual({
      search: { source: 'search' },
      state: null,
      transient: { source: 'transient' }
    });
    expect(engine.full(new URLSearchParams('search=null')).toObject()).toEqual({
      ...defaults,
      search: null
    });
  });
});

//*****************************************************************************************
// Key introspection
//*****************************************************************************************

describe('SearchParamEngine.getEphemeralKeys', () => {
  it('returns keys marked as ephemeral', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).ephemeral(),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.getEphemeralKeys()).toEqual(['page']);
  });
});

describe('SearchParamEngine.getIgnoredKeys', () => {
  it('returns keys marked as ignored', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).ignored(),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.getIgnoredKeys()).toEqual(['page']);
  });
});

describe('SearchParamEngine.getLockedKeys', () => {
  it('returns keys marked as locked', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).locked(),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.getLockedKeys()).toEqual(['page']);
  });
});

//*****************************************************************************************
// full
//*****************************************************************************************

describe('SearchParamEngine.full', () => {
  it('resolves full values from URLSearchParams, falling back to defaults', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.full(new URLSearchParams('page=3')).toObject()).toEqual({ page: 3, query: '' });
  });

  it('ignores provided values for locked params', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).locked() });
    expect(engine.full(new URLSearchParams('page=99')).toObject()).toEqual({ page: 1 });
  });

  it('resolves full values from a plain value map', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.full({ page: 7 }).toObject()).toEqual({ page: 7 });
  });

  it('round-trips numeric and boolean enum values through URL parameters', () => {
    const engine = new SearchParamEngine({
      mode: SEARCH_PARAM_BLUEPRINTS_MAP.enum(1, [1, 2] as const),
      enabled: SEARCH_PARAM_BLUEPRINTS_MAP.enum(false, [false, true] as const)
    });
    const params = engine.full({ mode: 2, enabled: true }).toParams();

    expect(params.toString()).toBe('mode=2&enabled=true');
    expect(engine.full(params).toObject()).toEqual({ mode: 2, enabled: true });
  });

  it('rejects object values that do not match the default shape', () => {
    const engine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ ids: ['default'], limit: 5, nested: { on: true } })
    });
    const defaults = { config: { ids: ['default'], limit: 5, nested: { on: true } } };

    for (const config of [{ ids: false }, { ids: [1] }, { limit: '5' }, { nested: { on: 'yes' } }, { nested: [] }]) {
      expect(engine.full(new URLSearchParams({ config: JSON.stringify(config) })).toObject()).toEqual(defaults);
    }

    expect(engine.full(new URLSearchParams({ config: '{"ids":["a","b"],"limit":9}' })).toObject()).toEqual({
      config: { ids: ['a', 'b'], limit: 9, nested: { on: true } }
    });
  });

  it('keeps a __proto__ object key as an own property without changing the prototype', () => {
    const engine = new SearchParamEngine({ config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ a: 1 }) });
    const params = new URLSearchParams({ config: '{"__proto__":{"polluted":true}}' });

    const { config } = engine.full(params).toObject();

    expect(Object.getPrototypeOf(config)).toBe(Object.prototype);
    expect(Object.hasOwn(config, '__proto__')).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect((config as Record<string, unknown>).polluted).toBeUndefined();
  });
});

//*****************************************************************************************
// delta
//*****************************************************************************************

describe('SearchParamEngine.delta', () => {
  it('computes only the values that differ from the defaults', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });
    expect(engine.delta({ page: 3, query: '' }).toObject()).toEqual({ page: 3 });
  });

  it('returns an empty snapshot when values match the defaults', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.delta({ page: 1 }).toObject()).toEqual({});
  });

  it('serializes a full object when the nullable default is null', () => {
    const engine = new SearchParamEngine({ config: SEARCH_PARAM_BLUEPRINTS_MAP.object({}).nullable() });
    engine.setDefaultValues(new URLSearchParams('config=null'));

    const params = engine.delta({ config: {} }).toParams();

    expect(params.get('config')).toBe('{}');
    expect(engine.full(params).toObject()).toEqual({ config: {} });
  });

  it('round-trips empty and nonempty records over an array default', () => {
    const engine = new SearchParamEngine({ config: SEARCH_PARAM_BLUEPRINTS_MAP.object([1, 2]) });

    for (const config of [{}, { enabled: true }]) {
      const values = { config } as never;

      expect(engine.full(values).toObject()).toEqual({ config });

      const params = engine.delta(values).toParams();
      expect(params.get('config')).toBe(JSON.stringify(config));
      expect(engine.full(params).toObject()).toEqual({ config });
    }
  });
});

//*****************************************************************************************
// fromLocation
//*****************************************************************************************

describe('SearchParamEngine.fromLocation', () => {
  it('resolves search-sourced params from location.search', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.fromLocation(makeLocation({ search: '?page=9' })).toObject()).toEqual({ page: 9 });
  });

  it('resolves state-sourced params from location.state', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).source('state') });
    expect(engine.fromLocation(makeLocation({ state: { page: 4 } })).toObject()).toEqual({ page: 4 });
  });

  it('falls back to defaults when no matching value is present', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.fromLocation(makeLocation()).toObject()).toEqual({ page: 1 });
  });
});

//*****************************************************************************************
// fromRoute
//*****************************************************************************************

describe('SearchParamEngine.fromRoute', () => {
  it('resolves search-sourced params from the given href', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.fromRoute('/list?page=6').toObject()).toEqual({ page: 6 });
  });

  it('resolves state-sourced params from the given state object', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1).source('state') });
    expect(engine.fromRoute('/list', { page: 8 }).toObject()).toEqual({ page: 8 });
  });

  it('falls back to defaults when the href has no matching query param', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    expect(engine.fromRoute('/list').toObject()).toEqual({ page: 1 });
  });

  it('resolves filter defaults through the full resolver', () => {
    const engine = new SearchParamEngine({ filters: SEARCH_PARAM_BLUEPRINTS_MAP.filters(['a']) });

    expect(engine.fromRoute('/list').toObject()).toEqual({ filters: ['a'] });
  });

  it('merges route object values with their defaults through the full resolver', () => {
    const engine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ a: 1, b: 2 }).source('state')
    });

    expect(engine.fromRoute('/list', { config: { a: 3 } }).toObject()).toEqual({ config: { a: 3, b: 2 } });
  });

  it('uses object defaults for unsupported state and transient values', () => {
    const stateEngine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ enabled: true }).source('state')
    });
    const transientEngine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ enabled: true }).source('transient')
    });
    const nullableEngine = new SearchParamEngine({
      config: SEARCH_PARAM_BLUEPRINTS_MAP.object({ enabled: true }).nullable().source('state')
    });

    expect(stateEngine.fromLocation(makeLocation({ state: { config: true } })).toObject()).toEqual({
      config: { enabled: true }
    });
    expect(stateEngine.fromRoute('/list', { config: true }).toObject()).toEqual({ config: { enabled: true } });
    expect(transientEngine.fromRoute('/list', null, { config: true }).toObject()).toEqual({
      config: { enabled: true }
    });
    expect(nullableEngine.fromRoute('/list', { config: null }).toObject()).toEqual({ config: null });
  });
});

//*****************************************************************************************
// Round-trip via toParams/toString
//*****************************************************************************************

describe('SearchParamEngine round-trip behaviour', () => {
  it('round-trips values through delta -> toParams -> full', () => {
    const engine = new SearchParamEngine({
      page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
      query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
    });

    const delta = engine.delta({ page: 3, query: 'hello' });
    const params = delta.toParams();
    const rebuilt = engine.full(params);

    expect(rebuilt.toObject()).toEqual({ page: 3, query: 'hello' });
  });
});
