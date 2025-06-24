export const MSG_TYPES = ['IngestHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.ingest_heartbeat.IngestMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Queues
 */
export type Queues = {
  /** Size of the critical priority queue */
  critical: number;

  /** Size of the high priority queue */
  high: number;

  /** Size of the ingest queue */
  ingest: number;

  /** Size of the complete queue */
  complete: number;

  /** Size of the low priority queue */
  low: number;

  /** Size of the medium priority queue */
  medium: number;
};

/**
 * Metrics
 */
export type Metrics = {
  /** Number of cache misses */
  cache_miss: number;

  /** Number of cache expires */
  cache_expired: number;

  /** Number of cache stales */
  cache_stale: number;

  /** Number of local cache hits */
  cache_hit_local: number;

  /** Number of cache hits */
  cache_hit: number;

  /** Number of bytes completed */
  bytes_completed: number;

  /** Number of bytes ingested */
  bytes_ingested: number;

  /** Number of duplicate submissions */
  duplicates: number;

  /** Number of errors */
  error: number;

  /** Number of completed files */
  files_completed: number;

  /** Number of skipped files */
  skipped: number;

  /** Number of completed submissions */
  submissions_completed: number;

  /** Number of ingested submissions */
  submissions_ingested: number;

  /** Number of timed-out submissions */
  timed_out: number;

  /** Number of safelisted submissions */
  whitelisted: number;

  /** CPU time */
  cpu_seconds: number; // Assuming PerformanceTimer is represented as a number.

  /** CPU time count */
  cpu_seconds_count: number;

  /** Busy CPU time */
  busy_seconds: number; // Assuming PerformanceTimer is represented as a number.

  /** Busy CPU time count */
  busy_seconds_count: number;

  /** Number of safelisted submissions */
  safelisted: number;
};

/**
 * Processing
 */
export type Processing = {
  /** Number of inflight submissions */
  inflight: number;
};

/**
 * Chance of Processing
 */
export type ProcessingChance = {
  /** Chance of processing critical items */
  critical: number;

  /** Chance of processing high items */
  high: number;

  /** Chance of processing low items */
  low: number;

  /** Chance of processing medium items */
  medium: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Number of ingest processes */
  instances: number;

  /** Metrics */
  metrics: Metrics;

  /** Inflight queue sizes */
  processing: Processing;

  /** Chance of processing items */
  processing_chance: ProcessingChance;

  /** Queue lengths block */
  queues: Queues;

  /** Number of ingested files */
  ingest: number;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Ingester Heartbeat Message
 */
export type IngestMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
