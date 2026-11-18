import type { SearchParamBlueprintMap, SearchParamSnapshot } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP as BLUEPRINTS, SearchParamEngine } from 'features/search-params';
import type { SearchParamsKindDemo } from 'routes/development-library/sections/search-params/search-params.models';

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
