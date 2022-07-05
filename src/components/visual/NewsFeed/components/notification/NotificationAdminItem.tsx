import { Typography } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddAlertOutlinedIcon from '@material-ui/icons/AddAlertOutlined';
import 'moment-timezone';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsFeed } from '../..';

export const WrappedNotificationAdminItem = () => {
  const { t } = useTranslation(['notification']);
  const { onFeedDrawerChange } = useNewsFeed();

  return (
    <ListItem button>
      <ListItemIcon>
        <AddAlertOutlinedIcon />
      </ListItemIcon>
      <ListItemText>
        <Typography variant="subtitle1">{t('add.title')}</Typography>
      </ListItemText>
    </ListItem>
  );
};

export const NotificationAdminItem = React.memo(WrappedNotificationAdminItem);
export default NotificationAdminItem;
