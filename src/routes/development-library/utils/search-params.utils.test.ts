import { SEARCH_PARAM_BLUEPRINTS_MAP } from 'features/search-params';
import {
  createKindDemo,
  KIND_DEMOS,
  parseJsonRecord,
  resolvePlaygroundSnapshot,
  runSearchParamsCheck,
  SEARCH_PARAMS_CHECKS,
  stringifyResult
} from 'routes/development-library/utils/search-params.utils';
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

//*****************************************************************************************
// runSearchParamsCheck
//*****************************************************************************************
describe('runSearchParamsCheck', () => {
  it('passes when the actual value equals the expected value', () => {
    const result = runSearchParamsCheck({ group: 'g', name: 'n', run: () => ({ a: [1] }), expected: { a: [1] } });

    expect(result).toEqual({ actual: '{"a":[1]}', expected: '{"a":[1]}', group: 'g', name: 'n', passed: true });
  });

  it('fails when the actual value differs from the expected value', () => {
    expect(runSearchParamsCheck({ group: 'g', name: 'n', run: () => 1, expected: 2 }).passed).toBe(false);
  });

  it('fails with the error text when the check throws', () => {
    const result = runSearchParamsCheck({
      group: 'g',
      name: 'n',
      run: () => {
        throw new Error('boom');
      },
      expected: null
    });

    expect(result.passed).toBe(false);
    expect(result.actual).toBe('Error: boom');
  });

  it('compares an undefined result with an undefined expectation', () => {
    expect(runSearchParamsCheck({ group: 'g', name: 'n', run: () => undefined, expected: undefined }).passed).toBe(
      true
    );
  });
});

//*****************************************************************************************
// SEARCH_PARAMS_CHECKS
//*****************************************************************************************
describe('SEARCH_PARAMS_CHECKS', () => {
  it('lists checks with unique names inside each group', () => {
    const keys = SEARCH_PARAMS_CHECKS.map(check => `${check.group}/${check.name}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(SEARCH_PARAMS_CHECKS.map(check => [`${check.group}: ${check.name}`, check] as const))(
    '%s',
    (_name, check) => {
      const result = runSearchParamsCheck(check);

      expect(result.actual).toBe(result.expected);
    }
  );
});
