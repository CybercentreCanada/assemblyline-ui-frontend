export const MSG_TYPES = ['RetrohuntHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.alert.AlertMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/** Heartbeat Model for retrohunt */
export type Heartbeat = {
  /** Number of retrohunt workers */
  instances: number;

  /** Time to load metrics */
  request_time?: number;

  /** Files not yet available for searching */
  pending_files: number;

  /** Files ingested in last minute */
  ingested_last_minute: number;

  /** Free storage for most depleted worker */
  worker_storage_available: number;

  /** Free storage across workers */
  total_storage_available: number;

  /** Number of currently running searches */
  active_searches: number;

  /** Last minute cpu load across all workers" */
  last_minute_cpu: number;

  /** Estimated current memory use across all workers */
  total_memory_used: number;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/** Model of retrohunt heartbeat message */
export type RetrohuntMessage = {
  /** Heartbeat message for retrohunt */
  msg: Heartbeat;

  /** Loader class for message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of message */
  msg_type: MsgType;

  /** Sender of message */
  sender: string;
};
