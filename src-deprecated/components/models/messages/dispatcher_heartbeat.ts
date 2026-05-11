export const MSG_TYPES = ['DispatcherHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.dispatcher_heartbeat.DispatcherMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Queue Model
 */
export type Queues = {
  /** Number of submissions in ingest queue */
  ingest: number;

  /** Number of submissions that started */
  start: number[];

  /** Number of results in queue */
  result: number[];

  /** Number of commands in queue */
  command: number[];

  /** Number of files in queue */
  files: number;
};

/**
 * Inflight Model
 */
export type Inflight = {
  /** Maximum number of submissions */
  max: number;

  /** Number of outstanding submissions */
  outstanding: number;

  /** Number of submissions per Dispatcher instance */
  per_instance: number[];
};

/**
 * Metrics Model
 */
export type Metrics = {
  /** Number of files completed */
  files_completed: number;

  /** Number of submissions completed */
  submissions_completed: number;

  /** Number of service timeouts */
  service_timeouts: number;

  /** CPU time */
  cpu_seconds: number; // Assuming PerformanceTimer is represented as a `number`.

  /** CPU count */
  cpu_seconds_count: number;

  /** Busy CPU time */
  busy_seconds: number; // Assuming PerformanceTimer is represented as a `number`.

  /** Busy CPU count */
  busy_seconds_count: number;

  /** Processed submissions waiting to be saved */
  save_queue: number;

  /** Errors waiting to be saved */
  error_queue: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Inflight submissions */
  inflight: Inflight;

  /** Number of instances */
  instances: number;

  /** Dispatcher metrics */
  metrics: Metrics;

  /** Dispatcher queues */
  queues: Queues;

  /** Component name */
  component: string;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Dispatcher Heartbeat Messages
 */
export type DispatcherMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for message */
  msg_loader: typeof MSG_TYPES;

  /** Type of message */
  msg_type: MsgType;

  /** Sender of message */
  sender: string;
};
