export const MSG_TYPES = ['ArchiveHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.archive_heartbeat.ArchiveMessage';

export type MsgType = (typeof MSG_TYPES)[number];

export type Metrics = {
  /** Number of files archived */
  file: number;

  /** Number of results archived */
  result: number;

  /** Number of submissions archived */
  submission: number;

  /** Number of received archive messages */
  received: number;

  /** Number of exceptions during archiving */
  exception: number;

  /** Number of invalid archive type errors during archiving */
  invalid: number;

  /** Number of submission not found failures during archiving */
  not_found: number;
};

export type Heartbeat = {
  /** Number of instances */
  instances: number;

  /** Archive metrics */
  metrics: Metrics;

  /** Number of documents to be archived */
  queued: number;

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

export type ArchiveMessage = {
  /** Heartbeat message */
  msg: Heartbeat;

  /** Loader class for message */
  msg_loader: typeof LOADER_CLASS;

  /** Message type */
  msg_type: MsgType;

  /** Sender of message */
  sender: string;
};
