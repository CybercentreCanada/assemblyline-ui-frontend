import { Grid, Tooltip, useTheme } from '@material-ui/core';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import { ChipList } from 'components/visual/ChipList';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import AlertListChip from './alert-av-list';
import AlertExtendedScan from './alert-extended_scan';
import AlertPriority from './alert-priority';
import AlertStatus from './alert-status';

type AlertListItemProps = {
  item: AlertItem;
};
const WrappedAlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('alerts');

  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <AlertExtendedScan name={item.extended_scan} />
          <AlertPriority name={item.priority} />
          {item.group_count && <span style={{ marginLeft: theme.spacing(1) }}>{item.group_count}x</span>}
          <span style={{ marginLeft: theme.spacing(1), wordBreak: 'break-word' }}>{item.file.name}</span>
        </Grid>
        <Grid item xs={6} md={2} style={{ minHeight: theme.spacing(5) }}>
          {item.verdict.malicious.length > item.verdict.non_malicious.length ? (
            <Tooltip
              title={`${item.verdict.malicious.length}/${
                item.verdict.malicious.length + item.verdict.non_malicious.length
              } ${t('verdict.user.malicious')}`}
            >
              <BugReportOutlinedIcon />
            </Tooltip>
          ) : null}
          {item.verdict.non_malicious.length > item.verdict.malicious.length ? (
            <Tooltip
              title={`${item.verdict.non_malicious.length}/${
                item.verdict.malicious.length + item.verdict.non_malicious.length
              } ${t('verdict.user.non_malicious')}`}
            >
              <VerifiedUserOutlinedIcon />
            </Tooltip>
          ) : null}
          {item.owner ? (
            <>
              <Tooltip title={`${t('owned_by')} ${item.owner}`}>
                <PersonOutlineOutlinedIcon />
              </Tooltip>
            </>
          ) : item.hint_owner ? (
            <>
              <Tooltip title={t('hint_owned_by')}>
                <GroupOutlinedIcon />
              </Tooltip>
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
                  variant: 'outlined' as 'outlined',
                  style: { cursor: 'inherit' }
                }))
              )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <AlertListChip items={item.al.av} title="AV" color="warning" size="tiny" />
          <AlertListChip items={item.al.ip} title="IP" color="primary" size="tiny" />
          <AlertListChip items={item.al.domain} title="DOM" color="success" size="tiny" />
        </Grid>
        <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
          <Verdict score={item.al.score} />
        </Grid>
      </Grid>
    </div>
  );
};

const AlertListItem = React.memo(WrappedAlertListItem);
export default AlertListItem;
