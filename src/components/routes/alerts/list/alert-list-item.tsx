Modifiedimport { Box, Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import { Chip, ChipList } from '../panels/chips';
import AlertPriority from './alert-priority';
import AlertScore from './alert-score';

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
    <Box>
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
        <Grid item xs={4}>
          <AlertScore score={item.al.score} variant="outlined" />
        </Grid>
        <Grid item xs={4}>
          <Chip size="small" variant="outlined" label={item.status} />
        </Grid>
        {/* <Grid item xs={4}>
          <Box display="flex" flexDirection="row" mt={1}>
            <Box flex={1} />
            <ChipList items={item.label.map(label => ({ label, size: 'small', variant: 'outlined' }))} />
          </Box>
        </Grid> */}
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={12}>
          <ChipList items={item.label.map(label => ({ label, size: 'small', variant: 'outlined' }))} />
        </Grid>
      </Grid>
    </Box>
  );
};

const AlertItemSmall: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
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
        <Grid item xs={4}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} />
            <AlertScore withText={false} score={item.al.score} variant="outlined" />
          </Box>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={12}>
          {item.status}
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
