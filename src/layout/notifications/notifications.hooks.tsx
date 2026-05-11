import { useAppConfig } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import type { MinimalService } from 'layout/notifications/notifications.models';
import {
  applyLegacyNotificationRules,
  fetchJSONNotifications,
  markItemsAsNewerThan,
  readLastOpenedAt,
  writeLastOpenedAt
} from 'layout/notifications/notifications.utils';
import { useCallback, useEffect, useMemo } from 'react';

const EMPTY_FEED_URLS: string[] = [];
const EMPTY_SERVICES: MinimalService[] = [];

//*****************************************************************************************
// useNotificationFeed
//*****************************************************************************************

/**
 * @name useNotificationFeed
 * @description Fetches notification feeds and applies filtering rules. Stores results in interface store.
 */
export const useNotificationFeed = (): void => {
  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const configuration = useAppConfig(s => s?.configuration || null);
  const feedUrls = useMemo(() => configuration?.ui?.rss_feeds ?? EMPTY_FEED_URLS, [configuration]);

  const setInterface = useAppSetInterfaceStore();

  useEffect(() => {
    if (!configuration || !feedUrls?.length) return;

    setInterface(s => {
      s.notifications.loading = true;
      return s;
    });

    const lastOpenedAt = readLastOpenedAt();

    fetchJSONNotifications({
      urls: feedUrls,
      onSuccess: fetchedItems => {
        const processed = applyLegacyNotificationRules({
          config: configuration,
          isAdmin,
          items: fetchedItems,
          lastOpenedAt,
          services: EMPTY_SERVICES
        });

        setInterface(s => {
          s.notifications.items = processed;
          s.notifications.loading = false;
          return s;
        });
      },
      onError: () => {
        setInterface(s => {
          s.notifications.loading = false;
          return s;
        });
      }
    });
  }, [configuration, feedUrls, isAdmin, setInterface]);
};

//*****************************************************************************************
// useNotificationClose
//*****************************************************************************************

/**
 * @name useNotificationClose
 * @description Returns a callback that closes the drawer, marks items as read, and persists timestamp.
 */
export const useNotificationClose = (): (() => void) => {
  const setInterface = useAppSetInterfaceStore();

  return useCallback(() => {
    const now = new Date();
    writeLastOpenedAt(now);

    setInterface(s => {
      s.notifications.open = false;
      s.notifications.read = true;
      s.notifications.items = markItemsAsNewerThan([...s.notifications.items], now);
      return s;
    });
  }, [setInterface]);
};

//*****************************************************************************************
// useNotificationOpen
//*****************************************************************************************

/**
 * @name useNotificationOpen
 * @description Returns a callback that opens the notification drawer.
 */
export const useNotificationOpen = (): (() => void) => {
  const setInterface = useAppSetInterfaceStore();

  return useCallback(() => {
    setInterface(s => {
      s.notifications.open = true;
      return s;
    });
  }, [setInterface]);
};

//*****************************************************************************************
// useNotificationNewCount
//*****************************************************************************************

/**
 * @name useNotificationNewCount
 * @description Returns the count of unread notifications.
 */
export const useNotificationNewCount = (): number =>
  useAppInterfaceStore(s => s.notifications.items.filter(item => item?._isNew).length);
