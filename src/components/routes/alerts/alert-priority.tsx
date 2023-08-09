import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import { Box, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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
    color: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
  },
  default: {
    color: theme.palette.mode !== 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
  },
  warning: {
    color: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
  },
  error: {
    color: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
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
      wrap={false}
      size={size}
      variant="outlined"
      color={priorityData.color}
      label={name ? t(`priority_${name}`) : t('priority_unset')}
      disabled={!name}
    />
  ) : (
    <Tooltip title={name ? `${t('priority')}: ${t(`priority_${name}`)}` : `${t('priority')}: ${t('priority_unset')}`}>
      <Box display="inline-block" className={clsx(classes.priority, classes[priorityData.color])}>
        {priorityData.arrow}
      </Box>
    </Tooltip>
  );
};

const AlertPriority = React.memo(WrappedAlertPriority);
export default AlertPriority;
