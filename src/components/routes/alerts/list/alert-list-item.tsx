import { Avatar, Box, Chip, Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import ScoreIcon from '@material-ui/icons/Score';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import AlertCardActions from '../alert-card-actions';
import AlertPriority from './alert-priority';

type AlertListItemProps = {
  item: AlertItem;
  layout?: 'inline' | 'stack';
};

const AlertListItem: React.FC<AlertListItemProps> = props => {
  const { layout = 'inline' } = props;
  const theme = useTheme();
  const isLTEMedium = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <Box>{isLTEMedium && layout === 'inline' ? <AlertItemDefault {...props} /> : <AlertItemSmall {...props} />}</Box>
  );
};

const AlertItemDefault: React.FC<AlertListItemProps> = ({ item }) => {
  return (
    <Grid container style={{ alignItems: 'center' }}>
      <Grid item xs={4}>
        <AlertPriority name={item.priority} />
        <Box component="span" ml={1} mr={1}>
          {item.file.name}
        </Box>
        <Typography variant="caption">
          {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Chip size="small" label={item.classification} />
      </Grid>
      <Grid item xs={2}>
        <Chip size="small" label={item.status} />
      </Grid>
      <Grid item xs={2}>
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
      <Grid item xs={2}>
        <Box display="flex" alignItems="center">
          <Box display="flex" flexGrow={1} />
          <AlertCardActions />
        </Box>
      </Grid>
    </Grid>
  );
};

const AlertItemSmall: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  return (
    <Box p={2}>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={10}>
          <AlertPriority name={item.priority} />
          <Box component="span" ml={1} mr={1}>
            {item.file.name}
          </Box>
          <Typography variant="caption">
            {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box display="flex" flexGrow={1} />
            <AlertCardActions />
          </Box>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={12}>
          <Chip
            size="small"
            label={item.classification}
            style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
          />
          <Chip
            size="small"
            label={item.status}
            style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
          />
          <Chip
            label={item.al.score}
            size="small"
            avatar={
              <Avatar>
                <ScoreIcon />
              </Avatar>
            }
            style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
          />
        </Grid>
        {/* <Grid item xs={2}>
          <Chip
            size="small"
            label={item.classification}
            style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
          />
        </Grid>
        <Grid item xs={4}>
          <Chip size="small" label={item.status} />
        </Grid>
        <Grid item xs={2}>
          <Chip
            label={item.al.score}
            size="small"
            avatar={
              <Avatar>
                <ScoreIcon />
              </Avatar>
            }
          />
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default AlertListItem;
