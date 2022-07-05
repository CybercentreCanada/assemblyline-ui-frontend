import { Typography } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsFeed } from '../..';

export const WrappedLayoutFeedHeader = () => {
  const { t } = useTranslation(['feed']);
  const { onFeedDrawerChange } = useNewsFeed();

  return (
    <ListItem button onClick={() => onFeedDrawerChange(false)}>
      <ListItemIcon>
        <CloseOutlinedIcon />
      </ListItemIcon>
      <ListItemText>
        <Typography variant="h5" align="left">
          {t('title')}
        </Typography>
      </ListItemText>
    </ListItem>
  );
};

export const LayoutFeedHeader = React.memo(WrappedLayoutFeedHeader);
export default LayoutFeedHeader;
