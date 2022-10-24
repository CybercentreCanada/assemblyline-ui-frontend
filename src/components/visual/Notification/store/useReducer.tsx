import { CustomUser, SystemMessageDefinition } from 'components/hooks/useMyUser';
import React from 'react';
import { ActionConfig, ActionsConfig, Feed, FeedItem, ReducerConfig, ReducersConfig, Store } from '..';

export type Action = ActionConfig<
  | { type: 'openDrawer'; payload: void }
  | { type: 'closeDrawer'; payload: void }
  | { type: 'setDrawer'; payload: boolean }
  | { type: 'loadLastTimeOpen'; payload: void }
  | { type: 'notificationsChange'; payload: Array<Feed> }
  | { type: 'createSystemMessage'; payload: { currentUser: CustomUser } }
  | { type: 'editSystemMessage'; payload: { currentUser: CustomUser; systemMessage: SystemMessageDefinition } }
>;

type Reducer = ReducerConfig<Store, Action>;
type Reducers = ReducersConfig<Store, Action>;

export const useNotificationReducer = () => {
  const actions: ActionsConfig<Action> = {
    openDrawer: {},
    closeDrawer: {},
    setDrawer: {},
    loadLastTimeOpen: {},
    notificationsChange: {},
    createSystemMessage: {},
    editSystemMessage: {}
  };

  const openDrawer: Reducers['openDrawer'] = React.useCallback((store, payload) => {
    return { ...store, open: { ...store.open, drawer: true }, read: true };
  }, []);

  const closeDrawer: Reducers['closeDrawer'] = React.useCallback((store, payload) => {
    localStorage.setItem(store.notification.localStorage, JSON.stringify(Date.now()));
    return { ...store, open: { ...store.open, drawer: false }, read: true };
  }, []);

  const setDrawer: Reducers['setDrawer'] = React.useCallback((store, payload) => {
    return { ...store, open: { ...store.open, drawer: payload } };
  }, []);

  const loadLastTimeOpen: Reducers['loadLastTimeOpen'] = React.useCallback((store, payload) => {
    const data: string = localStorage.getItem(store.notification.localStorage);
    if (data === null) return { ...store };

    const value = JSON.parse(data);
    if (typeof value !== 'number') return { ...store };

    const date: Date = new Date(value);
    return {
      ...store,
      loading: { ...store.loading, lastTimeOpen: true },
      notification: { ...store.notification, lastTimeOpen: date }
    };

    // if (!Array.isArray(notifications)) return;
    // const count = notifications.filter(n => n.pubDate > date).length;
    // setNewNotificationCount(count);

    // console.log(data, value, date, count);

    // return { ...store, notification: { ...store.open, drawer: payload } };
  }, []);

  const notificationsChange: Reducers['notificationsChange'] = React.useCallback((store, feeds): Store => {
    if (feeds === null || !Array.isArray(feeds))
      return { ...store, notification: { ...store.notification, items: null } };
    else if (feeds.length === 0) return { ...store, notification: { ...store.notification, items: [] } };
    else {
      const notifications = feeds
        .flatMap(f => f.items)
        .map((n: FeedItem) => ({ ...n, isNew: n.pubDate.valueOf() > store.notification.lastTimeOpen.valueOf() }))
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
            isNew: true
          }
        ])
        .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

      return {
        ...store,
        notification: {
          ...store.notification,
          items: notifications,
          newItemsCount: notifications.filter(n => n.pubDate.valueOf() > store.notification.lastTimeOpen.valueOf())
            .length
        }
      };
    }
  }, []);

  const createSystemMessage: Reducers['createSystemMessage'] = React.useCallback((store, { currentUser }) => {
    return {
      ...store,
      open: { ...store.open, editDialog: true },
      systemMessage: { ...store.systemMessage, user: currentUser.username, title: '', severity: 'info', message: '' }
    };
  }, []);

  const editSystemMessage: Reducers['editSystemMessage'] = React.useCallback(
    (store, { currentUser, systemMessage }) => {
      return {
        ...store,
        open: { ...store.open, editDialog: true },
        systemMessage: {
          ...store.systemMessage,
          user: currentUser.username,
          title: systemMessage.title,
          severity: systemMessage.severity,
          message: systemMessage.message
        }
      };
    },
    []
  );

  const reducer: Reducer = React.useCallback(
    ({ store, action, prevStore }) => {
      if (action.type === 'openDrawer') return openDrawer(store, action.payload);
      else if (action.type === 'closeDrawer') return closeDrawer(store, action.payload);
      else if (action.type === 'setDrawer') return setDrawer(store, action.payload);
      else if (action.type === 'loadLastTimeOpen') return loadLastTimeOpen(store, action.payload);
      else if (action.type === 'notificationsChange') return notificationsChange(store, action.payload);
      else if (action.type === 'createSystemMessage') return createSystemMessage(store, action.payload);
      else if (action.type === 'editSystemMessage') return editSystemMessage(store, action.payload);
      else return store;
    },
    [openDrawer, closeDrawer, setDrawer, loadLastTimeOpen, notificationsChange, createSystemMessage, editSystemMessage]
  );

  return { actions, reducer };
};
