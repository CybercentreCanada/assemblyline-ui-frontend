import type { ReactElement } from 'react';
import type { FeedItem } from './FeedModels';

export type ItemComponentProps = {
  item: FeedItem;
};

export type AppNotificationService = {
  feedUrls?: string[]; // Static urls can be provided at initialization or see state object (AppNotificationServiceState)
  notificationRenderer?: (props: ItemComponentProps) => ReactElement; // Custom component for notification rendering
};
