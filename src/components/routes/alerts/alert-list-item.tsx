import { Grid, useTheme } from '@material-ui/core';
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
const AlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('alerts');
  const infoItems = [];

  if (item.al.av.length !== 0) {
    infoItems.push({ label: `${item.al.av.length}x AV`, color: 'warning', size: 'tiny', variant: 'outlined' });
  }
  if (item.al.domain.length !== 0 || item.al.ip.length !== 0) {
    infoItems.push({
      label: `${item.al.domain.length + item.al.ip.length}x IOC`,
      color: 'primary',
      size: 'tiny',
      variant: 'outlined'
    });
  }

  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <AlertPriority name={item.priority} />
          <span style={{ marginLeft: theme.spacing(1) }}>{item.group_count}x</span>
          <span style={{ marginLeft: theme.spacing(1), wordBreak: 'break-all' }}>{item.file.name}</span>
        </Grid>
        <Grid item xs={6} md={2}>
          {item.owner ? (
            <>
              <PersonIcon />
              <span style={{ verticalAlign: 'top', marginLeft: theme.spacing(0.5) }}>{item.owner}</span>
            </>
          ) : item.hint_owner ? (
            <>
              <PersonIcon />
              <span style={{ verticalAlign: 'top', marginLeft: theme.spacing(0.5) }}>{t('assigned')}</span>
            </>
          ) : null}
        </Grid>
        <Grid item xs={6} md={2} style={{ textAlign: 'right' }}>
          <Moment fromNow locale={i18n.language}>
            {item.reporting_ts}
          </Moment>
        </Grid>
        <Grid item xs={12} md={2}>
          <AlertStatus name={item.status} size={'tiny' as 'tiny'} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChipList
            items={item.label
              .map(label => ({ label, size: 'tiny' as 'tiny', variant: 'outlined' as 'outlined' }))
              .concat(
                item.al.attrib.map(label => ({
                  label,
                  size: 'tiny' as 'tiny',
                  color: 'error',
                  variant: 'outlined' as 'outlined'
                }))
              )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <ChipList items={infoItems} />
        </Grid>
        <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
          <Verdict score={item.al.score} />
        </Grid>
      </Grid>
    </div>
  );
};

export default AlertListItem;
