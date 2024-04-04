import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { DetailedItem, detailedItemCompare } from 'components/routes/alerts/hooks/useAlerts';
import { ActionableChipList } from 'components/visual/ActionableChipList';
import { ActionableCustomChipProps } from 'components/visual/ActionableCustomChip';
import { ChipList } from 'components/visual/ChipList';
import CustomChip, { CustomChipProps } from 'components/visual/CustomChip';
import { verdictToColor } from 'helpers/utils';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { AlertItem } from '../models/Alert';

const useStyles = makeStyles(theme => ({
  extended: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  },
  priority: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  },
  success: {
    color: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
  },
  info: {
    color: theme.palette.mode !== 'dark' ? theme.palette.info.dark : theme.palette.info.light
  },
  default: {
    color: theme.palette.text.disabled
  },
  warning: {
    color: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
  },
  error: {
    color: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
  }
}));

type PossibleColors = 'info' | 'default' | 'error' | 'success' | 'primary' | 'secondary' | 'warning';

type AlertExtendedScanProps = {
  name: string;
  withChip?: boolean;
  size?: CustomChipProps['size'];
};

export const AlertExtendedScan: React.FC<AlertExtendedScanProps> = React.memo(
  ({ name, withChip = false, size = 'small' }: AlertExtendedScanProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();

    const data = useMemo<{ color: PossibleColors; arrow: ReactNode }>(() => {
      const dataMap = {
        submitted: { color: 'info', arrow: <SlowMotionVideoIcon fontSize="small" color="inherit" /> },
        skipped: { color: 'default', arrow: <RemoveCircleOutlineIcon fontSize="small" color="inherit" /> },
        incomplete: { color: 'error', arrow: <BlockIcon fontSize="small" color="inherit" /> },
        completed: { color: 'success', arrow: <CheckCircleOutlineIcon fontSize="small" color="inherit" /> }
      };

      if (!name || !(name in dataMap)) return null;
      else return dataMap[name];
    }, [name]);

    return !data ? null : withChip ? (
      <CustomChip
        wrap={false}
        size={size}
        variant="outlined"
        color={data.color}
        label={t(`extended_${name}`)}
        tooltip={t(`extended_${name}_desc`)}
        style={{ cursor: 'inherit' }}
      />
    ) : (
      <Tooltip title={t(`extended_${name}_desc`)}>
        <Box display="inline-block" className={clsx(classes.extended, classes[data.color])}>
          {data.arrow}
        </Box>
      </Tooltip>
    );
  }
);

type AlertPriorityProps = {
  name: string;
  withChip?: boolean;
  size?: CustomChipProps['size'];
};

export const AlertPriority: React.FC<AlertPriorityProps> = React.memo(
  ({ name, withChip = false, size = 'small' }: AlertPriorityProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();

    const data = useMemo<{ color: PossibleColors; arrow: ReactNode }>(() => {
      const dataMap = {
        CRITICAL: { color: 'error', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
        HIGH: { color: 'warning', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
        MEDIUM: { color: 'warning', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
        LOW: { color: 'success', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
        undefined: { color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> },
        null: { color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> }
      };

      if (!name || !(name in dataMap)) return null;
      else return dataMap[name];
    }, [name]);

    return !data ? null : withChip ? (
      <CustomChip
        wrap={false}
        size={size}
        variant="outlined"
        color={data.color}
        label={name ? t(`priority_${name}`) : t('priority_unset')}
        disabled={!name}
      />
    ) : (
      <Tooltip title={name ? `${t('priority')}: ${t(`priority_${name}`)}` : `${t('priority')}: ${t('priority_unset')}`}>
        <Box display="inline-block" className={clsx(classes.priority, classes[data.color])}>
          {data.arrow}
        </Box>
      </Tooltip>
    );
  }
);

type AlertStatusProps = {
  name: string;
  size?: CustomChipProps['size'];
};

export const AlertStatus: React.FC<AlertStatusProps> = React.memo(({ name, size = 'small' }: AlertStatusProps) => {
  const { t } = useTranslation('alerts');

  const data = useMemo<{ color: PossibleColors; arrow: ReactNode }>(() => {
    const dataMap = {
      TRIAGE: 'default',
      MALICIOUS: 'error',
      'NON-MALICIOUS': 'success',
      ASSESS: 'primary'
    };

    if (!name || !(name in dataMap)) return null;
    else return dataMap[name];
  }, [name]);

  return !name ? null : (
    <CustomChip
      wrap={false}
      size={size}
      variant="outlined"
      color={data[name]}
      label={t(`status_${name}`)}
      style={{ cursor: 'inherit' }}
    />
  );
});

type AlertListChipDetailedProps = {
  items: DetailedItem[];
  title: string;
  size?: CustomChipProps['size'];
  variant?: CustomChipProps['variant'];
};

export const AlertListChipDetailed: React.FC<AlertListChipDetailedProps> = React.memo(
  ({ items, title, size = 'small', variant = 'outlined' }: AlertListChipDetailedProps) => {
    const theme = useTheme();

    const hasSuspicious = useMemo<boolean>(() => items && items.some(item => item.verdict === 'suspicious'), [items]);
    const hasMalicious = useMemo<boolean>(() => items && items.some(item => item.verdict === 'malicious'), [items]);

    return !items || items.length === 0 ? null : (
      <CustomChip
        wrap
        size={size}
        variant={variant}
        color={hasMalicious ? 'error' : hasSuspicious ? 'warning' : 'default'}
        label={`${items.length}x ${title}`}
        tooltip={
          items.length > 5
            ? items
                .slice(0, 5)
                .map(item => item.value)
                .join(' | ') + ' ...'
            : items.map(item => item.value).join(' | ')
        }
        style={{
          marginBottom: theme.spacing(0.5),
          marginRight: theme.spacing(1),
          cursor: 'inherit'
        }}
      />
    );
  }
);

type AlertListChipProps = {
  items: string[];
  title: string;
  color?: PossibleColors;
  size?: CustomChipProps['size'];
  variant?: CustomChipProps['variant'];
};

export const AlertListChip: React.FC<AlertListChipProps> = React.memo(
  ({ items, title, color = 'default', size = 'small', variant = 'outlined' }: AlertListChipProps) => {
    const theme = useTheme();

    return !items && items.length === 0 ? null : (
      <CustomChip
        wrap
        size={size}
        variant={variant}
        color={color}
        label={`${items.length}x ${title}`}
        tooltip={items.length > 5 ? items.slice(0, 5).join(' | ') + ' ...' : items.join(' | ')}
        style={{
          marginBottom: theme.spacing(0.5),
          marginRight: theme.spacing(1),
          cursor: 'inherit'
        }}
      />
    );
  }
);

export const SkeletonInline = () => <Skeleton style={{ display: 'inline-block', width: '10rem' }} />;

type AutoHideChipListState = {
  showExtra: boolean;
  fullChipList: ActionableCustomChipProps[];
};

const TARGET_RESULT_COUNT = 10;

type AutoHideChipListProps = {
  items: DetailedItem[];
  defaultClassification: string;
  type?: string;
};

export const AutoHideChipList: React.FC<AutoHideChipListProps> = React.memo(
  ({ items, defaultClassification, type = null }: AutoHideChipListProps) => {
    const { t } = useTranslation();
    const [state, setState] = useState<AutoHideChipListState | null>(null);
    const [shownChips, setShownChips] = useState<ActionableCustomChipProps[]>([]);

    useEffect(() => {
      const fullChipList = items.sort(detailedItemCompare).map(
        item =>
          ({
            category: 'tag',
            data_type: type,
            label: item.subtype ? `${item.value} - ${item.subtype}` : item.value,
            variant: 'outlined',
            color: verdictToColor(item.verdict),
            classification: defaultClassification
          } as ActionableCustomChipProps)
      );
      const showExtra = items.length <= TARGET_RESULT_COUNT;

      setState({ showExtra, fullChipList });
    }, [defaultClassification, items, type]);

    useEffect(() => {
      if (state !== null) {
        if (state.showExtra) {
          setShownChips(state.fullChipList);
        } else {
          setShownChips(state.fullChipList.slice(0, TARGET_RESULT_COUNT));
        }
      }
    }, [state]);

    return (
      <>
        <ActionableChipList items={shownChips} />
        {state && !state.showExtra && (
          <Tooltip title={t('more')}>
            <IconButton size="small" onClick={() => setState({ ...state, showExtra: true })} style={{ padding: 0 }}>
              <MoreHorizOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  }
);

type AlertEventsTableProps = {
  alert: AlertItem;
  viewHistory: boolean;
  setViewHistory: (value: boolean) => void;
};

export const AlertEventsTable: React.FC<AlertEventsTableProps> = React.memo(
  ({ alert, viewHistory, setViewHistory }: AlertEventsTableProps) => {
    const { t, i18n } = useTranslation('alerts');
    const navigate = useNavigate();
    const theme = useTheme();

    return (
      viewHistory && (
        <Dialog
          open={viewHistory}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              setViewHistory(false);
            }
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="xl"
          fullWidth
        >
          <div>
            <IconButton
              style={{ float: 'right', padding: theme.spacing(2) }}
              onClick={() => {
                setViewHistory(false);
              }}
              size="large"
            >
              <CloseOutlinedIcon />
            </IconButton>
            <DialogTitle id="alert-dialog-title">{t('history.events')}</DialogTitle>
            <DialogContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['ts', 'workflow_or_user', 'priority', 'status', 'labels'].map(column => (
                        <TableCell key={column}>
                          <Typography sx={{ fontWeight: 'bold' }}>{t(column)}</Typography>
                        </TableCell>
                      ))}
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alert.events
                      .sort((a, b) => a.ts.localeCompare(b.ts) || b.ts.localeCompare(a.ts))
                      .reverse()
                      .map((event, i) => {
                        return (
                          <TableRow key={`table-row-${i}`} hover tabIndex={-1}>
                            <Tooltip title={event.ts}>
                              <TableCell>
                                <Moment fromNow locale={i18n.language}>
                                  {event.ts}
                                </Moment>
                              </TableCell>
                            </Tooltip>
                            <Tooltip title={event.entity_type} style={{ textTransform: 'capitalize' }}>
                              <TableCell>{event.entity_name}</TableCell>
                            </Tooltip>
                            <TableCell>
                              {event.priority ? <AlertPriority name={event.priority} withChip /> : null}
                            </TableCell>
                            <TableCell>{event.status ? <AlertStatus name={event.status} /> : null}</TableCell>
                            <TableCell width="40%">
                              {event.labels ? (
                                <ChipList items={event.labels.map(label => ({ label, variant: 'outlined' }))} nowrap />
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {event.entity_type === 'workflow' && event.entity_id !== 'DEFAULT' ? (
                                <Tooltip
                                  title={t('workflow')}
                                  onClick={() => {
                                    navigate(`/manage/workflow/${event.entity_id}`);
                                    setViewHistory(false);
                                  }}
                                >
                                  <div>
                                    <HiOutlineExternalLink
                                      style={{
                                        fontSize: 'x-large',
                                        verticalAlign: 'middle',
                                        color: theme.palette.primary.main
                                      }}
                                    />
                                  </div>
                                </Tooltip>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </div>
        </Dialog>
      )
    );
  }
);
