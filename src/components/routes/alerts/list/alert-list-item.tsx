import { Avatar, Box, Chip, Grid, makeStyles, Typography } from '@material-ui/core';
import ScoreIcon from '@material-ui/icons/Score';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import AlertCardActions from '../alert-card-actions';
import AlertPriority from './alert-priority';

const useStyles = makeStyles(theme => ({
  listItem: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]
    }
  }
}));

type AlertListItemProps = {
  item: AlertItem;
};

const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const classes = useStyles();
  return (
    <Box className={classes.listItem}>
      <Grid container spacing={1} style={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <AlertPriority name={item.priority} />
          <Box component="span" ml={1} mr={1}>
            {item.file.name}
          </Box>
          <Typography variant="caption">
            {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Chip
            label={item.al.score}
            size="small"
            avatar={
              <Avatar>
                <ScoreIcon />
              </Avatar>
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box display="flex" alignItems="center">
            <Box display="flex" flexGrow={1} />
            <Chip size="small" label={item.status} />
            <AlertCardActions />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertListItem;
