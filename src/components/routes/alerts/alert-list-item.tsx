import { Grid, makeStyles, useTheme } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { ChipList } from 'components/elements/mui/chips';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import AlertPriority from './alert-priority';
import AlertStatus from './alert-status';

type AlertListItemProps = {
  item: AlertItem;
};

const useStyles = makeStyles(theme => ({
  file_info: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis'
  }
}));
const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const classes = useStyles();

  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container spacing={1}>
        <Grid item xs={8} className={classes.file_info}>
          <AlertPriority name={item.priority} />
          <span style={{ marginLeft: theme.spacing(1) }}>{item.group_count}x</span>
          <span style={{ marginLeft: theme.spacing(1) }}>{item.file.name}</span>
        </Grid>
        <Grid item xs={2}>
          {item.owner ? (
            <>
              <PersonIcon />
              &nbsp; {item.owner}
            </>
          ) : item.hint_owner ? (
            <>
              <PersonIcon />
              &nbsp; assigned
            </>
          ) : null}
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'right' }}>
          <Verdict score={item.al.score} />
        </Grid>
        <Grid item xs={2}>
          <AlertStatus name={item.status} />
        </Grid>
        <Grid item xs={6}>
          <ChipList
            items={item.label
              .map(label => ({ label, variant: 'outlined' as 'outlined' }))
              .concat(
                item.al.attrib.map(label => ({
                  label,
                  color: 'error',
                  variant: 'outlined' as 'outlined'
                }))
              )}
          />
        </Grid>
        <Grid item xs={2}>
          <ChipList
            items={[
              { label: `${item.al.av.length}x AVs`, variant: 'outlined' },
              { label: `${item.al.domain.length + item.al.ip.length}x IOCs`, variant: 'outlined' }
            ]}
          />
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'right' }}>
          <Moment fromNow locale={i18n.language}>
            {item.reporting_ts}
          </Moment>
        </Grid>
      </Grid>
    </div>
  );
};

export default AlertListItem;
