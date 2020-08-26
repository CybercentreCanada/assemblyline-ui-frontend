import { Badge, Box, Chip, ListItem, makeStyles, Typography, useTheme, withStyles } from '@material-ui/core';
import ScoreIcon from '@material-ui/icons/Score';
import { AlertItem } from 'components/routes/alerts/alerts';
import AlertCardActions from 'components/routes/alerts/grid/alert-card-actions';
import React from 'react';

const useStyles = makeStyles(theme => ({
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(2),
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.grey[800]
    },
    '& > *': {
      marginRight: theme.spacing(1)
    }
  }
}));

type AlertListItemProps = {
  item: AlertItem;
};

//
const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem}>
      <StatusChip label="Malicious" />
      <Typography>{item.file.name}</Typography>
      <Typography variant="caption">
        {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
      </Typography>
      <Box display="inline-flex" flexGrow={1} />
      <Typography variant="h6">{item.group_count}x</Typography>
      <Badge badgeContent={item.al.score} color="error" max={10000}>
        <ScoreIcon />
      </Badge>
      <AlertCardActions />
    </ListItem>
  );
};

const StatusChip = ({ label }) => {
  const theme = useTheme();
  const SChip = withStyles({
    root: {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.common.white
    }
  })(Chip);
  return <SChip label={label} size="small" />;
};

export default AlertListItem;
