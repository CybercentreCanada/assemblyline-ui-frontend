import { type FC } from 'react';
import { useAppNotification } from './hooks/useAppNotification';
import { Notification } from './Notification';

export const AppNotifications: FC = () => {
  const { service, state } = useAppNotification();

  return (
    <Notification
      urls={service.feedUrls || state.urls}
      notificationItem={service.notificationRenderer}
      maxDrawerWidth="800px"
      openIfNew
    />
  );
};
