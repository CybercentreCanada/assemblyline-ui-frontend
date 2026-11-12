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
