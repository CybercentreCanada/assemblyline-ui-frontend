import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { Feed, FeedItem, FeedSchema, FeedURLsSchema } from 'components/models/notification';
import { Service, ServicesSchema } from 'components/models/service';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * JSON Feed Version 1.1
 * https://www.jsonfeed.org/
 */

export type JSONFeedItemAttachment = {
  url: string;
  mime_type: string;
  title?: string;
  size_in_bytes?: number;
  duration_in_seconds?: number;
};

export type JSONFeedAuthor = {
  name?: string;
  url?: string;
  avatar?: string;
};

export type JSONFeedItem = {
  id: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  content_md?: string;
  summary?: string;
  image?: string;
  banner_image?: string;
  date_published?: Date;
  date_modified?: Date;
  authors?: Array<JSONFeedAuthor>;
  tags?: Array<'new' | 'current' | 'dev' | 'service' | 'blog'>;
  language?: string;
  attachments?: Array<JSONFeedItemAttachment>;
  _isNew: boolean;
};

export type JSONFeed = {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  user_comment?: string;
  next_url?: string;
  icon?: string;
  favicon?: string;
  authors?: Array<JSONFeedAuthor>;
  language?: string;
  expired?: boolean;
  hubs?: Array<{ type: string; url: string }>;
  items: Array<JSONFeedItem>;
};

type FetchJSONProps = {
  urls: Array<string>;
  onSuccess?: (feeds: Array<JSONFeedItem>) => void;
  onError?: (err: any) => void;
};

export type UseNotificationFeedReturn = {
  fetchJSONFeeds: (urls?: Array<string>) => Promise<JSONFeed[]>;
  fetchJSONNotifications: ({ urls, onSuccess, onError }: FetchJSONProps) => void;
};

export const useNotificationFeed = (): UseNotificationFeedReturn => {
  const DEFAULT_JSON_FEED_ITEM_ATTACHMENT = useMemo<JSONFeedItemAttachment>(
    () => ({
      url: null,
      mime_type: null,
      title: null,
      size_in_bytes: 0,
      duration_in_seconds: 0
    }),
    []
  );

  const DEFAULT_JSON_FEED_AUTHOR = useMemo<JSONFeedAuthor>(
    () => ({
      name: null,
      url: null,
      avatar: null
    }),
    []
  );

  const DEFAULT_JSON_FEED_ITEM = useMemo<JSONFeedItem>(
    () => ({
      id: null,
      url: null,
      external_url: null,
      title: null,
      content_html: null,
      content_text: null,
      summary: null,
      image: null,
      banner_image: null,
      date_published: new Date(0),
      date_modified: new Date(0),
      authors: [],
      tags: [],
      language: null,
      attachments: [],
      _isNew: false
    }),
    []
  );

  const DEFAULT_JSON_FEED = useMemo<JSONFeed>(
    () => ({
      version: null,
      title: null,
      home_page_url: null,
      feed_url: null,
      description: null,
      user_comment: null,
      next_url: null,
      icon: null,
      favicon: null,
      authors: [],
      language: null,
      expired: false,
      hubs: [],
      items: []
    }),
    []
  );

  const decodeHTML = useCallback((html: string) => {
    if (!html) return '';
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }, []);

  const parseJSONFeedItemAttachment = useCallback(
    (attachments: Array<any>): Array<JSONFeedItemAttachment> =>
      !attachments ? [] : attachments.map(attachment => ({ ...DEFAULT_JSON_FEED_ITEM_ATTACHMENT, ...attachment })),
    [DEFAULT_JSON_FEED_ITEM_ATTACHMENT]
  );

  const parseJSONFeedAuthor = useCallback(
    (authors: Array<any>): Array<JSONFeedAuthor> =>
      !authors ? [] : authors.map(author => ({ ...DEFAULT_JSON_FEED_AUTHOR, ...author })),
    [DEFAULT_JSON_FEED_AUTHOR]
  );

  const parseJSONFeedItem = useCallback(
    (items: Array<any>) =>
      !items
        ? []
        : items.map(item => ({
            ...DEFAULT_JSON_FEED_ITEM,
            ...item,
            date_published: new Date(item.date_published),
            date_modified: new Date(item.date_modified),
            authors: parseJSONFeedAuthor(item?.authors),
            attachments: parseJSONFeedItemAttachment(item?.attachment),
            content_html: decodeHTML(item?.content_html)
          })),
    [DEFAULT_JSON_FEED_ITEM, decodeHTML, parseJSONFeedAuthor, parseJSONFeedItemAttachment]
  );

  const parseJSONFeed = useCallback(
    (feed: any): JSONFeed =>
      !feed
        ? null
        : {
            ...DEFAULT_JSON_FEED,
            ...feed,
            items: parseJSONFeedItem(feed?.items),
            authors: parseJSONFeedAuthor(feed?.authors)
          },
    [DEFAULT_JSON_FEED, parseJSONFeedAuthor, parseJSONFeedItem]
  );

  const fetchJSON = useCallback(
    (url: string): Promise<any> =>
      new Promise(async (resolve, reject) => {
        const response: Response = (await fetch(url, { method: 'GET' }).catch(err =>
          // eslint-disable-next-line no-console
          console.error(`Notification Area: error caused by URL "${err}`)
        )) as Response;

        if (!response) {
          resolve({ ...DEFAULT_JSON_FEED });
          return;
        }

        const textResponse: string = await response.text();
        const jsonFeed = JSON.parse(textResponse);
        resolve(parseJSONFeed(jsonFeed));
        return;
      }),
    [DEFAULT_JSON_FEED, parseJSONFeed]
  );

  const fetchJSONFeeds = useCallback(
    (urls: Array<string> = []): Promise<JSONFeed[]> =>
      new Promise(async (resolve, reject) => {
        if (!urls) {
          reject('no urls');
          return;
        }
        const feeds: JSONFeed[] = (await Promise.all(urls.map(url => fetchJSON(url))).catch(err =>
          reject(err)
        )) as JSONFeed[];
        resolve(feeds);
      }),
    [fetchJSON]
  );

  const fetchJSONNotifications = useCallback(
    ({ urls, onSuccess = null, onError = null }: FetchJSONProps): void => {
      fetchJSONFeeds(urls)
        .then(feeds => onSuccess && onSuccess(feeds.flatMap(f => f.items)))
        .catch(err => onError && onError(err));
    },
    [fetchJSONFeeds]
  );

  return { fetchJSONFeeds, fetchJSONNotifications };
};

type Props = {
  urls: string[];
  lastTimeOpen: Date;
};

export const useNotificationFeed2 = ({
  urls = [],
  lastTimeOpen = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
}: Props) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();

  const [feeds, setFeeds] = useState<Feed[]>(null);
  const [services, setServices] = useState<Service[]>(null);

  const isAdmin = useMemo<boolean>(() => currentUser && currentUser?.is_admin, [currentUser]);
  const systemVersion = useMemo<string>(() => configuration && configuration?.system?.version, [configuration]);
  const systemType = useMemo<'dev' | 'prod' | null>(
    () =>
      !systemVersion
        ? null
        : /(\d){1,}\.(\d){1,}\.(\d){1,}\.(d|D)ev(\d){1,}/g.test(systemVersion)
        ? 'dev'
        : /(\d){1,}\.(\d){1,}\.(\d){1,}\.(\d){1,}/g.test(systemVersion)
        ? 'prod'
        : null,
    [systemVersion]
  );

  const fetchFeed = useCallback(
    (url: string) =>
      new Promise<Feed>(async (resolve, reject) => {
        try {
          const response = await fetch(url, { method: 'GET' });
          const text = await response.text();
          const json = await JSON.parse(text);
          const feed = await FeedSchema.parse(json);
          resolve(feed);
        } catch (err) {
          reject(err);
        }
      }),
    []
  );

  const fetchAllFeeds = useCallback(
    (feedURLs: string[] = []) =>
      new Promise<Feed[]>(async (resolve, reject) => {
        try {
          const parsedURLs = await FeedURLsSchema.parse(feedURLs);
          const f = await Promise.all(parsedURLs.map(url => fetchFeed(url)));
          resolve(f);
        } catch (err) {
          reject(err);
        }
      }),
    [fetchFeed]
  );

  const areArraysEquals = useCallback(
    (a: any, b: any): boolean =>
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]),
    []
  );

  const areArrayHigher = useCallback((a: any, b: any): boolean => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    let i = 0;
    while (i < a.length) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
      else i++;
    }
    return false;
  }, []);

  const getVersionValues = useCallback(
    (value: string): Array<number> =>
      value
        ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
        ?.at(0)
        ?.replaceAll(/[^0-9.]/g, '')
        ?.split('.')
        ?.map(v => parseInt(v)),
    []
  );

  const isNewSystemVersion = useCallback(
    (item: FeedItem): null | 'newer' | 'current' | 'older' => {
      const notVer = item.url;
      if (!((/(d|D)ev/g.test(notVer) && systemType === 'dev') || (/(s|S)table/g.test(notVer) && systemType === 'prod')))
        return null;

      const notValues: Array<number> = getVersionValues(notVer);
      const sysValues: Array<number> = getVersionValues(systemVersion);

      if (areArraysEquals(notValues, sysValues)) return 'current';
      else if (areArrayHigher(notValues, sysValues)) return 'newer';
      else return 'older';
    },
    [areArrayHigher, areArraysEquals, getVersionValues, systemType, systemVersion]
  );

  const isNewService = useCallback(
    (item: FeedItem): null | boolean => {
      if (!/(s|S)ervice/g.test(item.title)) return null;
      const title = item?.title?.toLowerCase().slice(0, -16);
      return services.some(s => title === s?.name?.toLowerCase());
    },
    [services]
  );

  useEffect(() => {
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: ({ api_response }) => setServices(ServicesSchema.parse(api_response))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAllFeeds(urls)
      .then(data => setFeeds(data))
      .catch(e => console.error(e));
  }, [fetchAllFeeds, urls]);

  const notifications = useMemo<FeedItem[]>(
    () =>
      services &&
      feeds &&
      feeds
        .filter(f => f)
        .flatMap(f => f.items)
        .filter(n => {
          if (n.date_published < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) return false;
          else if (!isAdmin && isNewService(n) === false) return false;
          else if (!isAdmin && isNewSystemVersion(n) === 'newer') return false;
          else return true;
        })
        .sort((a, b) => b.date_published.getTime() - a.date_published.getTime())
        .map(n => ({
          ...n,
          _isNew: n.date_published > lastTimeOpen,
          tags: []
            .concat(isNewService(n) ? ['new'] : [])
            .concat(isAdmin && isNewService(n) === false ? ['new'] : [])
            .concat(isAdmin && isNewSystemVersion(n) === 'newer' ? ['new'] : [])
            .concat(isAdmin && isNewSystemVersion(n) === 'current' ? ['current'] : [])
            .concat(n.tags)
        })),
    [feeds, isAdmin, isNewService, isNewSystemVersion, lastTimeOpen, services]
  );

  console.log(notifications && notifications?.map(n => n.tags));

  return notifications;
};
