import { Grid, Paper, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import MoodIcon from '@material-ui/icons/Mood';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import Classification from 'components/visual/Classification';
import ExtendedScan from 'components/visual/ExtendedScan';
import Verdict from 'components/visual/Verdict';
import VerdictBar from 'components/visual/VerdictBar';
import React from 'react';

type AlertCardItemProps = {
  item: AlertItem;
};

const AlertCardItem: React.FC<AlertCardItemProps> = ({ item }) => {
  const theme = useTheme();
  const isDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isDownXS = useMediaQuery(theme.breakpoints.down('xs'));
  return (
    <Paper style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2), padding: theme.spacing(2) }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2} lg={1} style={{ textAlign: 'center' }}>
          <div>
            <Verdict score={item.al.score} />
          </div>
          {item.group_count && (
            <div style={{ paddingTop: theme.spacing(2) }}>
              <h2>{`${item.group_count}x`}</h2>
            </div>
          )}
          {item.extended_scan && (
            <div style={{ paddingTop: theme.spacing(2) }}>
              <ExtendedScan state={item.extended_scan} />
            </div>
          )}
          <div style={{ paddingTop: theme.spacing(4) }}>
            <VerdictBar verdicts={item.verdict} width="120px" />
            <Grid container>
              <Grid item xs={6}>
                <MoodBadIcon color="action" />
              </Grid>
              <Grid item xs={6}>
                <MoodIcon color="action" />
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item xs={12} sm={10} lg={11}>
          <Grid container spacing={2}>
            <Grid item xs={3} sm={2}>
              {item.type}
            </Grid>
            <Grid item xs={5} sm={7}>
              {item.reporting_ts}
            </Grid>
            <Grid item xs={4} sm={3} style={{ textAlign: 'right' }}>
              <Classification c12n={item.classification} size="tiny" inline />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right' }}>
          <Typography variant="caption" color="secondary">
            {item.alert_id}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

//
export default AlertCardItem;
