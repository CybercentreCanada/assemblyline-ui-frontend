import useALContext from 'components/hooks/useALContext';
import React from 'react';
import { NotificationDrawer, SystemMessageMain, useNotificationDispatch, useNotificationStore } from '..';

type Props = {
  children?: React.ReactNode;
};

export const WrappedNotificationRoot = ({ children }: Props) => {
  const { dispatch, dispatchAsync } = useNotificationDispatch();
  const { store, setStore } = useNotificationStore();
  const alContext = useALContext();

  const { configuration } = useALContext();

  React.useEffect(() => {
    if (configuration) setStore(s => ({ ...s, notification: { ...s.notification, urls: configuration.ui.rss_feeds } }));
  }, [configuration, setStore]);

  React.useLayoutEffect(() => {
    if (store.loading.feedsFetched === false) dispatchAsync.loadFeeds(store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchAsync, store.loading.feedsFetched]);

  React.useLayoutEffect(() => {
    if (store.loading.feedsFetched === true && store.loading.lastTimeOpen === false) dispatch.loadLastTimeOpen();
  }, [dispatch, store.loading.feedsFetched, store.loading.lastTimeOpen]);

  React.useLayoutEffect(() => {
    if (store.loading.feedsFetched === true && store.loading.lastTimeOpen === true)
      dispatch.notificationsChange(store.notification.feeds);
  }, [dispatch, store.loading.feedsFetched, store.loading.lastTimeOpen, store.notification.feeds]);

  return (
    <>
      <SystemMessageMain store={store} alContext={alContext} />
      <NotificationDrawer store={store} alContext={alContext} />
      {React.useMemo(() => children, [children])}
    </>
  );
};

export const NotificationRoot = React.memo(WrappedNotificationRoot);
export default NotificationRoot;
