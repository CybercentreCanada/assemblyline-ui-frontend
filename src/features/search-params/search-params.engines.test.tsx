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

  it('returns itself unchanged when no values are provided', () => {
    const engine = new SearchParamEngine({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) });
    const result = engine.setDefaultValues(null);
    expect(result).toBe(engine);
    expect(engine.getDefaultValues().toObject()).toEqual({ page: 1 });
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
