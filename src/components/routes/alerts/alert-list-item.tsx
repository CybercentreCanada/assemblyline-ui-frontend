import { Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import { ChipList } from 'components/elements/mui/chips';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import Verdict from 'components/visual/Verdict';
import { formatDistanceToNowStrict } from 'date-fns';
import React from 'react';
import AlertPriority from './alert-priority';

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

//
const AlertItemDefault: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container style={{ alignItems: 'center', paddingBottom: theme.spacing(1) }}>
        <Grid item xs={4}>
          <AlertPriority name={item.priority} />
          <span style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>{item.file.name}</span>
          <Typography variant="caption">
            {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Verdict score={item.al.score} />
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'inline-block' }}>
            <Classification c12n={item.classification} type="pill" size="tiny" format="short" />
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </div>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <ChipList items={item.label.map(label => ({ label, size: 'small', variant: 'outlined' }))} />
        </Grid>
        <Grid item xs={4}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CustomChip size="small" variant="outlined" label={item.status} />
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.owner ? (
              <>
                <AssignmentIndIcon />
                &nbsp; {item.owner}
              </>
            ) : item.hint_owner ? (
              <>
                <AssignmentIndIcon />
                &nbsp; assigned
              </>
            ) : null}
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            <Typography>{item.group_count}x</Typography>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const AlertItemSmall: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={8}>
          <AlertPriority name={item.priority} />
          <span style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>{item.file.name}</span>
          <Typography variant="caption">
            {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <CustomChip label={item.status} variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </div>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={8}>
          <div>
            <Verdict score={item.al.score} />
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIndIcon />
            &nbsp;{item.owner ? item.owner : item.hint_owner ? 'assigned' : 'none'}
          </div>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            <Typography>{item.group_count}x</Typography>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const AlertItemXSmall: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={10}>
          <AlertPriority name={item.priority} />
          <span style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>{item.file.name}</span>
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            {formatDistanceToNowStrict(new Date(item.reporting_ts))}
          </div>
        </Grid>
      </Grid>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={6}>
          <div>
            <Verdict score={item.al.score} />
          </div>
        </Grid>
        <Grid item xs={4}>
          <CustomChip label={item.status} variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }} />
            <Typography>{item.group_count}x</Typography>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

//
export default AlertListItem;
