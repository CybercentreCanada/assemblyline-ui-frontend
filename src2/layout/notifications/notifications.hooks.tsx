import { APIResponse, useAPICallFn } from 'core/api';
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

const useNotificationActions = () => {
  const setConfig = useAppSetConfig();
  const items = useAppConfig(s => (s?.layout?.notifications?.items ?? []) as JSONFeedItem[]);

  const markSystemMessageAsRead = useCallback(() => {
    setConfig(s => {
      s.layout.notifications.read = true;
      return s;
    });
  }, [setConfig]);

  const openDrawer = useCallback(() => {
    setConfig(s => {
      s.layout.notifications.open = true;
      return s;
    });
  }, [setConfig]);

  const closeDrawer = useCallback(() => {
    const now = new Date();
    writeLastOpenedAt(now);

    setConfig(s => {
      s.layout.notifications.items = markItemsAsNewerThan(items, now);
      s.layout.notifications.open = false;
      s.layout.notifications.read = true;
      return s;
    });
  }, [items, setConfig]);

  const setLoading = useCallback(
    (isLoading: boolean) => {
      setConfig(s => {
        s.layout.notifications.loading = isLoading;
        return s;
      });
    },
    [setConfig]
  );

  const setItems = useCallback(
    (nextItems: JSONFeedItem[]) => {
      setConfig(s => {
        s.layout.notifications.items = nextItems;
        return s;
      });
    },
    [setConfig]
  );

  return {
    closeDrawer,
    markSystemMessageAsRead,
    openDrawer,
    setItems,
    setLoading
  };
};

const useRefreshNotifications = () => {
  const notificationFeedUrls = useAppConfig(
    s =>
      ((s?.configuration as any)?.ui?.notification_feed ??
        (s?.configuration as any)?.ui?.rss_feeds ??
        EMPTY_NOTIFICATION_FEED_URLS) as string[]
  );
  const isAdmin = useAppConfig(s => Boolean((s?.user as any)?.is_admin));
  const configuration = useAppConfig(s => (s?.configuration || null) as Configuration | null);
  const apiCall = useAPICallFn<APIResponse<unknown>>();
  const { setItems, setLoading } = useNotificationActions();

  return useCallback(() => {
    if (!configuration) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!notificationFeedUrls?.length) {
      setItems([]);
      setLoading(false);
      return;
    }

    const refreshWithServices = (services: MinimalService[]) => {
      fetchJSONNotifications({
        urls: notificationFeedUrls,
        onSuccess: fetchedItems => {
          const lastOpenedAt = readLastOpenedAt();
          setItems(
            applyLegacyNotificationRules({
              config: configuration,
              isAdmin,
              items: fetchedItems,
              lastOpenedAt,
              services
            })
          );
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        }
      });
    };

    setLoading(true);

    if (isAdmin) {
      refreshWithServices([]);
      return;
    }

    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: ({ api_response }) => {
        refreshWithServices(Array.isArray(api_response) ? (api_response as MinimalService[]) : []);
      },
      onFailure: () => {
        refreshWithServices([]);
      }
    });
  }, [apiCall, configuration, isAdmin, notificationFeedUrls, setItems, setLoading]);
};

export const useNotificationAutoRefresh = () => {
  const open = useAppConfig(s => s?.layout?.notifications?.open ?? false);

  const refreshNotifications = useRefreshNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!open) return;
    refreshNotifications();
  }, [open, refreshNotifications]);
};
