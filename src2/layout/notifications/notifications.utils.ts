import type { Theme } from '@mui/material';
import { blue } from '@mui/material/colors';
import type { Configuration } from 'models/base/config';
import type { CSSProperties } from 'react';
import type { PossibleColor } from 'shared/utils/colors';
import type { JSONFeed, JSONFeedAuthor, JSONFeedItem, JSONFeedItemAttachment } from './notifications.models';
import {
  DEFAULT_JSON_FEED,
  DEFAULT_JSON_FEED_AUTHOR,
  DEFAULT_JSON_FEED_ITEM,
  DEFAULT_JSON_FEED_ITEM_ATTACHMENT
} from './notifications.models';

const NOTIFICATIONS_LAST_OPENED_AT_KEY = 'notifications.lastOpenedAt';
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

export type MinimalService = {
  name?: string;
};

export type NotificationVersionType = null | 'newer' | 'current' | 'older';

//*****************************************************************************************
// Color Utilities
//*****************************************************************************************

/**
 * @name getColor
 * @description Returns a CSS color property for the given severity and variant.
 * @param severity - Notification severity level
 * @param variant - Color variant (1=main, 2=contrast text, 3=inverse)
 * @param theme - MUI theme instance
 * @returns CSSProperties with the color value
 */
export const getColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme): CSSProperties => {
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

/**
 * @name getBackgroundColor
 * @description Returns a CSS background-color property for the given severity and variant.
 * @param severity - Notification severity level
 * @param variant - Color variant (1=main, 2=contrast text, 3=inverse)
 * @param theme - MUI theme instance
 * @returns CSSProperties with the backgroundColor value
 */
export const getBackgroundColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme): CSSProperties => {
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

//*****************************************************************************************
// Date & Storage
//*****************************************************************************************

/**
 * @name formatDate
 * @description Formats an ISO date string to a locale-specific string.
 * @param value - ISO 8601 date string
 * @returns Formatted date string, or empty string if invalid
 */
export const formatDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return date.toLocaleString();
};

/**
 * @name readLastOpenedAt
 * @description Reads the last-opened timestamp from localStorage.
 * @returns Date representing when notifications were last opened
 */
export const readLastOpenedAt = (): Date => {
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

/**
 * @name writeLastOpenedAt
 * @description Persists the last-opened timestamp to localStorage.
 * @param date - Date to store
 */
export const writeLastOpenedAt = (date: Date): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_LAST_OPENED_AT_KEY, JSON.stringify(date.valueOf()));
  } catch {}
};

//*****************************************************************************************
// Item Transformations
//*****************************************************************************************

/**
 * @name sortByPublishedDateDesc
 * @description Sorts feed items by publication date in descending order.
 * @param items - Array of JSON Feed items
 * @returns New sorted array
 */
export const sortByPublishedDateDesc = (items: JSONFeedItem[]): JSONFeedItem[] =>
  [...items].sort((a, b) => new Date(b?.date_published || 0).valueOf() - new Date(a?.date_published || 0).valueOf());

/**
 * @name markItemsAsNewerThan
 * @description Marks items as new if published after the given cutoff date.
 * @param items - Array of JSON Feed items
 * @param cutoffDate - Date threshold for newness
 * @returns New array with updated _isNew flags
 */
export const markItemsAsNewerThan = (items: JSONFeedItem[], cutoffDate: Date): JSONFeedItem[] =>
  items.map(item => ({
    ...item,
    _isNew: new Date(item?.date_published || 0).valueOf() > cutoffDate.valueOf()
  }));

/**
 * @name normalizeTags
 * @description Filters out falsy values from a tags array.
 * @param tags - Raw tags array from a feed item
 * @returns Cleaned array of valid tags
 */
export const normalizeTags = (tags: JSONFeedItem['tags']): JSONFeedItem['tags'] =>
  Array.isArray(tags) ? tags.filter(Boolean) : [];

//*****************************************************************************************
// Version Comparison
//*****************************************************************************************

/**
 * @name arrayEquals
 * @description Checks if two number arrays are equal element-by-element.
 * @param a - First array
 * @param b - Second array
 * @returns Whether the arrays are equal
 */
export const arrayEquals = (a: number[], b: number[]): boolean =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * @name arrayHigher
 * @description Checks if array `a` represents a higher version than array `b`.
 * @param a - First version array
 * @param b - Second version array
 * @returns Whether `a` is higher than `b`
 */
export const arrayHigher = (a: number[], b: number[]): boolean => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] > b[index]) return true;
    if (a[index] < b[index]) return false;
  }

  return false;
};

/**
 * @name getVersionValues
 * @description Extracts numeric version segments from a version string.
 * @param value - String containing a version number (e.g., "4.5.1.stable1")
 * @returns Array of numeric version segments
 */
export const getVersionValues = (value: string): number[] => {
  const version = value
    ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
    ?.at(0)
    ?.replaceAll(/[^0-9.]/g, '')
    ?.split('.')
    ?.map(part => parseInt(part, 10));

  return Array.isArray(version) ? version : [];
};

/**
 * @name getVersionType
 * @description Determines if a notification's version is newer, current, or older than the system.
 * @param notification - JSON Feed item with version info in its URL
 * @param config - System configuration containing the current version
 * @returns Version comparison result
 */
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

/**
 * @name getNewService
 * @description Checks if a notification refers to a service not yet installed.
 * @param notification - JSON Feed item
 * @param services - List of installed services
 * @returns null if not a service notification, true if service exists, false if new
 */
export const getNewService = (notification: JSONFeedItem, services: MinimalService[]): null | boolean => {
  if (!/(s|S)ervice/g.test(notification?.title || '')) return null;

  const notificationTitle = notification?.title?.toLowerCase()?.slice(0, -16);
  if (!notificationTitle) return null;

  return services.some(service => notificationTitle === service?.name?.toLowerCase());
};

//*****************************************************************************************
// Filtering & Enrichment
//*****************************************************************************************

/**
 * @name applyLegacyNotificationRules
 * @description Filters and enriches feed items with version/service tags and newness status.
 * @param params - Configuration, items, services, and admin status
 * @returns Filtered, enriched, and sorted items
 */
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

//*****************************************************************************************
// JSON Feed Parsing
//*****************************************************************************************

/**
 * @name decodeHTML
 * @description Decodes HTML entities in a string.
 * @param html - HTML-encoded string
 * @returns Decoded plain text
 */
export const decodeHTML = (html: string): string => {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

/**
 * @name parseJSONFeedItemAttachment
 * @description Parses raw attachment data into typed JSONFeedItemAttachment objects.
 * @param attachments - Raw attachment array from JSON
 * @returns Parsed attachments
 */
export const parseJSONFeedItemAttachment = (attachments: unknown[]): JSONFeedItemAttachment[] =>
  !attachments
    ? []
    : attachments.map(attachment => ({
        ...DEFAULT_JSON_FEED_ITEM_ATTACHMENT,
        ...(attachment as Record<string, unknown>)
      }));

/**
 * @name parseJSONFeedAuthor
 * @description Parses raw author data into typed JSONFeedAuthor objects.
 * @param authors - Raw author array from JSON
 * @returns Parsed authors
 */
export const parseJSONFeedAuthor = (authors: unknown[]): JSONFeedAuthor[] =>
  !authors ? [] : authors.map(author => ({ ...DEFAULT_JSON_FEED_AUTHOR, ...(author as Record<string, unknown>) }));

/**
 * @name parseJSONFeedItem
 * @description Parses raw item data into typed JSONFeedItem objects.
 * @param items - Raw item array from JSON
 * @returns Parsed feed items
 */
export const parseJSONFeedItem = (items: unknown[]): JSONFeedItem[] =>
  !items
    ? []
    : items.map(rawItem => {
        const item = rawItem as Record<string, unknown>;
        return {
          ...DEFAULT_JSON_FEED_ITEM,
          ...item,
          date_published: new Date(item.date_published as string),
          date_modified: new Date(item.date_modified as string),
          authors: parseJSONFeedAuthor(item?.authors as unknown[]),
          attachments: parseJSONFeedItemAttachment(item?.attachment as unknown[]),
          content_html: decodeHTML(item?.content_html as string)
        };
      });

/**
 * @name parseJSONFeed
 * @description Parses raw JSON feed data into a typed JSONFeed object.
 * @param feed - Raw feed object from JSON
 * @returns Parsed feed
 */
export const parseJSONFeed = (feed: unknown): JSONFeed =>
  !feed
    ? null
    : {
        ...DEFAULT_JSON_FEED,
        ...(feed as Record<string, unknown>),
        items: parseJSONFeedItem((feed as Record<string, unknown>)?.items as unknown[]),
        authors: parseJSONFeedAuthor((feed as Record<string, unknown>)?.authors as unknown[])
      };

//*****************************************************************************************
// Network
//*****************************************************************************************

/**
 * @name fetchJSON
 * @description Fetches and parses a single JSON Feed from a URL.
 * @param url - URL of the JSON Feed
 * @returns Parsed JSON Feed
 */
export const fetchJSON = (url: string): Promise<JSONFeed> =>
  new Promise(async resolve => {
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

/**
 * @name fetchJSONFeeds
 * @description Fetches and parses multiple JSON Feeds in parallel.
 * @param urls - Array of feed URLs
 * @returns Array of parsed JSON Feeds
 */
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
  onError?: (err: unknown) => void;
};

/**
 * @name fetchJSONNotifications
 * @description Fetches multiple feeds and returns all items flattened.
 * @param params - URLs and callbacks
 */
export const fetchJSONNotifications = ({ urls, onSuccess = null, onError = null }: FetchJSONProps): void => {
  fetchJSONFeeds(urls)
    .then(feeds => onSuccess && onSuccess(feeds.flatMap(f => f.items)))
    .catch(err => onError && onError(err));
};
