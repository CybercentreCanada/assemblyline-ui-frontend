import {
  DEFAULT_ITEM,
  Feed,
  FeedChannel,
  FeedItem,
  FeedMetadata,
  RSSChannelConversion,
  RSSItemConversion,
  RSSItems
} from '..';

const cleanTag = (text: string): string =>
  text.replace('<![CDATA[', '').replace(']]>', '').replace('<p>', '').replace('</p>', '');

export const formatByte = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getValueFromPath = (obj: object, path: Array<string>): string | number | object => {
  // const paths = path.split('.');
  let current = obj;
  let i;

  for (i = 0; i < path.length; ++i) {
    if (current[path[i]] === undefined) {
      return undefined;
    }
    current = current[path[i]];
  }
  return current;
};

const setValueFromPath = (
  obj: object,
  path: Array<string>,
  value: any,
  type: 'string' | 'number' | 'date' = 'string'
) => {
  if (path === null || path === undefined) return null;
  else if (path.length === 0) {
    if (type === 'date') return new Date(value);
    else return value;
  } else
    return Object.keys(obj).includes(path[0])
      ? { ...obj, [path[0]]: setValueFromPath(obj[path[0]], [...path.slice(1)], value, type) }
      : { ...obj };
};

export const parseFeed2 = (origin: Feed, source: Object): Feed => {
  if (origin.metadata.type === 'rss') {
    RSSChannelConversion.map(channel => {
      const value = getValueFromPath(source, channel.source);
      origin = setValueFromPath(origin, channel.origin, value, channel.type);
      return '';
    });

    const sourceItems: Array<any> = getValueFromPath(source, RSSItems.source) as Array<any>;
    const newItems = sourceItems.map(sourceItem => {
      let newItem = { ...DEFAULT_ITEM };
      RSSItemConversion.map(item => {
        let value = getValueFromPath(sourceItem, item.source);
        if (typeof value === 'string')
          newItem = setValueFromPath(newItem, item.origin, cleanTag(value as string), item.type);
        return '';
      });
      return newItem;
    });
    return { ...origin, channel: { ...origin.channel }, items: [...newItems] };
  }
};

// Old Stuff

const clean = (text: string): string =>
  text.replace('<![CDATA[', '').replace(']]>', '').replace('<p>', '').replace('</p>', '');

const getText = (data: Document | Element, query: string) => {
  const node = data.querySelectorAll(query);
  return node === null || node.length === 0 ? null : clean(node[0]?.innerHTML);
};

const getAttribute = (data: Document | Element, query: string) => {
  const node = data.querySelectorAll(query);
  return node === null || node.length === 0 ? null : clean(node[0]?.getAttribute('url'));
};

export const getFeedType = (document: Document) => {};

export const parseFeedMetadata = (data: Document, url: string = ''): FeedMetadata => ({
  url: url,
  itemsCount: data.querySelectorAll('channel > item').length
});

export const parseFeedChannel = (data: Document): FeedChannel => ({
  title: getText(data, 'channel > title'),
  description: getText(data, 'channel > description'),
  link: getText(data, 'channel > link'),
  language: getText(data, 'channel > language'),
  lastBuildDate: new Date(getText(data, 'channel > lastBuildDate')),
  copyright: getText(data, 'channel > copyright'),
  docs: getText(data, 'channel > docs'),
  // version: data.querySelectorAll('rss')[0].getAttribute('version'),
  image: {
    title: getText(data, 'channel > image > title '),
    url: getText(data, 'channel > image > url '),
    link: getText(data, 'channel > image > link ')
  }
});

export const parseFeedItem = (data: Document | Element): FeedItem => ({
  guid: getText(data, 'guid'),
  pubDate: new Date(getText(data, 'pubDate')),
  title: getText(data, 'title'),
  description: getText(data, 'description'),
  link: getText(data, 'link'),
  isNew: false,
  enclosure: {
    url: getAttribute(data, 'enclosure')
  }
});

export const parseFeed = (data: Document, url: string = ''): Feed => {
  let items: Array<FeedItem> = [];
  data.querySelectorAll('channel > item').forEach(e => items.push(parseFeedItem(e)));
  items = items.slice().sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
  const channel: FeedChannel = parseFeedChannel(data);
  const metadata: FeedMetadata = parseFeedMetadata(data, url);
  return { metadata, channel, items };
};

export const isValidFeedURL = (url: string): boolean => {
  return false;
};

export const fetchFeed = (url: string) => fetch(url).then(response => console.log(response));
