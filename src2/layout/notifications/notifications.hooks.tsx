import { useApiQuery } from 'core/api';
import { useAppConfig, useAppSetConfig } from 'core/config';
import type { Configuration } from 'models/base/config';
import { useCallback, useEffect } from 'react';
import type { JSONFeedItem } from './notifications.models';
import {
  applyLegacyNotificationRules,
  fetchJSONNotifications,
  markItemsAsNewerThan,
  type MinimalService,
  readLastOpenedAt,
  writeLastOpenedAt
} from './notifications.utils';

const EMPTY_NOTIFICATION_FEED_URLS: string[] = [];
const EMPTY_SERVICES: MinimalService[] = [];

export const useNotificationAutoRefresh = () => {
  const open = useAppConfig(s => s?.layout?.notifications?.open ?? false);
  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const configuration = useAppConfig(s => (s?.configuration || null) as Configuration | null);
  const notificationFeedUrls = useAppConfig(
    s => ((s?.configuration as Configuration)?.ui?.rss_feeds ?? EMPTY_NOTIFICATION_FEED_URLS) as string[]
  );
  const setConfig = useAppSetConfig();

  const servicesQuery = useApiQuery<MinimalService[]>({
    url: '/api/v4/service/all/',
    method: 'GET',
    disabled: isAdmin || !configuration || !notificationFeedUrls?.length
  });

  const services = servicesQuery.data ?? EMPTY_SERVICES;

  const refreshNotifications = useCallback(() => {
    if (!configuration || !notificationFeedUrls?.length) {
      setConfig(prev => ({
        layout: {
          ...prev.layout,
          notifications: { ...prev.layout.notifications, items: [], loading: false }
        }
      }));
      return;
    }

    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, loading: true }
      }
    }));

    fetchJSONNotifications({
      urls: notificationFeedUrls,
      onSuccess: fetchedItems => {
        const lastOpenedAt = readLastOpenedAt();
        const items = applyLegacyNotificationRules({
          config: configuration,
          isAdmin,
          items: fetchedItems,
          lastOpenedAt,
          services: isAdmin ? EMPTY_SERVICES : services
        });
        setConfig(prev => ({
          layout: {
            ...prev.layout,
            notifications: { ...prev.layout.notifications, items, loading: false }
          }
        }));
      },
      onError: () => {
        setConfig(prev => ({
          layout: {
            ...prev.layout,
            notifications: { ...prev.layout.notifications, loading: false }
          }
        }));
      }
    });
  }, [configuration, isAdmin, notificationFeedUrls, services, setConfig]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!open) return;
    refreshNotifications();
  }, [open, refreshNotifications]);
};

export const useNotificationClose = () => {
  const items = useAppConfig(s => s?.layout?.notifications?.items ?? []) as JSONFeedItem[];
  const setConfig = useAppSetConfig();

  return useCallback(() => {
    const now = new Date();
    writeLastOpenedAt(now);

    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: {
          ...prev.layout.notifications,
          items: markItemsAsNewerThan(items, now),
          open: false,
          read: true
        }
      }
    }));
  }, [items, setConfig]);
};
