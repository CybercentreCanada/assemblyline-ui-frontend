export const MSG_TYPES = ['VacuumHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.vacuum_heartbeat.VacuumMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Vacuum Stats
 */
export type Metrics = {
  /** Files ingested */
  ingested: number;

  /** Files safelisted */
  safelist: number;

  /** Number of errors */
  errors: number;

  /** Number of skipped files */
  skipped: number;
};

/**
 * Heartbeat Model
 */
export type Heartbeat = {
  /** Vacuum metrics */
  metrics: Metrics;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Vacuum Heartbeat Message
 */
export type VacuumMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
