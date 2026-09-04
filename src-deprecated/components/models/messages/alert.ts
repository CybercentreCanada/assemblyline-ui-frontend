import type { Alert } from 'components/models/base/alert';

export const MSG_TYPES = ['AlertCreated', 'AlertUpdated'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.alert.AlertMessage';

export type MsgTypes = (typeof MSG_TYPES)[number];

/** Model of Alert Message */
export type AlertMessage = {
  /** Message of alert */
  msg: Alert;

  /** Loader class for messages */
  msg_loader: typeof LOADER_CLASS;

  /** Type of Message */
  msg_type: MsgTypes;

  /** Sender of message */
  sender: string;
};
