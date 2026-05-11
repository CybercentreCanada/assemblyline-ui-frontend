export const DEFAULT_RETRY_MS = 10 * 1000;

/** The time in milliseconds after data is considered stale. If set to Infinity, the data will never be considered stale. If set to a function, the function will be executed with the query to compute a staleTime. */
export const DEFAULT_STALE_TIME = 0 * 60 * 1000;

/** The time in milliseconds that unused/inactive cache data remains in memory. When a query's cache becomes unused or inactive, that cache data will be garbage collected after this duration. When different garbage collection times are specified, the longest one will be used. Setting it to Infinity will disable garbage collection. */
export const DEFAULT_GC_TIME = 5 * 60 * 1000;

export const DEFAULT_INVALIDATE_DELAY = 1 * 1000;
