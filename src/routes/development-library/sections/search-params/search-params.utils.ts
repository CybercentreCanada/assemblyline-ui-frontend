import type { SearchParamBlueprintMap, SearchParamSnapshot } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP as BLUEPRINTS, SearchParamEngine } from 'features/search-params';
import type {
  SearchParamsCheck,
  SearchParamsCheckResult,
  SearchParamsKindDemo
} from 'routes/development-library/sections/search-params/search-params.models';

//*****************************************************************************************
// Formatting
//*****************************************************************************************

/**
 * @name stringifyResult
 * @description Runs a function and renders its result, or the error it throws, as text.
 * @param fn - Function to evaluate
 * @returns The string result as-is, otherwise indented JSON, or `Name: message` when `fn` throws
 */
export const stringifyResult = (fn: () => unknown): string => {
  try {
    const result = fn();
    return typeof result === 'string' ? result : String(JSON.stringify(result, null, 2));
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
};

/**
 * @name parseJsonRecord
 * @description Parses JSON text that must describe a plain object.
 * @param text - JSON text typed by the user
 * @returns The parsed object, or `null` when the text is empty, invalid, or not an object
 */
export const parseJsonRecord = (text: string): Record<string, unknown> | null => {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

//*****************************************************************************************
// Playground
//*****************************************************************************************

export const SORT_OPTIONS = ['name', 'date', 'score'] as const;

export const PLAYGROUND_PARAMS = {
  page: BLUEPRINTS.number(1).min(1).max(50),
  query: BLUEPRINTS.string(''),
  sort: BLUEPRINTS.enum('date', SORT_OPTIONS),
  advanced: BLUEPRINTS.boolean(false),
  filters: BLUEPRINTS.filters(['type:file']),
  config: BLUEPRINTS.object({ ids: ['default'], limit: 5, nested: { on: true } }),
  fixed: BLUEPRINTS.string('fixed').locked(),
  note: BLUEPRINTS.string('').ephemeral(),
  panel: BLUEPRINTS.string('').source('state'),
  selection: BLUEPRINTS.filters([]).source('transient')
};

export const PLAYGROUND_ENGINE = new SearchParamEngine(PLAYGROUND_PARAMS);

export const LIVE_TAB = 'search_params';

export const LIVE_STORAGE_KEY = 'development-library:search-params';

// `tab` is kept in the params so writing them back to the url preserves the library tab.
export const LIVE_PARAMS = {
  tab: BLUEPRINTS.string('').ephemeral(),
  live_page: BLUEPRINTS.number(1).min(1).max(20),
  live_query: BLUEPRINTS.string(''),
  live_sort: BLUEPRINTS.enum('date', SORT_OPTIONS),
  live_open: BLUEPRINTS.boolean(false),
  live_panel: BLUEPRINTS.string('').source('state')
};

/**
 * @name resolvePlaygroundSnapshot
 * @description Resolves the playground params from a query string, a `location.state` object and transient values.
 * @param query - Query string, with or without a leading `?`
 * @param state - JSON text for `location.state`; ignored when it is not an object
 * @param transient - JSON text for the transient values; ignored when it is not an object
 * @returns The resolved snapshot
 */
export const resolvePlaygroundSnapshot = (
  query: string,
  state: string,
  transient: string
): SearchParamSnapshot<typeof PLAYGROUND_PARAMS> =>
  PLAYGROUND_ENGINE.fromRoute(
    `/library?${query.replace(/^\?/, '')}`,
    parseJsonRecord(state),
    parseJsonRecord(transient)
  );

//*****************************************************************************************
// Kind Demos
//*****************************************************************************************

/**
 * @name createKindDemo
 * @description Binds a blueprint map to an engine that resolves any query string into values, delta and search.
 * @param blueprints - Blueprints to demonstrate
 * @param initial - Query string the demo starts with
 * @returns A demo whose `resolve` never throws for malformed query strings
 */
export const createKindDemo = (blueprints: SearchParamBlueprintMap, initial: string): SearchParamsKindDemo => {
  const engine = new SearchParamEngine(blueprints);

  return {
    initial,
    resolve: query => {
      const params = new URLSearchParams(query);
      const delta = engine.delta(params);
      return { values: engine.full(params).toObject(), delta: delta.toObject(), search: delta.toString() };
    }
  };
};

export const KIND_DEMOS = {
  number: createKindDemo({ page: BLUEPRINTS.number(1).min(1).max(50) }, 'page=99'),
  boolean: createKindDemo({ advanced: BLUEPRINTS.boolean(false) }, 'advanced=true'),
  string: createKindDemo({ query: BLUEPRINTS.string('') }, 'query=hello%20world'),
  enum: createKindDemo({ sort: BLUEPRINTS.enum('date', SORT_OPTIONS) }, 'sort=name'),
  filters: createKindDemo({ filters: BLUEPRINTS.filters(['type:file']) }, 'filters=NOT(type:exe)&filters=a'),
  object: createKindDemo(
    { config: BLUEPRINTS.object({ ids: ['default'], limit: 5, nested: { on: true } }) },
    'config={"limit":9}'
  ),
  locked: createKindDemo({ fixed: BLUEPRINTS.string('fixed').locked() }, 'fixed=changed'),
  nullable: createKindDemo({ config: BLUEPRINTS.object({ limit: 5 }).nullable() }, 'config=null')
};

//*****************************************************************************************
// Checks
//*****************************************************************************************

const params = (query: string): URLSearchParams => new URLSearchParams(query);

const pageEngine = () => new SearchParamEngine({ page: BLUEPRINTS.number(1), q: BLUEPRINTS.string('') });

const mixedSourceEngine = () =>
  new SearchParamEngine({
    page: BLUEPRINTS.number(1),
    panel: BLUEPRINTS.string('').source('state'),
    row: BLUEPRINTS.string('').source('transient')
  });

export const SEARCH_PARAMS_CHECKS: SearchParamsCheck[] = [
  // Number
  {
    group: 'Number',
    name: 'clamps a value above the maximum',
    run: () => new SearchParamEngine({ page: BLUEPRINTS.number(1).min(1).max(50) }).full(params('page=99')).toObject(),
    expected: { page: 50 }
  },
  {
    group: 'Number',
    name: 'clamps a value below the minimum',
    run: () => new SearchParamEngine({ page: BLUEPRINTS.number(1).min(1).max(50) }).full(params('page=-5')).toObject(),
    expected: { page: 1 }
  },
  {
    group: 'Number',
    name: 'falls back to the default for non-numeric text',
    run: () => new SearchParamEngine({ page: BLUEPRINTS.number(1) }).full(params('page=abc')).toObject(),
    expected: { page: 1 }
  },
  {
    group: 'Number',
    name: 'uses the default when the param is missing',
    run: () => new SearchParamEngine({ page: BLUEPRINTS.number(7) }).full(params('')).toObject(),
    expected: { page: 7 }
  },

  // Boolean
  {
    group: 'Boolean',
    name: 'parses true',
    run: () => new SearchParamEngine({ open: BLUEPRINTS.boolean(false) }).full(params('open=true')).toObject(),
    expected: { open: true }
  },
  {
    group: 'Boolean',
    name: 'parses false over a true default',
    run: () => new SearchParamEngine({ open: BLUEPRINTS.boolean(true) }).full(params('open=false')).toObject(),
    expected: { open: false }
  },
  {
    group: 'Boolean',
    name: 'falls back to the default for unrecognized text',
    run: () => new SearchParamEngine({ open: BLUEPRINTS.boolean(false) }).full(params('open=yes')).toObject(),
    expected: { open: false }
  },

  // String
  {
    group: 'String',
    name: 'reads the value',
    run: () => new SearchParamEngine({ q: BLUEPRINTS.string('') }).full(params('q=hello')).toObject(),
    expected: { q: 'hello' }
  },
  {
    group: 'String',
    name: 'decodes encoded characters',
    run: () => new SearchParamEngine({ q: BLUEPRINTS.string('') }).full(params('q=a%20b%26c')).toObject(),
    expected: { q: 'a b&c' }
  },

  // Enum
  {
    group: 'Enum',
    name: 'accepts a listed option',
    run: () =>
      new SearchParamEngine({ sort: BLUEPRINTS.enum('date', SORT_OPTIONS) }).full(params('sort=name')).toObject(),
    expected: { sort: 'name' }
  },
  {
    group: 'Enum',
    name: 'falls back to the default for an unlisted option',
    run: () =>
      new SearchParamEngine({ sort: BLUEPRINTS.enum('date', SORT_OPTIONS) }).full(params('sort=other')).toObject(),
    expected: { sort: 'date' }
  },
  {
    group: 'Enum',
    name: 'restores a numeric option from its serialized form',
    run: () => new SearchParamEngine({ mode: BLUEPRINTS.enum(1, [1, 2] as const) }).full(params('mode=2')).toObject(),
    expected: { mode: 2 }
  },

  // Filters
  {
    group: 'Filters',
    name: 'merges the defaults with the url values, sorted',
    run: () =>
      new SearchParamEngine({ filters: BLUEPRINTS.filters(['type:file']) })
        .full(params('filters=b&filters=a'))
        .toObject(),
    expected: { filters: ['a', 'b', 'type:file'] }
  },
  {
    group: 'Filters',
    name: 'keeps the NOT() wrapper',
    run: () =>
      new SearchParamEngine({ filters: BLUEPRINTS.filters(['type:file']) }).full(params('filters=NOT(a)')).toObject(),
    expected: { filters: ['NOT(a)', 'type:file'] }
  },
  {
    group: 'Filters',
    name: 'removes a default with the !() wrapper',
    run: () =>
      new SearchParamEngine({ filters: BLUEPRINTS.filters(['type:file']) })
        .full(params('filters=!(type:file)'))
        .toObject(),
    expected: { filters: [] }
  },
  {
    group: 'Filters',
    name: 'removes duplicates',
    run: () =>
      new SearchParamEngine({ filters: BLUEPRINTS.filters(['type:file']) })
        .full(params('filters=type:file'))
        .toObject(),
    expected: { filters: ['type:file'] }
  },

  // Object
  {
    group: 'Object',
    name: 'merges a partial object over the default',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ a: 1, b: 2 }) }).full(params('config={"a":3}')).toObject(),
    expected: { config: { a: 3, b: 2 } }
  },
  {
    group: 'Object',
    name: 'merges nested objects key by key',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ list: { x: 1, y: 2 } }) })
        .full(params('config={"list":{"y":5}}'))
        .toObject(),
    expected: { config: { list: { x: 1, y: 5 } } }
  },
  {
    group: 'Object',
    name: 'replaces arrays instead of merging them',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ ids: ['a', 'b'] }) })
        .full(params('config={"ids":["c"]}'))
        .toObject(),
    expected: { config: { ids: ['c'] } }
  },
  {
    group: 'Object',
    name: 'rejects a value whose type differs from the default',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ ids: ['default'], limit: 5 }) })
        .full(params('config={"ids":false}'))
        .toObject(),
    expected: { config: { ids: ['default'], limit: 5 } }
  },
  {
    group: 'Object',
    name: 'rejects a nested primitive of the wrong type',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ limit: 5 }) })
        .full(params('config={"limit":"5"}'))
        .toObject(),
    expected: { config: { limit: 5 } }
  },
  {
    group: 'Object',
    name: 'falls back to the default for invalid JSON',
    run: () => new SearchParamEngine({ config: BLUEPRINTS.object({ a: 1 }) }).full(params('config={bad')).toObject(),
    expected: { config: { a: 1 } }
  },
  {
    group: 'Object',
    name: 'keeps a __proto__ key as an own property',
    run: () => {
      const { config } = new SearchParamEngine({ config: BLUEPRINTS.object({ a: 1 }) })
        .full(params('config={"__proto__":{"polluted":true}}'))
        .toObject();

      return {
        ownKey: Object.hasOwn(config, '__proto__'),
        plainPrototype: Object.getPrototypeOf(config) === Object.prototype,
        inherited: 'polluted' in config
      };
    },
    expected: { ownKey: true, plainPrototype: true, inherited: false }
  },

  // Modifiers
  {
    group: 'Modifiers',
    name: 'locked ignores the url value',
    run: () =>
      new SearchParamEngine({ fixed: BLUEPRINTS.string('fixed').locked() }).full(params('fixed=changed')).toObject(),
    expected: { fixed: 'fixed' }
  },
  {
    group: 'Modifiers',
    name: 'nullable accepts null',
    run: () =>
      new SearchParamEngine({ config: BLUEPRINTS.object({ a: 1 }).nullable() }).full(params('config=null')).toObject(),
    expected: { config: null }
  },
  {
    group: 'Modifiers',
    name: 'null falls back to the default when not nullable',
    run: () => new SearchParamEngine({ config: BLUEPRINTS.object({ a: 1 }) }).full(params('config=null')).toObject(),
    expected: { config: { a: 1 } }
  },
  {
    group: 'Modifiers',
    name: 'describes the configuration of a param',
    run: () => {
      const { page } = new SearchParamEngine({
        page: BLUEPRINTS.number(2).min(1).max(5).ephemeral()
      }).describeParams();

      return { kind: page.kind, min: page.min, max: page.max, ephemeral: page.ephemeral };
    },
    expected: { kind: 'number', min: 1, max: 5, ephemeral: true }
  },

  // Sources
  {
    group: 'Sources',
    name: 'reads a state param from location.state',
    run: () =>
      new SearchParamEngine({ panel: BLUEPRINTS.string('').source('state') })
        .fromRoute('/list?panel=url', { panel: 'state' })
        .toObject(),
    expected: { panel: 'state' }
  },
  {
    group: 'Sources',
    name: 'reads a transient param from the transient values',
    run: () =>
      new SearchParamEngine({ row: BLUEPRINTS.string('').source('transient') })
        .fromRoute('/list?row=url', { row: 'state' }, { row: 'transient' })
        .toObject(),
    expected: { row: 'transient' }
  },
  {
    group: 'Sources',
    name: 'reads a search param from the href only',
    run: () => new SearchParamEngine({ q: BLUEPRINTS.string('') }).fromRoute('/list?q=url', { q: 'state' }).toObject(),
    expected: { q: 'url' }
  },
  {
    group: 'Sources',
    name: 'uses the default when a state param is absent',
    run: () =>
      new SearchParamEngine({ panel: BLUEPRINTS.string('').source('state') }).fromRoute('/list?panel=url').toObject(),
    expected: { panel: '' }
  },

  // Delta
  {
    group: 'Delta',
    name: 'omits values equal to the default',
    run: () => pageEngine().delta(params('page=1&q=hi')).toObject(),
    expected: { q: 'hi' }
  },
  {
    group: 'Delta',
    name: 'writes a sorted query string',
    run: () => pageEngine().delta(params('q=b&page=2')).toString(),
    expected: 'page=2&q=b'
  },
  {
    group: 'Delta',
    name: 'round-trips delta, search and full',
    run: () => {
      const engine = pageEngine();
      const search = engine.delta({ page: 3, q: '' }).toString();
      return [search, engine.full(params(search)).toObject()];
    },
    expected: ['page=3', { page: 3, q: '' }]
  },
  {
    group: 'Delta',
    name: 'applies saved defaults',
    run: () =>
      new SearchParamEngine({ page: BLUEPRINTS.number(1) })
        .setDefaultValues(params('page=5'))
        .full(params(''))
        .toObject(),
    expected: { page: 5 }
  },

  // Snapshot
  {
    group: 'Snapshot',
    name: 'picks keys',
    run: () => pageEngine().full(params('page=4&q=z')).pick(['page']).toObject(),
    expected: { page: 4 }
  },
  {
    group: 'Snapshot',
    name: 'omits keys',
    run: () => pageEngine().full(params('page=4&q=z')).omit(['page']).toObject(),
    expected: { q: 'z' }
  },
  {
    group: 'Snapshot',
    name: 'matches a value with has()',
    run: () => {
      const snapshot = pageEngine().full(params('q=z'));
      return [snapshot.has('q'), snapshot.has('q', 'z'), snapshot.has('q', 'nope')];
    },
    expected: [true, true, false]
  },
  {
    group: 'Snapshot',
    name: 'returns null for an unknown key',
    run: () =>
      pageEngine()
        .full(params(''))
        .get('missing' as never),
    expected: null
  },
  {
    group: 'Snapshot',
    name: 'resets to the defaults',
    run: () => pageEngine().full(params('page=4&q=z')).defaults().toObject(),
    expected: { page: 1, q: '' }
  },
  {
    group: 'Snapshot',
    name: 'derives a new snapshot with set()',
    run: () =>
      pageEngine()
        .full(params('page=4'))
        .set(prev => ({ ...prev, page: prev.page + 1 }))
        .get('page'),
    expected: 5
  },
  {
    group: 'Snapshot',
    name: 'splits the location output by source',
    run: () => {
      const snapshot = mixedSourceEngine().full({ page: 3, panel: 'x', row: 'r' });
      return {
        search: snapshot.toLocationSearch(),
        state: snapshot.toLocationState(),
        transient: snapshot.toLocationTransient()
      };
    },
    expected: { search: 'page=3', state: { panel: 'x' }, transient: { row: 'r' } }
  },
  {
    group: 'Snapshot',
    name: 'keeps only the changed keys of a transient object',
    run: () =>
      new SearchParamEngine({
        count: BLUEPRINTS.number(1).source('transient'),
        config: BLUEPRINTS.object({ a: { x: 1, y: 2 }, b: 2 }).source('transient')
      })
        .full({ count: 1, config: { a: { x: 1, y: 3 }, b: 2 } })
        .toLocationTransient(),
    expected: { config: { a: { y: 3 } } }
  },
  {
    group: 'Snapshot',
    name: 'lists the keys of each source',
    run: () => {
      const snapshot = mixedSourceEngine().full(params(''));
      return [snapshot.sourceKeys('search'), snapshot.sourceKeys('state'), snapshot.sourceKeys('transient')];
    },
    expected: [['page'], ['panel'], ['row']]
  }
];

/**
 * @name runSearchParamsCheck
 * @description Evaluates a check and compares its result with the expected value as JSON.
 * @param check - Check to evaluate
 * @returns The outcome, with the error text as `actual` when the check throws
 */
export const runSearchParamsCheck = (check: SearchParamsCheck): SearchParamsCheckResult => {
  const expected = String(JSON.stringify(check.expected));
  let actual: string;

  try {
    actual = String(JSON.stringify(check.run()));
  } catch (error) {
    actual = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  return { actual, expected, group: check.group, name: check.name, passed: actual === expected };
};
