import { useContext } from 'react';
import type { AppNotificationServiceContextType } from '../providers/AppNotificationProvider';
import { AppNotificationServiceContext } from '../providers/AppNotificationProvider';

export function useAppNotification(): AppNotificationServiceContextType {
  return useContext(AppNotificationServiceContext);
}
