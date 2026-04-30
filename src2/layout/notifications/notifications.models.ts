import { SystemMessage } from 'models/ui/user';

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

export const DEFAULT_JSON_FEED_ITEM_ATTACHMENT: JSONFeedItemAttachment = {
  url: null,
  mime_type: null,
  title: null,
  size_in_bytes: 0,
  duration_in_seconds: 0
};

export type JSONFeedAuthor = {
  name?: string;
  url?: string;
  avatar?: string;
};

export const DEFAULT_JSON_FEED_AUTHOR: JSONFeedAuthor = {
  name: null,
  url: null,
  avatar: null
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
  date_published?: string;
  date_modified?: string;
  authors?: JSONFeedAuthor[];
  tags?: ('new' | 'current' | 'dev' | 'service' | 'blog' | 'community')[];
  language?: string;
  attachments?: JSONFeedItemAttachment[];
  _isNew: boolean;
};

export const DEFAULT_JSON_FEED_ITEM: JSONFeedItem = {
  id: null,
  url: null,
  external_url: null,
  title: null,
  content_html: null,
  content_text: null,
  summary: null,
  image: null,
  banner_image: null,
  date_published: null,
  date_modified: null,
  authors: [],
  tags: [],
  language: null,
  attachments: [],
  _isNew: false
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
  authors?: JSONFeedAuthor[];
  language?: string;
  expired?: boolean;
  hubs?: { type: string; url: string }[];
  items: JSONFeedItem[];
};

export const DEFAULT_JSON_FEED: JSONFeed = {
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
};

export const DEFAULT_SYSTEM_MESSAGE: SystemMessage = {
  message: '',
  severity: 'info',
  title: '',
  user: null
};
