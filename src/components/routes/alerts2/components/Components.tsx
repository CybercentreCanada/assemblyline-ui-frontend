import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import { Box, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import CustomChip, { CustomChipProps } from 'components/visual/CustomChip';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DetailedItem } from '../models/Alert';

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
