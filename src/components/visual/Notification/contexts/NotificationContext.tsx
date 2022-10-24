import { useTheme } from '@material-ui/core';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { SystemMessageDefinition } from 'components/hooks/useMyUser';
import { XMLParser } from 'fast-xml-parser';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_NOTIFICATION, Feed, FeedItem, feedURLs, formatByte, parseFeed2 } from '..';

export type ErrorResponseProps = {
  status: number;
  message: string;
  response?: any;
};

export type NotificationProviderProps = {
  children?: React.ReactNode;
};

export function FeedError({ status, message, response }: ErrorResponseProps) {
  this.status = status;
  this.message = message;
  this.response = response;
}

export type NotificationContextProps = {
  feeds: Array<Feed>;
  notifications: Array<FeedItem>;
  readNotification: boolean;
  newSystemMessage: SystemMessageDefinition;

  setFeeds: React.Dispatch<React.SetStateAction<Feed[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<FeedItem[]>>;
  setReadNotification: React.Dispatch<React.SetStateAction<boolean>>;
  setNewSystemMessage: React.Dispatch<React.SetStateAction<SystemMessageDefinition>>;

  notificationDrawer: boolean;
  systemMessageDialog: boolean;
  saveConfirmation: boolean;
  deleteConfirmation: boolean;

  setNotificationDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  setSystemMessageDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>;

  // onEditSystemMessage: (event: any) => void;
  // onDeleteSystemMessage: (event: any) => void;
  onOpenNotification: () => void;
  onCreateSystemMessage: () => void;
  onEditSystemMessage: () => void;
  onCancelSystemMessage: () => void;
  onSaveSystemMessage: () => void;
  onDeleteSystemMessage: () => void;
};

export const NotificationContext = React.createContext<NotificationContextProps>(null);
export const useNotification = () => React.useContext(NotificationContext);

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { t } = useTranslation(['notification']);
  const theme = useTheme();
  // const smClasses = useStyles();

  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { systemMessage, setSystemMessage, user: currentUser } = useALContext();

  const storageKey = useRef<string>('notification.lastTimeOpen');
  const [lastTimeOpen, setLastTimeOpen] = useState<Date>(new Date());

  const [feeds, setFeeds] = useState<Array<Feed>>(null);
  const [notifications, setNotifications] = useState<FeedItem[]>(null);
  const [readNotification, setReadNotification] = useState<boolean>(false);
  const [newNotificationCount, setNewNotificationCount] = useState<number>(0);
  const [newSystemMessage, setNewSystemMessage] = useState<SystemMessageDefinition>({
    user: '',
    title: '',
    severity: 'info',
    message: ''
  });

  React.useEffect(() => {
    const data: string = localStorage.getItem(storageKey.current);
    if (data === null) return;

    const value = JSON.parse(data);
    if (typeof value !== 'number') return;

    const date: Date = new Date(value);
    setLastTimeOpen(date);

    if (!Array.isArray(notifications)) return;
    const count = notifications.filter(n => n.pubDate > date).length;
    setNewNotificationCount(count);

    console.log(data, value, date, count);
  }, [notifications]);

  const [notificationDrawer, setNotificationDrawer] = useState<boolean>(false);
  const [systemMessageDialog, setSystemMessageDialog] = useState<boolean>(false);
  const [saveConfirmation, setSaveConfirmation] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  const onFetchFeed: (url: string) => Promise<Feed> = useCallback(
    (url: string) =>
      new Promise(async (resolve, reject) => {
        let n: Feed = { ...DEFAULT_NOTIFICATION };

        const response: Response = (await fetch(url, { method: 'GET' }).catch(err => reject(err))) as Response;

        if (response === undefined || response === null) {
          resolve({ ...n, metadata: { ...n.metadata, status: 403, url } });
          return;
        } else if ([404, 502, 400].includes(response.status)) {
          resolve({ ...n, metadata: { ...n.metadata, status: response.status, url: response.url } });
          return;
        }

        const blob: Blob = await response.clone().blob();
        n = {
          ...n,
          metadata: {
            ...n.metadata,
            status: response.status,
            url: response.url,
            type: blob.type,
            size: formatByte(blob.size)
          }
        };
        if (!['text/xml', 'application/rss', 'application/xml', 'application/atom'].includes(blob.type)) {
          resolve({ ...n, metadata: { ...n.metadata, status: 415 } });
          return;
        }
        if (blob.size > 100000) {
          resolve({ ...n, metadata: { ...n.metadata, status: 413 } });
          return;
        }

        const textResponse: string = await response.clone().text();
        const document = new window.DOMParser().parseFromString(textResponse, 'text/xml');

        const child = document.children;
        const { type, version } =
          child.length > 0
            ? { type: child[0].tagName, version: child[0].getAttribute('version') }
            : { type: null, version: null };

        n = { ...n, metadata: { ...n.metadata, type, version } };
        const xmlParser = new XMLParser();
        let json = xmlParser.parse(textResponse);
        n = parseFeed2(n, json);
        resolve({ ...n });
      }),
    []
  );

  const onFetchFeeds: (urls: string[]) => Promise<Feed[]> = useCallback(
    (urls: string[]) =>
      new Promise(async (resolve, reject) => {
        const n: Feed[] = (await Promise.all(urls.map(url => onFetchFeed(url))).catch(err => reject(err))) as Feed[];
        resolve(n);
      }),
    [onFetchFeed]
  );

  const onLoadFeeds = useCallback(() => {
    if (feedURLs === null || !Array.isArray(feedURLs) || feedURLs.length === 0) setFeeds([]);
    else onFetchFeeds(feedURLs).then((n: Array<Feed>) => setFeeds(n));
  }, [onFetchFeeds]);

  React.useEffect(() => onLoadFeeds(), [onLoadFeeds]);
  React.useEffect(() => {
    if (feeds === null || !Array.isArray(feeds)) setNotifications(null);
    else if (feeds.length === 0) setNotifications([]);
    else
      setNotifications(
        feeds
          .flatMap(f => f.items)
          .concat([
            {
              guid: null,
              pubDate: new Date(),
              title:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet eleifend rhoncus. Ut sodales, metus et semper tempor, metus purus placerat nulla, ut lacinia felis eros sodales nisl. Suspendisse id nisi vitae libero pharetra finibus. Sed ultricies volutpat ipsum, at pulvinar elit euismod a. Cras rhoncus, eros eget dapibus iaculis, arcu nisi malesuada quam, ac commodo sapien eros non magna. Pellentesque tempus accumsan eros, dictum auctor lacus molestie in. Maecenas pulvinar dapibus libero sit amet ornare. Sed a lectus nisi. Nulla tempus enim vitae pretium pretium. Integer tincidunt luctus venenatis. Duis volutpat dui nunc, at tincidunt metus vestibulum vel. Aenean varius dolor vel tortor porta maximus. Phasellus sollicitudin, tellus sed hendrerit euismod, risus velit rutrum justo, nec lacinia purus neque in turpis. Nam et tellus non erat blandit feugiat suscipit quis metus. Nullam venenatis, leo sit amet feugiat laoreet, neque ligula euismod diam, a placerat odio neque sed nulla.',
              description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet eleifend rhoncus. Ut sodales, metus et semper tempor, metus purus placerat nulla, ut lacinia felis eros sodales nisl. Suspendisse id nisi vitae libero pharetra finibus. Sed ultricies volutpat ipsum, at pulvinar elit euismod a. Cras rhoncus, eros eget dapibus iaculis, arcu nisi malesuada quam, ac commodo sapien eros non magna. Pellentesque tempus accumsan eros, dictum auctor lacus molestie in. Maecenas pulvinar dapibus libero sit amet ornare. Sed a lectus nisi. Nulla tempus enim vitae pretium pretium. Integer tincidunt luctus venenatis. Duis volutpat dui nunc, at tincidunt metus vestibulum vel. Aenean varius dolor vel tortor porta maximus. Phasellus sollicitudin, tellus sed hendrerit euismod, risus velit rutrum justo, nec lacinia purus neque in turpis. Nam et tellus non erat blandit feugiat suscipit quis metus. Nullam venenatis, leo sit amet feugiat laoreet, neque ligula euismod diam, a placerat odio neque sed nulla.

              Nunc sagittis, dolor ac sollicitudin porta, magna neque fermentum sapien, sed eleifend magna risus non leo. Praesent mattis dolor justo, nec tincidunt tortor feugiat luctus. Mauris ullamcorper sodales quam vel laoreet. Sed sapien ex, eleifend nec tellus sit amet, mattis laoreet ante. Sed quis enim viverra nibh finibus placerat et ut turpis. Ut sit amet suscipit enim. Aenean lectus dui, suscipit at lacus at, gravida lacinia nulla. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

              Duis lobortis, sapien bibendum imperdiet sollicitudin, sapien enim viverra lacus, sed tristique est mi non nisl. Nullam in sem sit amet purus interdum consectetur nec et dolor. Etiam et nulla fermentum, rutrum ligula a, venenatis purus. In mollis tempus ante vel tincidunt. Vestibulum malesuada venenatis erat eget iaculis. Phasellus fermentum feugiat semper. Morbi at neque lobortis turpis ornare hendrerit. Phasellus metus est, convallis vitae dapibus id, sodales non magna. Aenean tempus pulvinar enim eget suscipit. Nulla venenatis mi a nisl tempor, quis pretium tellus aliquam. Donec sit amet velit aliquam, pharetra est in, consequat ex. Donec pretium volutpat massa. Pellentesque mollis iaculis varius. Vestibulum tempor gravida sapien, id dictum tortor lacinia in. Fusce bibendum ac risus sit amet facilisis. Aliquam erat volutpat.

              Integer fringilla tempor leo. Nunc in rutrum ante. Integer massa nibh, scelerisque a egestas viverra, vulputate nec tortor. Mauris faucibus, nisl ut porttitor tempor, enim metus laoreet enim, non feugiat leo erat lobortis libero. Aliquam viverra eget nulla id auctor. Aliquam mi est, sodales sed erat et, accumsan vehicula velit. In egestas sem sed augue sollicitudin viverra. Ut dictum sapien vel odio finibus, at suscipit metus rhoncus. Integer lobortis nisi non mauris sodales, vel cursus tellus molestie. Cras dictum gravida erat ac condimentum. Donec porta, tellus vitae vulputate mollis, nulla mauris pretium sapien, sit amet aliquet felis orci in nisi. Maecenas eros felis, pretium vel pretium sed, sodales varius tellus. Fusce in dui ultrices, molestie sem ac, semper dui. Pellentesque quis pulvinar massa. Ut ac elementum felis.

              In hac habitasse platea dictumst. Curabitur lobortis pharetra dapibus. Aenean nulla arcu, viverra ut nisl in, dictum faucibus lacus. Nullam fringilla velit sit amet ipsum porttitor, quis porta orci maximus. Suspendisse vitae lectus nec neque viverra ultrices ac in purus. Integer a ipsum vel eros feugiat tempor. Suspendisse et imperdiet metus. Vestibulum aliquet nibh neque, sed fringilla justo viverra vel. Maecenas sem urna, aliquet eu viverra sit amet, ultricies ut urna. Donec vitae dui ac urna iaculis dictum.`,
              link: 'https://www.google.ca/',
              enclosure: null,
              isNew: false
            }
          ])
          .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
      );
  }, [feeds]);

  const onOpenNotification = useCallback(() => {
    setNotificationDrawer(true);
    localStorage.setItem(storageKey.current, Date.now().toString());

    // setSystemMessageDialog(true);
    // setNewSystemMessage({ user: '', title: '', severity: 'info', message: '' });
  }, []);

  const onCreateSystemMessage = useCallback(() => {
    setSystemMessageDialog(true);
    setNewSystemMessage({ user: '', title: '', severity: 'info', message: '' });
  }, []);

  const onEditSystemMessage = useCallback(() => {
    setSystemMessageDialog(true);
    setNewSystemMessage({ ...systemMessage });
  }, [systemMessage]);

  const onCancelSystemMessage = useCallback(() => {
    setSystemMessageDialog(false);
    setNewSystemMessage({ user: '', title: '', severity: 'info', message: '' });
  }, []);

  const onSaveSystemMessage = useCallback(() => {
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'PUT',
      body: { ...newSystemMessage, user: currentUser.username },
      onSuccess: () => {
        showSuccessMessage(t('save.success'));
        setSystemMessage({ ...newSystemMessage, user: currentUser.username });
        setReadNotification(false);
        setSaveConfirmation(false);
        setSystemMessageDialog(false);
      }
    });
  }, [apiCall, currentUser, newSystemMessage, setSystemMessage, showSuccessMessage, t]);

  const onDeleteSystemMessage = useCallback(() => {
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setSystemMessage(null);
        setSystemMessageDialog(false);
        setDeleteConfirmation(false);
      }
    });
  }, [apiCall, setSystemMessage, showSuccessMessage, t]);

  return (
    <NotificationContext.Provider
      value={{
        feeds,
        notifications,
        readNotification,
        newSystemMessage,

        setFeeds,
        setNotifications,
        setReadNotification,
        setNewSystemMessage,

        notificationDrawer,
        systemMessageDialog,
        saveConfirmation,
        deleteConfirmation,

        setNotificationDrawer,
        setSystemMessageDialog,
        setSaveConfirmation,
        setDeleteConfirmation,

        onOpenNotification,
        onCreateSystemMessage,
        onEditSystemMessage,
        onCancelSystemMessage,
        onSaveSystemMessage,
        onDeleteSystemMessage
      }}
    >
      {React.useMemo(() => children, [children])}
    </NotificationContext.Provider>
  );
};
