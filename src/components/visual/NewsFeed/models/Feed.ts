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
};

export type FeedChannel = {
  type?: string;
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
  size?: number;
  itemsCount?: number;
};

export type Feed = {
  metadata?: FeedMetadata;
  channel?: FeedChannel;
  items: FeedItem[];
};

export const DEFAULT_ITEM: FeedItem = {
  guid: null,
  pubDate: null,
  title: null,
  description: null,
  link: null,
  enclosure: null
};

export const DEFAULT_CHANNEL: FeedChannel = {
  type: null,
  title: null,
  description: null,
  link: null,
  language: null,
  lastBuildDate: null,
  copyright: null,
  docs: null,
  image: null
};

export const DEFAULT_METADATA: FeedMetadata = {
  status: null,
  message: null,
  url: null,
  size: null,
  itemsCount: null
};

export const DEFAULT_FEED: Feed = {
  metadata: { ...DEFAULT_METADATA },
  channel: { ...DEFAULT_CHANNEL },
  items: []
};
