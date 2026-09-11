export const MSG_TYPES = ['ServiceHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.service_heartbeat.ServiceMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Service Metrics
 */
export type Metrics = {
  /** Number of cache hits */
  cache_hit: number;

  /** Number of cache misses */
  cache_miss: number;

  /** Number of cache skips */
  cache_skipped: number;

  /** Number of service executions */
  execute: number;

  /** Number of recoverable failures */
  fail_recoverable: number;

  /** Number of non-recoverable failures */
  fail_nonrecoverable: number;

  /** Number of tasks scored */
  scored: number;

  /** Number of tasks not scored */
  not_scored: number;
};

/**
 * Service Activity
 */
export type Activity = {
  /** Number of busy instances */
  busy: number;

  /** Number of idle instances */
  idle: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  duty_cycle: number;

  last_hb: number;

  scaler: any;

  up: string[];

  down: string[];

  timing: Record<string, number>;

  /** Service activity */
  activity: Activity;

  /** Number of service instances */
  instances: number;

  /** Service metrics */
  metrics: Metrics;

  /** Service queue size */
  queue: number;

  /** Name of the service */
  service_name: string;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Service Heartbeat Message
 */
export type ServiceMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
