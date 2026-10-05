import { AppNotificationServiceContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import { useContext } from 'react';

export function useAppNotification() {
  return useContext(AppNotificationServiceContext);
}
