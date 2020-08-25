import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import AlertListItem from './alert-list-item';
import { AlertItem } from './alerts';

const useStyles = makeStyles(theme => ({
  listItem: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[800]
  }
}));

type AlertListProps = {
  items: AlertItem[];
  onItemClick: (item: AlertItem) => void;
};

//
const AlertList: React.FC<AlertListProps> = ({ items, onItemClick }) => {
  const classes = useStyles();
  return (
    <Box>
      {items.map(i => (
        <Box key={i.sid} className={classes.listItem} onClick={() => onItemClick(i)}>
          <AlertListItem item={i} />
        </Box>
      ))}
    </Box>
  );
};

export default AlertList;
