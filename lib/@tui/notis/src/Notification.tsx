import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { type FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationItem } from './elements/item/NotificationItem';
import { NotificationContainer } from './elements/NotificationContainer';
import { NotificationTopNavButton } from './elements/NotificationTopNavButton';
import { type Feed, type FeedItem, parseFeed } from './FeedModels';

type Props = {
  urls: string[];
  notificationItem?: FC;
  inDrawer?: boolean;
  openIfNew?: boolean;
  maxDrawerWidth?: string;
};

export const Notification: FC<Props> = memo(
  ({
    urls = null,
    notificationItem = NotificationItem,
    inDrawer = true,
    openIfNew = false,
    maxDrawerWidth = '500px'
  }) => {
    const [drawer, setDrawer] = useState<boolean>(false);
    const [feeds, setFeeds] = useState<{ [k: string]: Feed }>(null);
    const [notifications, setNotifications] = useState<FeedItem[]>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    const lastTimeOpen = useRef<Date>(new Date(0));
    const storageKey = 'notification.lastTimeOpen';

    // Load the relativeTime plugin to be able to use fromNow()
    useMemo(() => {
      dayjs.extend(relativeTime);
    }, []);

    const onDrawerOpen = useCallback(() => {
      setDrawer(true);
      lastTimeOpen.current = new Date();
    }, []);

    const onDrawerClose = useCallback(() => {
      setDrawer(false);
      localStorage.setItem(storageKey, JSON.stringify(lastTimeOpen.current.valueOf()));
      setNotifications(v =>
        v.map((n: FeedItem) => ({ ...n, _isNew: n.date_published.valueOf() > lastTimeOpen.current.valueOf() }))
      );
    }, [storageKey]);

    const loadLastTimeOpen = useCallback(() => {
      const data = localStorage.getItem(storageKey);
      if (!data) return;

      const value = JSON.parse(data);
      if (typeof value !== 'number') return;

      lastTimeOpen.current = new Date(value);
    }, [storageKey]);

    const fetchFeed = useCallback(async (url: string = ''): Promise<Feed | object> => {
      let response = null;

      try {
        response = await fetch(url);

        if (!response || response.status >= 400) {
          return {};
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Notification Area: error caused by URL "${err}`);
        return {};
      }

      const textResponse: string = await response.text();
      try {
        const jsonFeed = JSON.parse(textResponse);
        return parseFeed(jsonFeed);
      } catch {
        return {};
      }
    }, []);

    const fetchFeeds = useCallback(
      async (urls: string[] = []): Promise<Feed[]> => {
        if (!urls || urls.length === 0) {
          return [];
        }
        const feeds: (Feed | object)[] = await Promise.all(urls.map(url => fetchFeed(url)));
        return feeds.filter(f => !!f['items']) as Feed[];
      },
      [fetchFeed]
    );

    useEffect(() => {
      loadLastTimeOpen();
      if (!urls || !Array.isArray(urls) || urls.length === 0) return;

      fetchFeeds(urls).then(_feeds => {
        _feeds = _feeds.map(f => ({ ...f, items: f?.items?.map(i => ({ ...i, external_url: f.feed_url })) }));
        setFeeds(Object.fromEntries(_feeds.map(f => [f?.feed_url, { ...f, items: [] }])));
        const _notifs = _feeds
          .flatMap(f => f?.items)
          .filter(n => n.date_published > new Date(new Date().setFullYear(new Date().getFullYear() - 1)))
          .sort((a, b) => b.date_published.valueOf() - a.date_published.valueOf())
          .map(n => ({ ...n, _isNew: n.date_published.valueOf() > lastTimeOpen.current.valueOf() }));
        setNotifications(_notifs);
        if (openIfNew && _notifs?.some(n => n._isNew)) {
          onDrawerOpen();
        }
      });
    }, [fetchFeeds, loadLastTimeOpen, onDrawerOpen, openIfNew, urls]);

    useEffect(() => {
      if (feeds === undefined) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus('error');
      } else if (feeds && notifications) {
        if (notifications.length === 0) {
          setStatus('error');
        } else {
          setStatus('ready');
        }
      } else {
        setStatus('loading');
      }
      return () => setStatus('loading');
    }, [feeds, notifications]);

    return (
      urls &&
      urls.length !== 0 && (
        <>
          {inDrawer && (
            <NotificationTopNavButton
              drawer={drawer}
              newItems={notifications?.filter(n => n._isNew).length}
              onDrawerOpen={onDrawerOpen}
              onDrawerClose={onDrawerClose}
            />
          )}
          <NotificationContainer
            status={status}
            notifications={notifications}
            drawer={drawer}
            onDrawerOpen={onDrawerOpen}
            onDrawerClose={onDrawerClose}
            ItemComponent={notificationItem}
            inDrawer={inDrawer}
            maxDrawerWidth={maxDrawerWidth}
          />
        </>
      )
    );
  }
);
