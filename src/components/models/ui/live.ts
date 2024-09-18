export const LIVE_STATUS = ['queued', 'processing', 'rescheduled'] as const;

export type LiveStatus = (typeof LIVE_STATUS)[number];

/** Starts a watch queue to get live results */
export type WatchQueue = { wq_id: string };

/** List outstanding services and the number of file each of them still have to process. */
export type OutstandingServices = { [service: string]: number };
