import useMyAPI from 'components/hooks/useMyAPI';
import { XMLParser } from 'fast-xml-parser';
import 'moment-timezone';
import 'moment/locale/fr';
import React from 'react';
import {
  ActionConfig,
  ActionsConfig,
  DEFAULT_NOTIFICATION,
  Feed,
  formatByte,
  parseFeed2,
  ReducerAsyncConfig,
  ReducersAsyncConfig,
  Store
} from '..';

export type ActionAsync = ActionConfig<
  | { type: 'loadFeeds'; payload: void }
  | { type: 'deleteSystemMessage'; payload: void }
  | { type: 'saveSystemMessage'; payload: void }
>;

type Reducer = ReducerAsyncConfig<Store, ActionAsync>;
type Reducers = ReducersAsyncConfig<Store, ActionAsync>;

export const useNotificationReducerAsync = () => {
  const { apiCall } = useMyAPI();

  const actionsAsync: ActionsConfig<ActionAsync> = {
    loadFeeds: {},
    deleteSystemMessage: {},
    saveSystemMessage: {}
  };

  const handleFetchFeed = React.useCallback(
    (url: string): Promise<Feed> =>
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

  const handleFetchFeeds = React.useCallback(
    (urls: string[]): Promise<Feed[]> =>
      new Promise(async (resolve, reject) => {
        const n: Feed[] = (await Promise.all(urls.map(url => handleFetchFeed(url))).catch(err =>
          reject(err)
        )) as Feed[];
        resolve(n);
      }),
    [handleFetchFeed]
  );

  const loadFeeds: Reducers['loadFeeds'] = React.useCallback(
    async (store, payload) =>
      new Promise(async (resolve, reject) => {
        if (
          store.notification.urls === null ||
          !Array.isArray(store.notification.urls) ||
          store.notification.urls.length === 0 ||
          store.loading.feedsFetched === true
        )
          resolve({ ...store });
        else
          handleFetchFeeds(store.notification.urls).then((feeds: Array<Feed>) =>
            resolve({
              ...store,
              loading: { ...store.loading, feedsFetched: true },
              notification: { ...store.notification, feeds: feeds }
            })
          );
      }),
    [handleFetchFeeds]
  );

  const deleteSystemMessage: Reducers['deleteSystemMessage'] = React.useCallback(
    async (store, payload) =>
      new Promise(async (resolve, reject) =>
        apiCall({
          url: '/api/v4/system/system_message/',
          method: 'DELETE',
          onSuccess: () => resolve({ ...store, open: { ...store.open, deleteConfirmation: false } })
        })
      ),
    [apiCall]
  );

  const saveSystemMessage: Reducers['saveSystemMessage'] = React.useCallback(
    async (store, payload) =>
      new Promise(async (resolve, reject) =>
        apiCall({
          url: '/api/v4/system/system_message/',
          method: 'PUT',
          body: { ...store.systemMessage },
          onSuccess: () =>
            resolve({ ...store, read: false, open: { ...store.open, editDialog: false, saveConfirmation: false } })
        })
      ),
    [apiCall]
  );

  const reducerAsync: Reducer = React.useCallback(
    ({ store, action, prevStore }) =>
      new Promise(async (resolve, reject) => {
        if (action.type === 'loadFeeds') resolve(await loadFeeds(store, action.payload));
        else if (action.type === 'deleteSystemMessage') resolve(await deleteSystemMessage(store, action.payload));
        else if (action.type === 'saveSystemMessage') resolve(await saveSystemMessage(store, action.payload));
        else resolve(store);
      }),
    [deleteSystemMessage, loadFeeds, saveSystemMessage]
  );

  return { actionsAsync, reducerAsync };
};
