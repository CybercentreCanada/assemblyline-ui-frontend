export const MSG_TYPES = ['AlerterHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.alerter_heartbeat.AlerterMessage';

export type MsgType = (typeof MSG_TYPES)[number];

export type Queues = {
  /** Number of alerts in queue */
  alert: number;

  /** Number of alerts in retry queue */
  alert_retry: number;
};

export type Metrics = {
  /** Number of alerts created */
  created: number;

  /** Number of alerts with errors */
  error: number;

  /** Number of alerts received */
  received: number;

  /** Number of alerts updated */
  updated: number;

  /** Number of alerts waiting for submission to complete */
  wait: number;
};

export type Heartbeat = {
  /** Number of Alerter instances */
  instances: number;

  /** Alert metrics */
  metrics: Metrics;

  /** Alert queues */
  queues: Queues;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

export type AlerterMessage = {
  /** Heartbeat message from Alerter */
  msg: Heartbeat;

  /** Loader class for message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of message */
  msg_type: MsgType;

  /** Sender of message */
  sender: string;
};
