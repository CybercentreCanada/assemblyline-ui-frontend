//*****************************************************************************************
// Search Params Checks
//*****************************************************************************************

/** A single assertion against the search-params feature, evaluated live in the library. */
export type SearchParamsCheck = {
  /** Value the check is expected to produce, compared as JSON. */
  expected: unknown;
  /** Group the check is listed under. */
  group: string;
  /** Short description of the behavior under test. */
  name: string;
  /** Produces the actual value that is compared against `expected`. */
  run: () => unknown;
};

export const DEFAULT_SEARCH_PARAMS_CHECK: SearchParamsCheck = {
  expected: null,
  group: '',
  name: '',
  run: () => null
};

/** Outcome of evaluating a `SearchParamsCheck`. */
export type SearchParamsCheckResult = {
  /** JSON of the value the check produced, or the error it threw. */
  actual: string;
  /** JSON of the value the check was expected to produce. */
  expected: string;
  /** Group the check is listed under. */
  group: string;
  /** Short description of the behavior under test. */
  name: string;
  /** Whether `actual` equals `expected`. */
  passed: boolean;
};

export const DEFAULT_SEARCH_PARAMS_CHECK_RESULT: SearchParamsCheckResult = {
  actual: '',
  expected: '',
  group: '',
  name: '',
  passed: false
};

//*****************************************************************************************
// Search Params Kind Demo
//*****************************************************************************************

/** Everything an engine produces for one query string. */
export type SearchParamsKindResult = {
  /** Values that differ from the defaults. */
  delta: unknown;
  /** Query string written for the delta. */
  search: string;
  /** Fully resolved values, with defaults filled in. */
  values: unknown;
};

export const DEFAULT_SEARCH_PARAMS_KIND_RESULT: SearchParamsKindResult = {
  delta: {},
  search: '',
  values: {}
};

/** A demo bound to one engine, resolving any query string through it. */
export type SearchParamsKindDemo = {
  /** Query string the demo starts with. */
  initial: string;
  /** Resolves a query string through the demo's engine. */
  resolve: (query: string) => SearchParamsKindResult;
};

export const DEFAULT_SEARCH_PARAMS_KIND_DEMO: SearchParamsKindDemo = {
  initial: '',
  resolve: () => DEFAULT_SEARCH_PARAMS_KIND_RESULT
};
