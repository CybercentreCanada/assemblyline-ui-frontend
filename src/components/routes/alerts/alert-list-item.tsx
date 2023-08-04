import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Grid, Tooltip, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { AlertItem, detailedItemCompare } from 'components/routes/alerts/hooks/useAlerts';
import { ActionableChipList } from 'components/visual/ActionableChipList';
import CustomChip from 'components/visual/CustomChip';
import Verdict from 'components/visual/Verdict';
import { verdictToColor } from 'helpers/utils';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import AlertListChip from './alert-chip-list';
import AlertListChipDetailed from './alert-chip-list-detailed';
import AlertExtendedScan from './alert-extended_scan';
import AlertPriority from './alert-priority';
import AlertStatus from './alert-status';

type AlertListItemProps = {
  item: AlertItem;
};

const WrappedAlertListItem: React.FC<AlertListItemProps> = ({ item }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('alerts');
  const { configuration } = useALContext();

  let subject = '';
  for (let subItem of configuration.ui.alerting_meta.subject) {
    let metaVal = item.metadata[subItem];
    if (metaVal !== undefined && metaVal !== null) {
      subject = metaVal;
      break;
    }
  }

  let url = '';
  for (let subItem of configuration.ui.alerting_meta.url) {
    let metaVal = item.metadata[subItem];
    if (metaVal !== undefined && metaVal !== null) {
      url = metaVal;
      break;
    }
  }

  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <div style={{ display: 'flex' }}>
            <AlertExtendedScan name={item.extended_scan} />
            <AlertPriority name={item.priority} />
            {item.group_count && <div style={{ marginLeft: theme.spacing(1) }}>{item.group_count}x</div>}
            <div>
              {subject && (
                <div
                  style={{
                    marginLeft: theme.spacing(1),
                    wordBreak: 'break-word'
                  }}
                >
                  {subject}
                </div>
              )}
              <div
                style={{
                  marginLeft: theme.spacing(1),
                  wordBreak: 'break-all',
                  color: subject ? theme.palette.text.secondary : theme.palette.text.primary
                }}
              >
                {url || item.file.name}
              </div>
            </div>
          </div>
        </Grid>
        <Grid item xs={6} md={2} style={{ minHeight: theme.spacing(5) }}>
          <CustomChip
            size="tiny"
            label={item.file.type}
            variant="outlined"
            style={{ marginBottom: '11px', marginRight: theme.spacing(0.5) }}
          />
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
          <Grid container spacing={1}>
            <Grid item>
              <CustomChip size="tiny" variant="outlined" label={item.type} style={{ cursor: 'inherit' }} />
            </Grid>
            <Grid item>
              <AlertStatus name={item.status} size={'tiny' as 'tiny'} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <ActionableChipList
            items={item.label
              .sort()
              .map(label => ({
                label,
                size: 'tiny' as 'tiny',
                variant: 'outlined' as 'outlined',
                style: { cursor: 'inherit' }
              }))
              .concat(
                item.al.detailed
                  ? item.al.detailed.attrib.sort(detailedItemCompare).map(attrib_item => ({
                      label: attrib_item.subtype ? `${attrib_item.value} - ${attrib_item.subtype}` : attrib_item.value,
                      size: 'tiny' as 'tiny',
                      color: verdictToColor(attrib_item.verdict),
                      variant: 'outlined' as 'outlined',
                      style: { cursor: 'inherit' }
                    }))
                  : item.al.attrib.map(label => ({
                      label,
                      size: 'tiny' as 'tiny',
                      variant: 'outlined' as 'outlined',
                      style: { cursor: 'inherit' }
                    }))
              )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          {item.al.detailed ? (
            <>
              <AlertListChipDetailed items={item.al.detailed.av} title="AV" size="tiny" />
              <AlertListChipDetailed items={item.al.detailed.ip} title="IP" size="tiny" />
              <AlertListChipDetailed items={item.al.detailed.domain} title="DOM" size="tiny" />
              <AlertListChipDetailed items={item.al.detailed.uri} title="URI" size="tiny" />
            </>
          ) : (
            <>
              <AlertListChip items={item.al.av} title="AV" size="tiny" />
              <AlertListChip items={item.al.ip} title="IP" size="tiny" />
              <AlertListChip items={item.al.domain} title="DOM" size="tiny" />
              <AlertListChip items={item.al.uri} title="URI" size="tiny" />
            </>
          )}
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
