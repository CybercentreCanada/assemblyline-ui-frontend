import { Box, Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import { ChipList } from 'components/elements/mui/chips';
import { AlertItem } from 'components/routes/alerts/useAlerts';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { formatDistanceToNowStrict } from 'date-fns';
import React from 'react';
import AlertPriority from './alert-priority';
import AlertScore from './alert-score';

type AlertListItemProps = {
  item: AlertItem;
};

const AlertListItem: React.FC<AlertListItemProps> = props => {
  const theme = useTheme();
  const isDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isDownXS = useMediaQuery(theme.breakpoints.down('xs'));
  if (isDownXS) {
    return <AlertItemXSmall {...props} />;
  }
  if (isDownSM) {
    return <AlertItemSmall {...props} />;
  }
  return <AlertItemDefault {...props} />;
};

const AlertItemDefault: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  return (
    <Box overflow="auto" p={1}>
      <Grid container style={{ alignItems: 'center', paddingBottom: theme.spacing(1) }}>
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
          {/* {item.index} */}
          <AlertScore score={item.al.score} />
        </Grid>
        <Grid item xs={2}>
          <Box display="inline-block">
            <Classification c12n={item.classification} type="pill" size="tiny" format="short" />
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </Box>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <ChipList items={item.label.map(label => ({ label, size: 'small', variant: 'outlined' }))} />
        </Grid>
        <Grid item xs={4}>
          <Box alignItems="center" display="flex">
            <CustomChip size="small" variant="outlined" label={item.status} />
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box alignItems="center" display="flex">
            <AssignmentIndIcon />
            &nbsp;{item.owner ? item.owner : item.hint_owner ? 'assigned' : 'none'}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            <Typography>{item.group_count}x</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const AlertItemSmall: React.FC<AlertListItemProps> = ({ item }) => {
  return (
    <Box>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={8}>
          <AlertPriority name={item.priority} />
          <Box component="span" ml={1} mr={1}>
            {item.file.name}
          </Box>
          <Typography variant="caption">
            {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <CustomChip label={item.status} variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </Box>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={8}>
          <Box ml={-1}>
            <AlertScore score={item.al.score} />
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box alignItems="center" display="flex">
            <AssignmentIndIcon />
            &nbsp;{item.owner ? item.owner : item.hint_owner ? 'assigned' : 'none'}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            <Typography>{item.group_count}x</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const AlertItemXSmall: React.FC<AlertListItemProps> = ({ item }) => {
  return (
    <Box>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={10}>
          <AlertPriority name={item.priority} />
          <Box component="span" ml={1} mr={1}>
            {item.file.name}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </Box>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={6}>
          <Box ml={-1}>
            <AlertScore score={item.al.score} />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <CustomChip label={item.status} variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            <Typography>{item.group_count}x</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

//
export default AlertListItem;
