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

export const DEFAULT_ITEM: FeedItem = {
  guid: null,
  pubDate: null,
  title: null,
  description: null,
  link: null,
  enclosure: null,
  isNew: false
};

export const DEFAULT_CHANNEL_IMAGE: FeedImage = {
  title: null,
  url: null,
  link: null
};

export const DEFAULT_CHANNEL: FeedChannel = {
  title: null,
  description: null,
  link: null,
  language: null,
  lastBuildDate: null,
  copyright: null,
  docs: null,
  image: DEFAULT_CHANNEL_IMAGE
};

export const DEFAULT_METADATA: FeedMetadata = {
  type: null,
  version: null,
  status: null,
  message: null,
  url: null,
  size: null,
  itemsCount: null
};

export const DEFAULT_NOTIFICATION: Feed = {
  metadata: { ...DEFAULT_METADATA },
  channel: { ...DEFAULT_CHANNEL },
  items: []
};

type ConversionTable = Array<{ type: 'string' | 'date'; origin: Array<string>; source: Array<string> }>;

export const RSSChannelConversion: ConversionTable = [
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
];

export const RSSItems = { origin: ['items'], source: ['rss', 'channel', 'item'] };

export const RSSItemConversion: ConversionTable = [
  { type: 'string', origin: ['guid'], source: ['guid'] },
  { type: 'date', origin: ['pubDate'], source: ['pubDate'] },
  { type: 'string', origin: ['title'], source: ['title'] },
  { type: 'string', origin: ['description'], source: ['description'] },
  { type: 'string', origin: ['link'], source: ['link'] },
  { type: 'string', origin: ['enclosure'], source: ['enclosure'] }
];
