import type { SystemMessage } from 'models/api/user';
import type { JSONFeedItem } from './notifications.models';
import { DEFAULT_SYSTEM_MESSAGE } from './notifications.models';

/** Configuration state for the notifications layout. */
export type AppLayoutNotificationsConfig = {
  /** Whether the announcement delete dialog is open. */
  announcementDeleteOpen: boolean;
  /** Whether the announcement is currently being deleted. */
  announcementDeleting: boolean;
  /** Draft system message being edited. */
  announcementDraft: SystemMessage;
  /** Whether the announcement edit dialog is open. */
  announcementEditOpen: boolean;
  /** Whether the announcement is currently being saved. */
  announcementSaving: boolean;
  /** Fetched notification feed items. */
  items: JSONFeedItem[];
  /** Whether notifications are currently loading. */
  loading: boolean;
  /** Whether the notifications drawer is open. */
  open: boolean;
  /** Whether all notifications have been read. */
  read: boolean;
  /** Whether the save confirmation dialog is open. */
  saveConfirmationOpen: boolean;
};

export const APP_LAYOUT_NOTIFICATIONS_CONFIG: AppLayoutNotificationsConfig = {
  announcementDeleteOpen: false,
  announcementDeleting: false,
  announcementDraft: DEFAULT_SYSTEM_MESSAGE,
  announcementEditOpen: false,
  announcementSaving: false,
  items: [],
  loading: false,
  open: false,
  read: false,
  saveConfirmationOpen: false
};
