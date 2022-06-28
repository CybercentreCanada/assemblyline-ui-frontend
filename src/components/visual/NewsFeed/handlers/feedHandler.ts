import { Feed, FeedChannel, FeedItem, FeedMetadata } from '../';

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

export const formatByte = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


// const handleFetch = useCallback(() => {
//   fetch(feedURL)
//     .then((response: Response) => {
//       if (response.status === 404) throw new Error(t('error.not-found'));
//       else if (response.status === 502) throw new Error(t('error.unreachable'));
//       else if (response.status === 400) throw new Error(t('error.invalid'));
//       else return Promise.all([response, response.clone().blob()]);
//     })
//     .then(([response, blob]: [Response, Blob]) => {
//       if (!['text/xml', 'application/rss', 'application/xml', 'application/atom'].includes(blob.type))
//         throw new Error(t('error.format'));
//       else if (blob.size > 20000) throw new Error(t('error.size'));
//       else return Promise.all([response, blob, blob.text()]);
//     })
//     .then(([response, blob, str]: [Response, Blob, string]) => {
//       const data = new window.DOMParser().parseFromString(str, 'text/xml');
//       return [response, blob, data];
//     })
//     .then(([response, blob, data]: [Response, Blob, Document]) => {
//       const newFeed: Feed = parseFeed(data, response.url);
//       setFeed({ ...newFeed, metadata: { url: response.url, size: blob.size } });
//       setSearching(false);
//       setError({ value: false, message: `` });
//     })
//     .catch(err => {
//       console.log(err);
//       setFeed({ ...DEFAULT_FEED });
//       setSearching(false);
//       setError({ value: true, message: `${err}` });
//     });
// }, [feedURL, t]);
