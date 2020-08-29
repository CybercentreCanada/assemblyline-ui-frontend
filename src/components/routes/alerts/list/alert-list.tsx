import { Box, makeStyles } from '@material-ui/core';
import { AlertItem } from 'components/routes/alerts/alerts';
import AlertListItem from 'components/routes/alerts/list/alert-list-item';
import React from 'react';

const useStyles = makeStyles(theme => ({
  listItem: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]
  }
}));

type AlertListProps = {
  items: AlertItem[];
  selected?: AlertItem;
  onItemClick: (item: AlertItem) => void;
};

const AlertList: React.FC<AlertListProps> = ({ items, selected = null, onItemClick }) => {
  const classes = useStyles();
  return (
    <Box>
      {items.map(i => (
        <Box key={i.sid} className={classes.listItem} onClick={() => onItemClick(i)}>
          <AlertListItem item={i} isSelected={i === selected} />
        </Box>
      ))}
    </Box>
  );
};

export default AlertList;
