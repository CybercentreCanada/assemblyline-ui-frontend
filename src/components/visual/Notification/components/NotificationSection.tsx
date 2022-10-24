import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationEmpty, NotificationItem, Store, useNotificationStyles } from '..';

type Props = {
  store: Store;
};

const WrappedNotificationSection: React.FC<Props> = ({ store }: Props) => {
  const { classes } = useNotificationStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['notification']);

  const notifications = store.notification.items;

  return (
    <>
      {notifications === null ? (
        <Skeleton className={classes.skeleton} />
      ) : notifications.length === 0 ? (
        <NotificationEmpty text="There are no notifications." />
      ) : (
        notifications.map((n, i) => (
          <NotificationItem key={i} notification={n} hideDivider={i === notifications.length - 1} />
        ))
      )}
    </>
  );
};

export const NotificationSection = React.memo(
  WrappedNotificationSection,
  (prevProps: Readonly<React.PropsWithChildren<Props>>, nextProps: Readonly<React.PropsWithChildren<Props>>) =>
    prevProps.store.notification.items === nextProps.store.notification.items
);
export default NotificationSection;
