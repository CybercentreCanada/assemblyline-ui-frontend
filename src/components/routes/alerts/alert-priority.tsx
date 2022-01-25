import { Box, makeStyles, Tooltip } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import clsx from 'clsx';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  priority: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  },
  success: {
    color: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
  },
  default: {
    color: theme.palette.type !== 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
  },
  warning: {
    color: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
  },
  error: {
    color: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
  }
}));

const COLOR_MAP = {
  CRITICAL: {
    color: 'error',
    arrow: <ArrowUpwardIcon fontSize="small" color="inherit" />
  },
  HIGH: {
    color: 'warning',
    arrow: <ArrowUpwardIcon fontSize="small" color="inherit" />
  },
  MEDIUM: {
    color: 'warning',
    arrow: <ArrowDownwardIcon fontSize="small" color="inherit" />
  },
  LOW: {
    color: 'success',
    arrow: <ArrowDownwardIcon fontSize="small" color="inherit" />
  },
  undefined: {
    color: 'default',
    arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" />
  },
  null: { color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> }
};

type AlertPriorityProps = {
  name: string;
  withChip?: boolean;
  size?: 'tiny' | 'small' | 'medium';
};

const WrappedAlertPriority: React.FC<AlertPriorityProps> = ({ name, withChip = false, size = 'small' }) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();

  const priorityData = COLOR_MAP[name];
  return withChip ? (
    <CustomChip
      wrap
      size={size}
      variant="outlined"
      color={priorityData.color}
      label={name ? t(`priority_${name}`) : t('priority_unset')}
      icon={priorityData.arrow}
    />
  ) : (
    <Tooltip title={name ? t(`priority_${name}`) : t('priority_unset')}>
      <Box display="inline-block" className={clsx(classes.priority, classes[priorityData.color])}>
        {priorityData.arrow}
      </Box>
    </Tooltip>
  );
};

const AlertPriority = React.memo(WrappedAlertPriority);
export default AlertPriority;
