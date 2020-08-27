import { Avatar, Box, Chip, ListItem, makeStyles, Typography, useTheme, withStyles } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ScoreIcon from '@material-ui/icons/Score';
import AlertCardActions from 'components/routes/alerts/alert-card-actions';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';

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

//
const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem}>
      {/* <StatusChip label="Malicious" /> */}
      {/* <StatusChip label={item.priority} /> */}
      <Priority label={item.priority} />
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
      <Chip label={item.status} />
      <Typography variant="h6">{item.group_count}x</Typography>
      {/* <Badge badgeContent={item.al.score} color="primary" max={10000}>
        <ScoreIcon../ />
      </Badge> */}
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

const Priority = ({ label }) => {
  const theme = useTheme();
  const COLOR_MAP = {
    CRITICAL: { color: 'hsl(0, 100%, 50%)', arrow: <ArrowUpwardIcon color="inherit" /> },
    HIGH: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowUpwardIcon color="inherit" /> },
    MEDIUM: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowDownwardIcon color="inherit" /> },
    LOW: { color: 'hsl(120, 100%, 25%)', arrow: <ArrowDownwardIcon color="inherit" /> }
  };

  const { color, arrow } = COLOR_MAP[label];
  return (
    <Box style={{ backgroundColor: color, color: theme.palette.getContrastText(color) }} display="inline-flex">
      {arrow}
    </Box>
  );
};

export default AlertListItem;
