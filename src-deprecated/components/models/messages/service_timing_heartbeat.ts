export const MSG_TYPES = ['ServiceTimingHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.service_heartbeat.ServiceTimingMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Timing Metrics
 */
export type Metrics = {
  /** Execution time */
  execution: number; // Assuming `PerformanceTimer` represents a numeric timing value.

  /** Number of executes */
  execution_count: number;

  /** Idle time */
  idle: number; // Assuming `PerformanceTimer` represents a numeric timing value.

  /** Number of idles */
  idle_count: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Number of instances */
  instances: number;

  /** Metrics */
  metrics: Metrics;

  /** Queue size */
  queue: number;

  /** Name of the service */
  service_name: string;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Service Timing Heartbeat Message
 */
export type ServiceTimingMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
