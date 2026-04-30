import { SystemMessage } from 'models/ui/user';
import z from 'zod';
import { DEFAULT_SYSTEM_MESSAGE } from './notifications.models';

export const AppLayoutNotificationsSettingsSchema = null;

export type AppLayoutNotificationsSettings = z.infer<typeof AppLayoutNotificationsSettingsSchema>;

export type AppLayoutNotificationsConfig = {
  open: boolean;
  read?: boolean;
  loading?: boolean;
  items?: any[];
  announcementEditOpen?: boolean;
  announcementDeleteOpen?: boolean;
  announcementDraft?: SystemMessage;
  announcementSaving?: boolean;
  announcementDeleting?: boolean;
  saveConfirmationOpen?: boolean;
};

export const APP_LAYOUT_NOTIFICATIONS_CONFIG: AppLayoutNotificationsConfig = {
  open: false,
  read: false,
  loading: false,
  items: [],
  announcementEditOpen: false,
  announcementDeleteOpen: false,
  announcementDraft: DEFAULT_SYSTEM_MESSAGE,
  announcementSaving: false,
  announcementDeleting: false,
  saveConfirmationOpen: false
};
