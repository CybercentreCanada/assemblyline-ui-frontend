import { Drawer } from '@material-ui/core';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import {
  DrawerCloseButton,
  NotificationHeader,
  NotificationSection,
  Store,
  SystemMessageHeader,
  SystemMessageSection,
  useNotificationDispatch,
  useNotificationStyles
} from '..';

type Props = {
  store: Store;
  alContext: CustomUserContextProps;
};

const WrappedNotificationDrawer: React.FC<Props> = ({ store, alContext }: Props) => {
  const { classes } = useNotificationStyles();
  const { dispatch } = useNotificationDispatch();

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.drawer }}
      open={store.open.drawer}
      onClose={() => dispatch.closeDrawer()}
    >
      <div className={classes.root}>
        <div className={classes.container}>
          <DrawerCloseButton />
          <SystemMessageHeader alContext={alContext} />
          <SystemMessageSection alContext={alContext} />
          <NotificationHeader />
          <NotificationSection store={store} />
        </div>
      </div>
    </Drawer>
  );
};

export const NotificationDrawer = React.memo(WrappedNotificationDrawer);
export default NotificationDrawer;
