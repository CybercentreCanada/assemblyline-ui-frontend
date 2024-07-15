import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import type { TableRowProps } from '@mui/material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  TableContainer,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import type { AlertItem, DetailedItem } from 'components/routes/alerts/models/Alert';
import { detailedItemCompare } from 'components/routes/alerts/utils/alertUtils';
import { ActionableChipList } from 'components/visual/ActionableChipList';
import type { ActionableCustomChipProps } from 'components/visual/ActionableCustomChip';
import type { CustomChipProps } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import {
  GridLinkRow,
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableRow
} from 'components/visual/GridTable';
import Moment from 'components/visual/Moment';
import { verdictToColor } from 'helpers/utils';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import type { To } from 'react-router';

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
      const dataMap: Record<string, { color: PossibleColors; arrow: ReactNode }> = {
        submitted: { color: 'info', arrow: <SlowMotionVideoIcon fontSize="small" color="inherit" /> },
        skipped: { color: 'default', arrow: <RemoveCircleOutlineIcon fontSize="small" color="inherit" /> },
        incomplete: { color: 'error', arrow: <BlockIcon fontSize="small" color="inherit" /> },
        completed: { color: 'success', arrow: <CheckCircleOutlineIcon fontSize="small" color="inherit" /> }
      };

      return name && name in dataMap ? dataMap[name] : null;
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
        <Box display="inline-block" className={clsx(classes.extended, classes[data.color] as unknown)}>
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
      const dataMap: Record<string, { color: PossibleColors; arrow: ReactNode }> = {
        CRITICAL: { color: 'error', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
        HIGH: { color: 'warning', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
        MEDIUM: { color: 'warning', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
        LOW: { color: 'success', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
        undefined: { color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> },
        null: { color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> }
      };

      return name && name in dataMap ? dataMap[name] : null;
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
        <Box display="inline-block" className={clsx(classes.priority, classes[data.color] as unknown)}>
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

  const data = useMemo<PossibleColors>(() => {
    const dataMap: Record<string, PossibleColors> = {
      TRIAGE: 'default',
      MALICIOUS: 'error',
      'NON-MALICIOUS': 'success',
      ASSESS: 'primary'
    };

    return name && name in dataMap ? dataMap[name] : null;
  }, [name]);

  return !name ? null : (
    <CustomChip
      wrap={false}
      size={size}
      variant="outlined"
      color={data}
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

interface WrapperTableRowProps extends TableRowProps {
  to: To;
}

type AlertEventsTableProps = {
  alert: AlertItem;
  viewHistory: boolean;
  setViewHistory: (value: boolean) => void;
};

export const AlertEventsTable: React.FC<AlertEventsTableProps> = React.memo(
  ({ alert, viewHistory, setViewHistory }: AlertEventsTableProps) => {
    const { t } = useTranslation('alerts');
    const theme = useTheme();

    const Row = useCallback<React.FC<WrapperTableRowProps>>(
      ({ to, children, ...others }) =>
        to ? (
          <GridLinkRow to={to} onClick={() => setViewHistory(false)} {...others}>
            {children}
          </GridLinkRow>
        ) : (
          <GridTableRow {...others}>{children}</GridTableRow>
        ),
      [setViewHistory]
    );

    return (
      viewHistory && (
        <Dialog
          open={viewHistory}
          onClose={(_event, reason) => {
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
              <TableContainer sx={{ borderRadius: theme.spacing(0.5), border: `1px solid ${theme.palette.divider}` }}>
                <GridTable columns={6} size="small">
                  <GridTableHead>
                    <GridTableRow>
                      {['ts', 'workflow_or_user', 'priority', 'status', 'labels'].map(column => (
                        <GridTableCell key={column}>
                          <Typography sx={{ fontWeight: 'bold' }}>{t(column)}</Typography>
                        </GridTableCell>
                      ))}
                      <GridTableCell />
                    </GridTableRow>
                  </GridTableHead>
                  <GridTableBody>
                    {alert.events
                      .sort((a, b) => a.ts.localeCompare(b.ts) || b.ts.localeCompare(a.ts))
                      .reverse()
                      .map((event, i) => {
                        return (
                          <Row
                            key={`GridTable-row-${i}`}
                            hover
                            tabIndex={-1}
                            to={
                              event.entity_type === 'workflow' && event.entity_id !== 'DEFAULT'
                                ? `/manage/workflow/${event.entity_id}`
                                : null
                            }
                          >
                            <GridTableCell>
                              <Tooltip title={event.ts}>
                                <span>
                                  <Moment variant="fromNow">{event.ts}</Moment>
                                </span>
                              </Tooltip>
                            </GridTableCell>
                            <GridTableCell>
                              <Tooltip title={event.entity_type} style={{ textTransform: 'capitalize' }}>
                                <span>{event.entity_name}</span>
                              </Tooltip>
                            </GridTableCell>
                            <GridTableCell>
                              {event.priority ? <AlertPriority name={event.priority} withChip /> : null}
                            </GridTableCell>
                            <GridTableCell>{event.status ? <AlertStatus name={event.status} /> : null}</GridTableCell>
                            <GridTableCell
                              width="40%"
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                rowGap: theme.spacing(1),
                                columnGap: theme.spacing(0.5)
                              }}
                            >
                              {event.labels || event.labels_removed
                                ? [...event.labels, ...event.labels_removed].map((label, j) => (
                                    <CustomChip
                                      key={`labels-${j}`}
                                      wrap={false}
                                      size="small"
                                      variant="outlined"
                                      color={[...event.labels].includes(label) ? 'success' : 'error'}
                                      label={t(`status_${label}`)}
                                      style={{ cursor: 'inherit' }}
                                    />
                                  ))
                                : null}
                            </GridTableCell>
                            <GridTableCell>
                              {event.entity_type === 'workflow' && event.entity_id !== 'DEFAULT' ? (
                                <Tooltip title={t('workflow')}>
                                  <span>
                                    <HiOutlineExternalLink
                                      style={{
                                        fontSize: 'x-large',
                                        verticalAlign: 'middle',
                                        color: theme.palette.primary.main
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              ) : null}
                            </GridTableCell>
                          </Row>
                        );
                      })}
                  </GridTableBody>
                </GridTable>
              </TableContainer>
            </DialogContent>
          </div>
        </Dialog>
      )
    );
  }
);
