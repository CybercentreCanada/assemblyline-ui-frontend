import { useApiQuery } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore, useAppSetPreferenceStore } from 'core/preference';
import type { MinimalService } from 'layout/notifications';
import {
  applyLegacyNotificationRules,
  fetchJSONNotifications,
  markItemsAsNewerThan,
  readLastOpenedAt
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
  const isAdmin = useAppConfigStore(s => Boolean(s?.user?.is_admin));
  const configuration = useAppConfigStore(s => s?.configuration || null);
  const notificationPreferences = useAppPreferenceStore(s => s.notifications);
  const feedUrls = useMemo(() => configuration?.ui?.rss_feeds ?? EMPTY_FEED_URLS, [configuration]);

  const setInterfaceStore = useAppSetInterfaceStore();

  const servicesQuery = useApiQuery<MinimalService[]>({
    disabled: !configuration || !feedUrls?.length,
    url: '/api/v4/service/all/'
  });

  const services = useMemo<MinimalService[]>(
    () => (Array.isArray(servicesQuery.data) ? servicesQuery.data : EMPTY_SERVICES),
    [servicesQuery]
  );

  useEffect(() => {
    if (!configuration || !feedUrls?.length) return;

    setInterfaceStore(s => {
      s.notifications.loading = true;
      return s;
    });

    const lastOpenedAt = readLastOpenedAt(notificationPreferences?.lastOpenedAt);

    fetchJSONNotifications({
      urls: feedUrls,
      onSuccess: fetchedItems => {
        const processed = applyLegacyNotificationRules({
          config: configuration,
          isAdmin,
          items: fetchedItems,
          lastOpenedAt,
          notificationPreferences,
          services
        });

        setInterfaceStore(s => {
          s.notifications.items = processed;
          s.notifications.loading = false;
          return s;
        });
      },
      onError: () => {
        setInterfaceStore(s => {
          s.notifications.loading = false;
          return s;
        });
      }
    });
  }, [configuration, feedUrls, isAdmin, notificationPreferences, services, setInterfaceStore]);
};

//*****************************************************************************************
// useNotificationClose
//*****************************************************************************************

/**
 * @name useNotificationClose
 * @description Returns a callback that closes the drawer, marks items as read, and persists timestamp.
 */
export const useNotificationClose = (): (() => void) => {
  const setInterfaceStore = useAppSetInterfaceStore();
  const setPreferenceStore = useAppSetPreferenceStore();

  return useCallback(() => {
    const now = new Date();

    setInterfaceStore(s => {
      s.notifications.open = false;
      s.notifications.read = true;
      s.notifications.items = markItemsAsNewerThan([...s.notifications.items], now);
      return s;
    });

    setPreferenceStore(s => {
      s.notifications.lastOpenedAt = now.valueOf();
      return s;
    });
  }, [setInterfaceStore, setPreferenceStore]);
};

//*****************************************************************************************
// useNotificationOpen
//*****************************************************************************************

/**
 * @name useNotificationOpen
 * @description Returns a callback that opens the notification drawer.
 */
export const useNotificationOpen = (): (() => void) => {
  const setInterfaceStore = useAppSetInterfaceStore();

  return useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.open = true;
      return s;
    });
  }, [setInterfaceStore]);
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
