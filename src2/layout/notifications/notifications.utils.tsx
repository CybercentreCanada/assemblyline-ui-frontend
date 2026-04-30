import { Theme } from '@mui/material';
import { blue } from '@mui/material/colors';
import type { Configuration } from 'models/base/config';
import { CSSProperties } from 'react';
import { PossibleColor } from 'shared/utils/colors';
import {
  DEFAULT_JSON_FEED,
  DEFAULT_JSON_FEED_AUTHOR,
  DEFAULT_JSON_FEED_ITEM,
  DEFAULT_JSON_FEED_ITEM_ATTACHMENT,
  JSONFeed,
  JSONFeedAuthor,
  JSONFeedItem,
  JSONFeedItemAttachment
} from './notifications.models';

const NOTIFICATIONS_LAST_OPENED_AT_KEY = 'notifications.lastOpenedAt';
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

export type MinimalService = {
  name?: string;
};

export type NotificationVersionType = null | 'newer' | 'current' | 'older';

export const getColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme) => {
  const colors: Record<string, Record<number, CSSProperties>> = {
    error: {
      1: { color: theme.palette.error.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)' },
      3: { color: theme.palette.getContrastText(theme.palette.error.main) }
    },
    warning: {
      1: { color: theme.palette.warning.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)' },
      3: { color: theme.palette.getContrastText(theme.palette.warning.main) }
    },
    info: {
      1: { color: blue[500] },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)' },
      3: { color: theme.palette.getContrastText(theme.palette.primary.main) }
    },
    success: {
      1: { color: theme.palette.success.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)' },
      3: { color: theme.palette.getContrastText(theme.palette.success.main) }
    }
  };

  return colors?.[severity]?.[variant];
};

export const getBackgroundColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme) => {
  const backgroundColors: Record<string, Record<number, CSSProperties>> = {
    error: {
      1: { backgroundColor: theme.palette.error.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.error.main) }
    },
    warning: {
      1: { backgroundColor: theme.palette.warning.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.warning.main) }
    },
    info: {
      1: { backgroundColor: blue[500] },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.primary.main) }
    },
    success: {
      1: { backgroundColor: theme.palette.success.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.success.main) }
    }
  };

  return backgroundColors?.[severity]?.[variant];
};

export const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return date.toLocaleString();
};

export const readLastOpenedAt = () => {
  try {
    const rawValue = localStorage.getItem(NOTIFICATIONS_LAST_OPENED_AT_KEY);
    if (!rawValue) return new Date(0);

    const timestamp = Number(JSON.parse(rawValue));
    if (Number.isNaN(timestamp)) return new Date(0);

    return new Date(timestamp);
  } catch {
    return new Date(0);
  }
};

export const writeLastOpenedAt = (date: Date) => {
  try {
    localStorage.setItem(NOTIFICATIONS_LAST_OPENED_AT_KEY, JSON.stringify(date.valueOf()));
  } catch {}
};

export const sortByPublishedDateDesc = (items: JSONFeedItem[]) =>
  [...items].sort((a, b) => new Date(b?.date_published || 0).valueOf() - new Date(a?.date_published || 0).valueOf());

export const markItemsAsNewerThan = (items: JSONFeedItem[], cutoffDate: Date): JSONFeedItem[] =>
  items.map(item => ({
    ...item,
    _isNew: new Date(item?.date_published || 0).valueOf() > cutoffDate.valueOf()
  }));

export const normalizeTags = (tags: JSONFeedItem['tags']) => (Array.isArray(tags) ? tags.filter(Boolean) : []);

export const arrayEquals = (a: number[], b: number[]) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);

export const arrayHigher = (a: number[], b: number[]) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] > b[index]) return true;
    if (a[index] < b[index]) return false;
  }

  return false;
};

export const getVersionValues = (value: string): number[] => {
  const version = value
    ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
    ?.at(0)
    ?.replaceAll(/[^0-9.]/g, '')
    ?.split('.')
    ?.map(part => parseInt(part, 10));

  return Array.isArray(version) ? version : [];
};

export const getVersionType = (notification: JSONFeedItem, config: Configuration): NotificationVersionType => {
  const notificationVersion = notification?.url;
  const systemVersion = config?.system?.version;

  if (
    !notificationVersion ||
    !systemVersion ||
    !(
      (/(d|D)ev/g.test(notificationVersion) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(d|D)ev(\d){1,}/g.test(systemVersion)) ||
      (/(s|S)table/g.test(notificationVersion) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(\d){1,}/g.test(systemVersion))
    )
  ) {
    return null;
  }

  const notificationValues = getVersionValues(notificationVersion);
  const systemValues = getVersionValues(systemVersion);

  if (!notificationValues.length || !systemValues.length) return null;
  if (arrayEquals(notificationValues, systemValues)) return 'current';
  if (arrayHigher(notificationValues, systemValues)) return 'newer';
  return 'older';
};

export const getNewService = (notification: JSONFeedItem, services: MinimalService[]): null | boolean => {
  if (!/(s|S)ervice/g.test(notification?.title || '')) return null;

  const notificationTitle = notification?.title?.toLowerCase()?.slice(0, -16);
  if (!notificationTitle) return null;

  return services.some(service => notificationTitle === service?.name?.toLowerCase());
};

export const applyLegacyNotificationRules = ({
  config,
  isAdmin,
  items,
  lastOpenedAt,
  services
}: {
  config: Configuration;
  isAdmin: boolean;
  items: JSONFeedItem[];
  lastOpenedAt: Date;
  services: MinimalService[];
}) => {
  const filteredItems = items.filter(item => {
    if (new Date(item?.date_published || 0).valueOf() < Date.now() - ONE_YEAR_IN_MS) return false;

    if (!isAdmin) {
      const isKnownService = getNewService(item, services);
      if (isKnownService === false) return false;

      const versionType = getVersionType(item, config);
      if (versionType === 'newer') return false;
    }

    return true;
  });

  const enrichedItems = filteredItems.map(item => {
    const versionType = getVersionType(item, config);
    const isKnownService = getNewService(item, services);
    const baseItem = {
      ...item,
      _isNew: new Date(item?.date_published || 0).valueOf() > lastOpenedAt.valueOf()
    };

    if (!isAdmin) return baseItem;

    const adminTags = [
      isKnownService === false ? 'new' : null,
      versionType === 'newer' ? 'new' : null,
      versionType === 'current' ? 'current' : null
    ].filter(Boolean) as JSONFeedItem['tags'];

    return {
      ...baseItem,
      tags: [...adminTags, ...normalizeTags(item.tags)]
    };
  });

  return sortByPublishedDateDesc(enrichedItems);
};

export const decodeHTML = (html: string) => {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const parseJSONFeedItemAttachment = (attachments: any[]): JSONFeedItemAttachment[] =>
  !attachments ? [] : attachments.map(attachment => ({ ...DEFAULT_JSON_FEED_ITEM_ATTACHMENT, ...attachment }));

export const parseJSONFeedAuthor = (authors: any[]): JSONFeedAuthor[] =>
  !authors ? [] : authors.map(author => ({ ...DEFAULT_JSON_FEED_AUTHOR, ...author }));

export const parseJSONFeedItem = (items: any[]) =>
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
      }));

export const parseJSONFeed = (feed: any): JSONFeed =>
  !feed
    ? null
    : {
        ...DEFAULT_JSON_FEED,
        ...feed,
        items: parseJSONFeedItem(feed?.items),
        authors: parseJSONFeedAuthor(feed?.authors)
      };

export const fetchJSON = (url: string): Promise<any> =>
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
    const jsonFeed = JSON.parse(textResponse) as unknown;
    resolve(parseJSONFeed(jsonFeed));
    return;
  });

export const fetchJSONFeeds = (urls: string[] = []): Promise<JSONFeed[]> =>
  new Promise(async (resolve, reject) => {
    if (!urls) {
      reject('no urls');
      return;
    }
    const feeds: JSONFeed[] = (await Promise.all(urls.map(url => fetchJSON(url))).catch(err =>
      reject(err)
    )) as JSONFeed[];
    resolve(feeds);
  });

type FetchJSONProps = {
  urls: string[];
  onSuccess?: (feeds: JSONFeedItem[]) => void;
  onError?: (err: any) => void;
};

export const fetchJSONNotifications = ({ urls, onSuccess = null, onError = null }: FetchJSONProps): void => {
  fetchJSONFeeds(urls)
    .then(feeds => onSuccess && onSuccess(feeds.flatMap(f => f.items)))
    .catch(err => onError && onError(err));
};
