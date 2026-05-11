export const MSG_TYPES = ['ScalerStatusHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.scaler_status_heartbeat.ScalerStatusMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Service Status Model
 */
export type Status = {
  /** Number of instances running */
  running: number;

  /** Target scaling for the service */
  target: number;

  /** Minimum number of instances */
  minimum: number;

  /** Maximum number of instances */
  maximum: number;

  /** Dynamic maximum number of instances */
  dynamic_maximum: number;

  /** Service queue */
  queue: number;

  /** Service pressure */
  pressure: number;

  /** Duty Cycle */
  duty_cycle: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Name of service */
  service_name: string;

  /** Status of service */
  metrics: Status;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Scaler's Status Heartbeat Message
 */
export type ScalerStatusMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
