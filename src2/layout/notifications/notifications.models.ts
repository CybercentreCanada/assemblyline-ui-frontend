import type { SystemMessage } from 'models/ui/user';

/**
 * JSON Feed Version 1.1
 * https://www.jsonfeed.org/
 */

//*****************************************************************************************
// JSON Feed Item Attachment
//*****************************************************************************************

/** Represents a media attachment on a JSON Feed item. */
export type JSONFeedItemAttachment = {
  /** Duration of media in seconds. */
  duration_in_seconds?: number;
  /** MIME type of the attachment. */
  mime_type: string;
  /** Size of the file in bytes. */
  size_in_bytes?: number;
  /** Display title of the attachment. */
  title?: string;
  /** URL to the attachment resource. */
  url: string;
};

export const DEFAULT_JSON_FEED_ITEM_ATTACHMENT: JSONFeedItemAttachment = {
  duration_in_seconds: 0,
  mime_type: '',
  size_in_bytes: 0,
  title: '',
  url: ''
};

//*****************************************************************************************
// JSON Feed Author
//*****************************************************************************************

/** Represents an author of a JSON Feed or item. */
export type JSONFeedAuthor = {
  /** URL to the author's avatar image. */
  avatar?: string;
  /** Display name of the author. */
  name?: string;
  /** URL to the author's profile or website. */
  url?: string;
};

export const DEFAULT_JSON_FEED_AUTHOR: JSONFeedAuthor = {
  avatar: '',
  name: '',
  url: ''
};

//*****************************************************************************************
// JSON Feed Item
//*****************************************************************************************

/** Tag values assignable to a notification feed item. */
export const NOTIFICATION_TAGS = ['new', 'current', 'dev', 'service', 'blog', 'community'] as const;
export type NotificationTag = (typeof NOTIFICATION_TAGS)[number];

/** Represents a single item in a JSON Feed. */
export type JSONFeedItem = {
  /** Whether this item is newer than the last time the user opened notifications. */
  _isNew: boolean;
  /** List of media attachments. */
  attachments?: JSONFeedItemAttachment[];
  /** List of authors. */
  authors?: JSONFeedAuthor[];
  /** Banner image URL. */
  banner_image?: string;
  /** HTML content of the item. */
  content_html?: string;
  /** Markdown content of the item. */
  content_md?: string;
  /** Plain text content of the item. */
  content_text?: string;
  /** Last modification date (ISO 8601). */
  date_modified?: string;
  /** Publication date (ISO 8601). */
  date_published?: string;
  /** External URL related to this item. */
  external_url?: string;
  /** Unique identifier of the item. */
  id: string;
  /** Image URL associated with the item. */
  image?: string;
  /** Language code of the item. */
  language?: string;
  /** Short summary of the item. */
  summary?: string;
  /** Tags categorizing the item. */
  tags?: NotificationTag[];
  /** Title of the item. */
  title?: string;
  /** Primary URL of the item. */
  url?: string;
};

export const DEFAULT_JSON_FEED_ITEM: JSONFeedItem = {
  _isNew: false,
  attachments: [],
  authors: [],
  banner_image: '',
  content_html: '',
  content_md: '',
  content_text: '',
  date_modified: '',
  date_published: '',
  external_url: '',
  id: '',
  image: '',
  language: '',
  summary: '',
  tags: [],
  title: '',
  url: ''
};

//*****************************************************************************************
// JSON Feed
//*****************************************************************************************

/** Represents a complete JSON Feed document. */
export type JSONFeed = {
  /** List of feed-level authors. */
  authors?: JSONFeedAuthor[];
  /** Description of the feed. */
  description?: string;
  /** Whether the feed has expired. */
  expired?: boolean;
  /** Favicon URL. */
  favicon?: string;
  /** URL of the feed itself. */
  feed_url?: string;
  /** URL to the feed's home page. */
  home_page_url?: string;
  /** Hub subscriptions. */
  hubs?: { type: string; url: string }[];
  /** Icon URL. */
  icon?: string;
  /** List of feed items. */
  items: JSONFeedItem[];
  /** Language of the feed. */
  language?: string;
  /** URL to the next page of items. */
  next_url?: string;
  /** Title of the feed. */
  title: string;
  /** User-facing comment about the feed. */
  user_comment?: string;
  /** JSON Feed version string. */
  version: string;
};

export const DEFAULT_JSON_FEED: JSONFeed = {
  authors: [],
  description: '',
  expired: false,
  favicon: '',
  feed_url: '',
  home_page_url: '',
  hubs: [],
  icon: '',
  items: [],
  language: '',
  next_url: '',
  title: '',
  user_comment: '',
  version: ''
};

//*****************************************************************************************
// System Message
//*****************************************************************************************

export const DEFAULT_SYSTEM_MESSAGE: SystemMessage = {
  message: '',
  severity: 'info',
  title: '',
  user: ''
};
