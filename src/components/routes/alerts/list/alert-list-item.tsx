import { Avatar, Box, Chip, ListItem, makeStyles, Typography, useTheme, withStyles } from '@material-ui/core';
import ScoreIcon from '@material-ui/icons/Score';
import AlertCardActions from 'components/routes/alerts/alert-card-actions';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import AlertPriority from './alert-priority';

const useStyles = makeStyles(theme => ({
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(2),
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]
    },
    '& > *': {
      marginRight: theme.spacing(1)
    }
  }
}));

type AlertListItemProps = {
  item: AlertItem;
};

const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem}>
      <AlertPriority name={item.priority} />
      <Typography>{item.file.name}</Typography>
      <Typography variant="caption">
        {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
      </Typography>
      <Chip
        label={item.al.score}
        size="small"
        avatar={
          <Avatar>
            <ScoreIcon />
          </Avatar>
        }
      />
      <Box display="inline-flex" flexGrow={1} />
      <Chip size="small" label={item.status} />
      <Typography variant="h6">{item.group_count}x</Typography>
      <AlertCardActions />
    </ListItem>
  );
};

const StatusChip = ({ label }) => {
  const theme = useTheme();
  const COLOR_MAP = {
    CRITICAL: 'hsl(0, 100%, 50%)',
    HIGH: 'hsl(16, 100%, 50%)',
    MEDIUM: 'hsl(39, 100%, 50%)',
    LOW: 'hsl(60, 100%, 50%)'
  };
  const SChip = withStyles({
    root: {
      backgroundColor: COLOR_MAP[label],
      color: theme.palette.getContrastText(COLOR_MAP[label])
    }
  })(Chip);

  return <SChip label={label} size="small" />;
};

export default AlertListItem;
