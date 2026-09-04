import type { SystemMessage } from 'models/api/user';
import type { infer as zInfer } from 'zod';
import {
  array as zArray,
  boolean as zBoolean,
  enum as zEnum,
  number as zNumber,
  object as zObject,
  preprocess as zPreprocess,
  string as zString
} from 'zod';

/**
 * JSON Feed Version 1.1
 * https://www.jsonfeed.org/
 */

//*****************************************************************************************
// Date & HTML Utilities
//*****************************************************************************************

/** Decodes HTML entities in a string. */
export const decodeHTML = (html?: string | null): string => {
  if (!html) return '';
  try {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  } catch {
    return html;
  }
};

/** Formats a date string to an ISO 8601 string if valid. */
export const formatISODate = (val?: string | null): string => {
  if (!val) return '';
  const date = new Date(val);
  return date && !Number.isNaN(date.valueOf()) ? date.toISOString() : val;
};

//*****************************************************************************************
// JSON Feed Item Attachment
//*****************************************************************************************

/** Zod schema for JSON Feed item attachment. */
export const JSON_FEED_ITEM_ATTACHMENT_SCHEMA = zObject({
  /** Duration of media in seconds. */
  duration_in_seconds: zNumber().default(0).catch(0),
  /** MIME type of the attachment. */
  mime_type: zString().default('').catch(''),
  /** Size of the file in bytes. */
  size_in_bytes: zNumber().default(0).catch(0),
  /** Display title of the attachment. */
  title: zString().default('').catch(''),
  /** URL to the attachment resource. */
  url: zString().default('').catch('')
});

export type JSONFeedItemAttachment = zInfer<typeof JSON_FEED_ITEM_ATTACHMENT_SCHEMA>;

export const DEFAULT_JSON_FEED_ITEM_ATTACHMENT: JSONFeedItemAttachment = JSON_FEED_ITEM_ATTACHMENT_SCHEMA.parse({});

//*****************************************************************************************
// JSON Feed Author
//*****************************************************************************************

/** Zod schema for JSON Feed author. */
export const JSON_FEED_AUTHOR_SCHEMA = zObject({
  /** URL to the author's avatar image. */
  avatar: zString().default('').catch(''),
  /** Display name of the author. */
  name: zString().default('').catch(''),
  /** URL to the author's profile or website. */
  url: zString().default('').catch('')
});

export type JSONFeedAuthor = zInfer<typeof JSON_FEED_AUTHOR_SCHEMA>;

export const DEFAULT_JSON_FEED_AUTHOR: JSONFeedAuthor = JSON_FEED_AUTHOR_SCHEMA.parse({});

//*****************************************************************************************
// Notification Tag
//*****************************************************************************************

/** Tag values assignable to a notification feed item. */
export const NOTIFICATION_TAGS = ['new', 'current', 'dev', 'service', 'blog', 'community'] as const;
export const NOTIFICATION_TAG_SCHEMA = zEnum(NOTIFICATION_TAGS);
export type NotificationTag = zInfer<typeof NOTIFICATION_TAG_SCHEMA>;

//*****************************************************************************************
// JSON Feed Item
//*****************************************************************************************

/** Zod schema for JSON Feed item. */
export const JSON_FEED_ITEM_SCHEMA = zPreprocess(
  raw => {
    if (!raw || typeof raw !== 'object') return {};
    const item = raw as Record<string, unknown>;
    return {
      ...item,
      attachments: item.attachments ?? item.attachment ?? []
    };
  },
  zObject({
    /** Whether this item is newer than the last time the user opened notifications. */
    _isNew: zBoolean().default(false).catch(false),
    /** List of media attachments. */
    attachments: zArray(JSON_FEED_ITEM_ATTACHMENT_SCHEMA).default([]).catch([]),
    /** List of authors. */
    authors: zArray(JSON_FEED_AUTHOR_SCHEMA).default([]).catch([]),
    /** Banner image URL. */
    banner_image: zString().default('').catch(''),
    /** HTML content of the item. */
    content_html: zString()
      .nullish()
      .transform(val => decodeHTML(val)),
    /** Markdown content of the item. */
    content_md: zString().default('').catch(''),
    /** Plain text content of the item. */
    content_text: zString().default('').catch(''),
    /** Last modification date (ISO 8601). */
    date_modified: zString()
      .nullish()
      .transform(val => formatISODate(val)),
    /** Publication date (ISO 8601). */
    date_published: zString()
      .nullish()
      .transform(val => formatISODate(val)),
    /** External URL related to this item. */
    external_url: zString().default('').catch(''),
    /** Unique identifier of the item. */
    id: zString().default('').catch(''),
    /** Image URL associated with the item. */
    image: zString().default('').catch(''),
    /** Language code of the item. */
    language: zString().default('').catch(''),
    /** Short summary of the item. */
    summary: zString().default('').catch(''),
    /** Tags categorizing the item. */
    tags: zArray(NOTIFICATION_TAG_SCHEMA).default([]).catch([]),
    /** Title of the item. */
    title: zString().default('').catch(''),
    /** Primary URL of the item. */
    url: zString().default('').catch('')
  })
);

export type JSONFeedItem = zInfer<typeof JSON_FEED_ITEM_SCHEMA>;

export const DEFAULT_JSON_FEED_ITEM: JSONFeedItem = JSON_FEED_ITEM_SCHEMA.parse({});

//*****************************************************************************************
// JSON Feed
//*****************************************************************************************

/** Zod schema for complete JSON Feed document. */
export const JSON_FEED_SCHEMA = zObject({
  /** List of feed-level authors. */
  authors: zArray(JSON_FEED_AUTHOR_SCHEMA).default([]).catch([]),
  /** Description of the feed. */
  description: zString().default('').catch(''),
  /** Whether the feed has expired. */
  expired: zBoolean().default(false).catch(false),
  /** Favicon URL. */
  favicon: zString().default('').catch(''),
  /** URL of the feed itself. */
  feed_url: zString().default('').catch(''),
  /** URL to the feed's home page. */
  home_page_url: zString().default('').catch(''),
  /** Hub subscriptions. */
  hubs: zArray(
    zObject({
      type: zString().default('').catch(''),
      url: zString().default('').catch('')
    })
  )
    .default([])
    .catch([]),
  /** Icon URL. */
  icon: zString().default('').catch(''),
  /** List of feed items. */
  items: zArray(JSON_FEED_ITEM_SCHEMA).default([]).catch([]),
  /** Language of the feed. */
  language: zString().default('').catch(''),
  /** URL to the next page of items. */
  next_url: zString().default('').catch(''),
  /** Title of the feed. */
  title: zString().default('').catch(''),
  /** User-facing comment about the feed. */
  user_comment: zString().default('').catch(''),
  /** JSON Feed specification version. */
  version: zString().default('').catch('')
});

export type JSONFeed = zInfer<typeof JSON_FEED_SCHEMA>;

export const DEFAULT_JSON_FEED: JSONFeed = JSON_FEED_SCHEMA.parse({});

//*****************************************************************************************
// System Message
//*****************************************************************************************

/** Default system message state. */
export const DEFAULT_SYSTEM_MESSAGE: SystemMessage = {
  message: '',
  severity: 'info',
  title: '',
  user: ''
};

//*****************************************************************************************
// Version Type
//*****************************************************************************************

/** Result of comparing a notification version to the system version. */
export type NotificationVersionType = null | 'newer' | 'current' | 'older';

//*****************************************************************************************
// Minimal Service
//*****************************************************************************************

/** Minimal service representation for notification filtering. */
export type MinimalService = {
  /** Service name. */
  name?: string;
};
