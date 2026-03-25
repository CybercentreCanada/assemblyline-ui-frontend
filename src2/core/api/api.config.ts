import z from 'zod';

export const AppAPISettingsSchema = z.object({
  /** The time in milliseconds after data is considered stale. If set to Infinity, the data will never be considered stale. If set to a function, the function will be executed with the query to compute a staleTime. */
  staleTime: z.number().min(0).optional(),

  /** The time in milliseconds that unused/inactive cache data remains in memory. When a query's cache becomes unused or inactive, that cache data will be garbage collected after this duration. When different garbage collection times are specified, the longest one will be used. Setting it to Infinity will disable garbage collection. */
  gcTime: z.number().min(0).optional(),

  retryTime: z.number().min(0).optional(),

  invalidateDelay: z.number().min(0).optional()
});

export type AppAPISettings = z.infer<typeof AppAPISettingsSchema>;

export type AppAPIConfig = AppAPISettings & {
  showDevtools?: boolean;
};
