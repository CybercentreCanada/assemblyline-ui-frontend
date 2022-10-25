import { XMLParser } from 'fast-xml-parser';
import { useCallback, useMemo } from 'react';

export type FeedType = 'RSS 2.0' | 'Atom 1.0' | 'Unknown';

export type FeedImage = {
  title: string;
  url?: string;
  link?: string;
};

export type EnclosureImage = {
  type?: string;
  length?: number;
  url?: string;
};

export type FeedItem = {
  guid?: string;
  pubDate: Date;
  title?: string;
  description?: string;
  link?: string;
  enclosure?: EnclosureImage;
  isNew: boolean;
};

export type FeedChannel = {
  title?: string;
  description?: string;
  link?: string;
  language?: string;
  lastBuildDate?: Date;
  copyright?: string;
  docs?: string;
  image?: FeedImage;
};

export type FeedMetadata = {
  status?: number;
  message?: string;
  url?: string;
  size?: string;
  type?: string;
  version?: string;
  itemsCount?: number;
};

export type Feed = {
  metadata?: FeedMetadata;
  channel?: FeedChannel;
  items: FeedItem[];
};

type ConversionTable = Array<{ type: 'string' | 'date'; origin: Array<string>; source: Array<string> }>;

type FetchNotificationsProps = {
  urls: Array<string>;
  lastTimeOpen?: Date;
  onSuccess?: (feeds: Array<FeedItem>) => void;
  onError?: (err: any) => void;
};

export type UseNotificationFeedReturn = {
  DEFAULT_ITEM: FeedItem;
  DEFAULT_CHANNEL: FeedChannel;
  fetchNotifications: (props: FetchNotificationsProps) => void;
  fetchNotificationFeeds: (urls: Array<string>) => Promise<Feed[]>;
};

export const useNotificationFeed = (): UseNotificationFeedReturn => {
  const DEFAULT_ITEM = useMemo<FeedItem>(
    () => ({
      guid: null,
      pubDate: null,
      title: null,
      description: null,
      link: null,
      enclosure: null,
      isNew: false
    }),
    []
  );

  const DEFAULT_CHANNEL_IMAGE = useMemo<FeedImage>(
    () => ({
      title: null,
      url: null,
      link: null
    }),
    []
  );

  const DEFAULT_CHANNEL = useMemo<FeedChannel>(
    () => ({
      title: null,
      description: null,
      link: null,
      language: null,
      lastBuildDate: null,
      copyright: null,
      docs: null,
      image: DEFAULT_CHANNEL_IMAGE
    }),
    [DEFAULT_CHANNEL_IMAGE]
  );

  const DEFAULT_METADATA = useMemo<FeedMetadata>(
    () => ({
      type: null,
      version: null,
      status: null,
      message: null,
      url: null,
      size: null,
      itemsCount: null
    }),
    []
  );

  const DEFAULT_NOTIFICATION = useMemo<Feed>(
    () => ({
      metadata: { ...DEFAULT_METADATA },
      channel: { ...DEFAULT_CHANNEL },
      items: []
    }),
    [DEFAULT_CHANNEL, DEFAULT_METADATA]
  );

  const RSSChannelConversion = useMemo<ConversionTable>(
    () => [
      { type: 'string', origin: ['channel', 'title'], source: ['rss', 'channel', 'title'] },
      { type: 'string', origin: ['channel', 'description'], source: ['rss', 'channel', 'description'] },
      { type: 'string', origin: ['channel', 'link'], source: ['rss', 'channel', 'link'] },
      { type: 'string', origin: ['channel', 'language'], source: ['rss', 'channel', 'language'] },
      { type: 'date', origin: ['channel', 'lastBuildDate'], source: ['rss', 'channel', 'lastBuildDate'] },
      { type: 'string', origin: ['channel', 'copyright'], source: ['rss', 'channel', 'copyright'] },
      { type: 'string', origin: ['channel', 'docs'], source: ['rss', 'channel', 'docs'] },
      { type: 'string', origin: ['channel', 'image', 'title'], source: ['rss', 'channel', 'image', 'title'] },
      { type: 'string', origin: ['channel', 'image', 'link'], source: ['rss', 'channel', 'image', 'link'] },
      { type: 'string', origin: ['channel', 'image', 'url'], source: ['rss', 'channel', 'image', 'url'] }
    ],
    []
  );

  const RSSItems = useMemo<any>(() => ({ origin: ['items'], source: ['rss', 'channel', 'item'] }), []);

  const RSSItemConversion = useMemo<ConversionTable>(
    () => [
      { type: 'string', origin: ['guid'], source: ['guid'] },
      { type: 'date', origin: ['pubDate'], source: ['pubDate'] },
      { type: 'string', origin: ['title'], source: ['title'] },
      { type: 'string', origin: ['description'], source: ['description'] },
      { type: 'string', origin: ['link'], source: ['link'] },
      { type: 'string', origin: ['enclosure'], source: ['enclosure'] }
    ],
    []
  );

  const cleanTag = (text: string): string =>
    text.replace('<![CDATA[', '').replace(']]>', '').replace('<p>', '').replace('</p>', '');

  const formatByte = useCallback((bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }, []);

  const getValueFromPath = useCallback((obj: object, path: Array<string>): string | number | object => {
    let current = obj;
    let i;

    for (i = 0; i < path.length; ++i) {
      if (current[path[i]] === undefined) {
        return undefined;
      }
      current = current[path[i]];
    }
    return current;
  }, []);

  const setValueFromPath = useCallback(
    (obj: object, path: Array<string>, value: any, type: 'string' | 'number' | 'date' = 'string') => {
      if (path === null || path === undefined) return null;
      else if (path.length === 0) {
        if (type === 'date') return new Date(value);
        else return value;
      } else
        return Object.keys(obj).includes(path[0])
          ? { ...obj, [path[0]]: setValueFromPath(obj[path[0]], [...path.slice(1)], value, type) }
          : { ...obj };
    },
    []
  );

  const parseFeed = useCallback(
    (origin: Feed, source: Object): Feed => {
      if (origin.metadata.type === 'rss') {
        RSSChannelConversion.map(channel => {
          const value = getValueFromPath(source, channel.source);
          origin = setValueFromPath(origin, channel.origin, value, channel.type);
          return channel;
        });

        const sourceItems: Array<any> = getValueFromPath(source, RSSItems.source) as Array<any>;
        const newItems = sourceItems.map(sourceItem => {
          let newItem = { ...DEFAULT_ITEM };
          RSSItemConversion.map(item => {
            let value = getValueFromPath(sourceItem, item.source);
            if (typeof value === 'string')
              newItem = setValueFromPath(newItem, item.origin, cleanTag(value as string), item.type);
            return item;
          });
          return newItem;
        });
        return { ...origin, channel: { ...origin.channel }, items: [...newItems] };
      }
    },
    [DEFAULT_ITEM, RSSChannelConversion, RSSItemConversion, RSSItems.source, getValueFromPath, setValueFromPath]
  );

  const fetchNotificationFeed = useCallback(
    (url: string): Promise<Feed> =>
      new Promise(async (resolve, reject) => {
        let n: Feed = { ...DEFAULT_NOTIFICATION };

        const response: Response = (await fetch(url, { method: 'GET' }).catch(err => reject(err))) as Response;

        if (response === undefined || response === null) {
          resolve({ ...n, metadata: { ...n.metadata, status: 403, url } });
          return;
        } else if ([404, 502, 400].includes(response.status)) {
          resolve({ ...n, metadata: { ...n.metadata, status: response.status, url: response.url } });
          return;
        }

        const blob: Blob = await response.clone().blob();
        n = {
          ...n,
          metadata: {
            ...n.metadata,
            status: response.status,
            url: response.url,
            type: blob.type,
            size: formatByte(blob.size)
          }
        };
        if (!['text/xml', 'application/rss', 'application/xml', 'application/atom'].includes(blob.type)) {
          resolve({ ...n, metadata: { ...n.metadata, status: 415 } });
          return;
        }
        if (blob.size > 100000) {
          resolve({ ...n, metadata: { ...n.metadata, status: 413 } });
          return;
        }

        const textResponse: string = await response.clone().text();
        const document = new window.DOMParser().parseFromString(textResponse, 'text/xml');

        const child = document.children;
        const { type, version } =
          child.length > 0
            ? { type: child[0].tagName, version: child[0].getAttribute('version') }
            : { type: null, version: null };

        n = { ...n, metadata: { ...n.metadata, type, version } };
        const xmlParser = new XMLParser();
        let json = xmlParser.parse(textResponse);
        n = parseFeed(n, json);
        resolve({ ...n });
      }),
    [DEFAULT_NOTIFICATION, formatByte, parseFeed]
  );

  const fetchNotificationFeeds = useCallback(
    (urls: Array<string> = []): Promise<Feed[]> =>
      new Promise(async (resolve, reject) => {
        if (!urls) {
          reject('no urls');
          return;
        }
        const n: Feed[] = (await Promise.all(urls.map(url => fetchNotificationFeed(url))).catch(err =>
          reject(err)
        )) as Feed[];
        resolve(n);
      }),
    [fetchNotificationFeed]
  );

  const fetchNotifications = useCallback(
    ({ urls, lastTimeOpen = new Date(0), onSuccess = null, onError = null }: FetchNotificationsProps): void => {
      fetchNotificationFeeds(urls)
        .then(feeds => {
          const newNotifications = feeds
            .flatMap(f => f.items)
            .map((n: FeedItem) => ({ ...n, isNew: n.pubDate.valueOf() > lastTimeOpen.valueOf() }))
            .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
          onSuccess(newNotifications);
        })
        .catch(err => onError && onError(err));
    },
    [fetchNotificationFeeds]
  );

  return { DEFAULT_ITEM, DEFAULT_CHANNEL, fetchNotifications, fetchNotificationFeeds };
};
