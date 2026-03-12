export const MSG_TYPES = ['ExpiryHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.expiry_heartbeat.ExpiryMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Expiry Metrics
 */
export type Metrics = {
  /** Number of alerts */
  alert: number;

  /** Number of badlisted items */
  badlist: number;

  /** Number of cached files */
  cached_file: number;

  /** Number of empty results */
  emptyresult: number;

  /** Number of errors */
  error: number;

  /** Number of files */
  file: number;

  /** Number of filescores */
  filescore: number;

  /** Number of results */
  result: number;

  /** Number of Retrohunt hit */
  retrohunt_hit: number;

  /** Number of safelisted items */
  safelist: number;

  /** Number of submissions */
  submission: number;

  /** Number of submission trees */
  submission_tree: number;

  /** Number of submission summaries */
  submission_summary: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Number of instances */
  instances: number;

  /** Expiry metrics */
  metrics: Metrics;

  /** Expiry queues */
  queues: Metrics;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Expiry Heartbeat Message
 */
export type ExpiryMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
