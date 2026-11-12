import { SEARCH_PARAM_BLUEPRINTS_MAP } from 'features/search-params';
import {
  createKindDemo,
  KIND_DEMOS,
  parseJsonRecord,
  resolvePlaygroundSnapshot,
  stringifyResult
} from 'routes/development-library/sections/search-params/search-params.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// stringifyResult
//*****************************************************************************************
describe('stringifyResult', () => {
  it('returns a string result as-is', () => {
    expect(stringifyResult(() => 'abc')).toBe('abc');
  });

  it('renders other results as indented JSON', () => {
    expect(stringifyResult(() => ({ a: 1 }))).toBe('{\n  "a": 1\n}');
  });

  it('renders an empty string result as an empty string', () => {
    expect(stringifyResult(() => '')).toBe('');
  });

  it('renders an undefined result', () => {
    expect(stringifyResult(() => undefined)).toBe('undefined');
  });

  it('renders the name and message of a thrown error', () => {
    expect(
      stringifyResult(() => {
        throw new TypeError('bad');
      })
    ).toBe('TypeError: bad');
  });

  it('renders a thrown non-error value', () => {
    expect(
      stringifyResult(() => {
        throw 'oops';
      })
    ).toBe('oops');
  });
});

//*****************************************************************************************
// parseJsonRecord
//*****************************************************************************************
describe('parseJsonRecord', () => {
  it('parses a JSON object', () => {
    expect(parseJsonRecord('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses an empty object', () => {
    expect(parseJsonRecord('{}')).toEqual({});
  });

  it('returns null for empty text', () => {
    expect(parseJsonRecord('')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseJsonRecord('{bad')).toBeNull();
  });

  it('returns null for arrays, null and primitives', () => {
    for (const text of ['[1]', 'null', '1', '"a"', 'true']) {
      expect(parseJsonRecord(text)).toBeNull();
    }
  });
});

//*****************************************************************************************
// resolvePlaygroundSnapshot
//*****************************************************************************************
describe('resolvePlaygroundSnapshot', () => {
  it('resolves search, state and transient values from their own sources', () => {
    const values = resolvePlaygroundSnapshot(
      'page=3&panel=url',
      '{"panel":"details"}',
      '{"selection":["row-1"]}'
    ).toObject();

    expect(values.page).toBe(3);
    expect(values.panel).toBe('details');
    expect(values.selection).toEqual(['row-1']);
  });

  it('accepts a leading question mark', () => {
    expect(resolvePlaygroundSnapshot('?page=4', '', '').get('page')).toBe(4);
  });

  it('resolves the defaults for empty inputs', () => {
    const values = resolvePlaygroundSnapshot('', '', '').toObject();

    expect(values.page).toBe(1);
    expect(values.fixed).toBe('fixed');
    expect(values.panel).toBe('');
  });

  it('clamps a page at the maximum boundary', () => {
    expect(resolvePlaygroundSnapshot('page=50', '', '').get('page')).toBe(50);
    expect(resolvePlaygroundSnapshot('page=51', '', '').get('page')).toBe(50);
  });
});

//*****************************************************************************************
// createKindDemo
//*****************************************************************************************
describe('createKindDemo', () => {
  it('keeps the initial query string', () => {
    expect(createKindDemo({ q: SEARCH_PARAM_BLUEPRINTS_MAP.string('') }, 'q=a').initial).toBe('q=a');
  });

  it('resolves values, delta and search for a query string', () => {
    const demo = createKindDemo(
      { page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1), q: SEARCH_PARAM_BLUEPRINTS_MAP.string('') },
      ''
    );

    expect(demo.resolve('page=2')).toEqual({ values: { page: 2, q: '' }, delta: { page: 2 }, search: 'page=2' });
  });

  it('resolves defaults for an empty query string', () => {
    const demo = createKindDemo({ page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1) }, '');

    expect(demo.resolve('')).toEqual({ values: { page: 1 }, delta: {}, search: '' });
  });

  it('resolves every predefined kind demo from its initial query', () => {
    for (const demo of Object.values(KIND_DEMOS)) {
      expect(() => demo.resolve(demo.initial)).not.toThrow();
    }
  });
});
