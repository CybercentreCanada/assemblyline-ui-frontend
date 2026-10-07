import { AppNotificationServiceContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppNotification() {
  return useContext(AppNotificationServiceContext);
}
