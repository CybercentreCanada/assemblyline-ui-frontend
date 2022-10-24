import { makeStyles, useTheme } from '@material-ui/core';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FEED, Feed, LayoutFeedDrawer, parseFeed, SystemMessage } from '..';

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
  feedDrawerOpen: boolean;
  onFetchFeed: (url: string) => Promise<Feed>;
  onFetchFeeds: (urls: string[]) => Promise<Feed[]>;
  onAddFeed: (feed: Feed) => void;
  onUpdateFeed: (feed: Feed, index: number) => void;
  onRemoveFeed: (index: number) => void;

  onFeedDrawerChange: (value: boolean) => void;

  saveSystemMessage: (title: string, severity: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  deleteSystemMessage: () => void;
};

export const NewsFeedContext = React.createContext<NewsFeedContextProps>(null);
export const useNewsFeed = () => React.useContext(NewsFeedContext);

export const NewsFeedProvider = ({ children }: NewsFeedProviderProps) => {
  const { t, i18n } = useTranslation(['adminFeeds']);
  const theme = useTheme();
  const classes = useStyles();

  const localStorageKey = useRef('news-feed');
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [feedDrawerOpen, setFeedDrawerOpen] = useState<boolean>(false);

  const { setSystemMessage, user: currentUser } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const saveSystemMessage = useCallback(
    (title: string, severity: 'success' | 'info' | 'warning' | 'error', message: string) => {
      const data: SystemMessage = { user: currentUser.username, title, severity, message };
      apiCall({
        url: '/api/v4/system/system_message/',
        method: 'PUT',
        body: data,
        onSuccess: () => {
          showSuccessMessage(t('save.success'));
          setSystemMessage(data);
        }
      });
    },
    [apiCall, currentUser?.username, setSystemMessage, showSuccessMessage, t]
  );

  const deleteSystemMessage = useCallback(() => {
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setSystemMessage(null);
      }
    });
  }, [apiCall, setSystemMessage, showSuccessMessage, t]);

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

        const parser = new XMLParser();
        let jObj = parser.parse(str);

        const builder = new XMLBuilder({});
        const xmlContent = builder.build(jObj);

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

  const onLoadFeeds = useCallback(() => {
    const value: null | string = localStorage.getItem(localStorageKey.current);
    if (value === null) return;
    const json = JSON.parse(value) as any;
    if (value === null || value === '' || !Array.isArray(json) || !json.every(e => typeof e == 'string')) return;
    onFetchFeeds(json).then((f: Feed[]) => setFeeds(f));
  }, [onFetchFeeds]);

  const onSaveFeeds = useCallback(() => {
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

  useEffect(() => onLoadFeeds(), [onLoadFeeds]);
  useEffect(() => onSaveFeeds(), [feeds, onSaveFeeds]);

  const onFeedDrawerChange = useCallback((value: boolean) => setFeedDrawerOpen(value), []);

  return (
    <NewsFeedContext.Provider
      value={{
        feeds,
        feedDrawerOpen,
        onFetchFeed,
        onFetchFeeds,
        onAddFeed,
        onUpdateFeed,
        onRemoveFeed,
        onFeedDrawerChange,
        saveSystemMessage,
        deleteSystemMessage
      }}
    >
      {React.useMemo(() => children, [children])}
      {React.useMemo(
        () => (
          <LayoutFeedDrawer />
        ),
        []
      )}
    </NewsFeedContext.Provider>
  );
};
