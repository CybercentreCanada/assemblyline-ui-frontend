export const MSG_TYPES = ['ScalerHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.scaler_heartbeat.ScalerMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Metrics
 */
export type Metrics = {
  /** Amount of free memory */
  memory_free: number;

  /** Amount of free CPU */
  cpu_free: number;

  /** Amount of total memory */
  memory_total: number;

  /** Amount of total CPU */
  cpu_total: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Number of instances */
  instances: number;

  /** Metrics */
  metrics: Metrics;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Scaler Heartbeat Message
 */
export type ScalerMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class of the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
