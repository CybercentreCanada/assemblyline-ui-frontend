import { Drawer, IconButton, makeStyles, useTheme } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FEED, Feed, FeedItemView, parseFeed } from '..';

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  result_section: {
    minWidth: '50%',
    flexGrow: 1
  },
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  section_content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid'
  },
  section: {
    pageBreakInside: 'avoid'
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

export type NewsFeedProviderProps = {
  children?: React.ReactNode;
};

export type ErrorResponseProps = {
  status: number;
  message: string;
  response?: any;
};

export function FeedError({ status, message, response }: ErrorResponseProps) {
  this.status = status;
  this.message = message;
  this.response = response;
}

type OnFetch = (props: {
  url: string;
  onSuccess?: (feed: Feed) => void;
  onFailure?: (response: ErrorResponseProps) => void;
  onEnter?: () => void;
  onExit?: () => void;
  // onFinalize?: (api_data: ErrorResponseProps) => void;
}) => void;

export type NewsFeedContextProps = {
  feeds: Array<Feed>;
  onFetchFeed: (url: string) => Promise<Feed>;
  onFetchFeeds: (urls: string[]) => Promise<Feed[]>;
  onAddFeed: (feed: Feed) => void;
  onUpdateFeed: (feed: Feed, index: number) => void;
  onRemoveFeed: (index: number) => void;

  onOpenDrawer: () => void;
};

export const NewsFeedContext = React.createContext<NewsFeedContextProps>(null);
export const useNewsFeed = () => React.useContext(NewsFeedContext);

export const NewsFeedProvider = ({ children }: NewsFeedProviderProps) => {
  const { t, i18n } = useTranslation(['adminFeeds']);
  const theme = useTheme();
  const classes = useStyles();

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const localStorageKey = useRef('news-feed');

  const onFetchFeed: (url: string) => Promise<Feed> = useCallback(
    (url: string) =>
      new Promise(async (resolve, reject) => {
        let f: Feed = { ...DEFAULT_FEED };

        const response: Response = (await fetch(url, { method: 'GET' }).catch(err => reject(err))) as Response;

        if (response === undefined || response === null) {
          resolve({ ...f, metadata: { ...f.metadata, status: 403, url } });
          return;
        } else if ([404, 502, 400].includes(response.status)) {
          resolve({ ...f, metadata: { ...f.metadata, status: response.status, url: response.url } });
          return;
        }

        const blob: Blob = await response.clone().blob();
        if (!['text/xml', 'application/rss', 'application/xml', 'application/atom'].includes(blob.type)) {
          resolve({ ...f, metadata: { ...f.metadata, status: 415, url: response.url, size: blob.size } });
          return;
        }
        if (blob.size > 100000) {
          resolve({ ...f, metadata: { ...f.metadata, status: 413, url: response.url, size: blob.size } });
          return;
        }

        const str: string = await response.clone().text();
        const data = new window.DOMParser().parseFromString(str, 'text/xml');

        resolve({
          ...f,
          ...parseFeed(data, response.url),
          metadata: { ...f.metadata, status: 200, url: response.url, size: blob.size }
        });
      }),
    []
  );

  const onFetchFeeds: (urls: string[]) => Promise<Feed[]> = useCallback(
    (urls: string[]) =>
      new Promise(async (resolve, reject) => {
        const _feeds: Feed[] = (await Promise.all(urls.map(url => onFetchFeed(url))).catch(err =>
          reject(err)
        )) as Feed[];
        resolve(_feeds);
      }),
    [onFetchFeed]
  );

  const onLoad = useCallback(() => {
    const value = localStorage.getItem(localStorageKey.current);
    const json = JSON.parse(value) as any;
    if (value === null || value === '' || !Array.isArray(json) || !json.every(e => typeof e == 'string')) return;
    onFetchFeeds(json).then((f: Feed[]) => setFeeds(f));
  }, [onFetchFeeds]);

  const onSave = useCallback(() => {
    if (feeds === null || feeds.length === 0) return;
    localStorage.setItem(localStorageKey.current, JSON.stringify(feeds.map(e => e.metadata.url)));
  }, [feeds]);

  const onAddFeed = useCallback((feed: Feed) => {
    if (feed.metadata.status !== 200) return;
    setFeeds(f => [...f, feed]);
  }, []);

  const onUpdateFeed = useCallback((feed: Feed, index: number) => {
    setFeeds(f => (index < 0 || index >= f.length ? [...f] : f.filter((e, i) => (i === index ? feed : e))));
  }, []);

  const onRemoveFeed = useCallback((index: number) => {
    setFeeds(f => (index < 0 || index >= f.length ? [...f] : f.filter((_, i) => i !== index)));
  }, []);

  useEffect(() => onLoad(), [onLoad]);
  useEffect(() => onSave(), [feeds, onSave]);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const onOpenDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  return (
    <NewsFeedContext.Provider
      value={{ feeds, onFetchFeed, onFetchFeeds, onAddFeed, onUpdateFeed, onRemoveFeed, onOpenDrawer }}
    >
      {React.useMemo(() => children, [children])}
      {React.useMemo(
        () => (
          <Drawer
            anchor="right"
            classes={{ paper: classes.drawerPaper }}
            open={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              // setTimeout(() => setIsDrawerOpen(true), 2000);
            }}
          >
            <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
              <IconButton
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </div>
            <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
              <div className={classes.section_content}>
                {feeds
                  .map(f => f.items)
                  .flat()
                  .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
                  .map((feedItem, i) => (
                    <FeedItemView key={'item-' + i} item={feedItem} />
                  ))}
              </div>
            </div>
          </Drawer>
        ),
        [classes.drawerPaper, classes.section_content, feeds, isDrawerOpen, theme]
      )}
    </NewsFeedContext.Provider>
  );
};
