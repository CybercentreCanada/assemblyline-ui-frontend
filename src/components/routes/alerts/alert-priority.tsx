import { Box, makeStyles, Typography } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  priority: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  }
});

const COLOR_MAP = {
  CRITICAL: {
    color: 'hsl(0, 100%, 40%)',
    chip_color: 'error',
    arrow: <ArrowUpwardIcon fontSize="small" color="inherit" />
  },
  HIGH: {
    color: 'hsl(39, 100%, 40%)',
    chip_color: 'warning',
    arrow: <ArrowUpwardIcon fontSize="small" color="inherit" />
  },
  MEDIUM: {
    color: 'hsl(39, 100%, 40%)',
    chip_color: 'warning',
    arrow: <ArrowDownwardIcon fontSize="small" color="inherit" />
  },
  LOW: {
    color: 'hsl(120, 100%, 30%)',
    chip_color: 'success',
    arrow: <ArrowDownwardIcon fontSize="small" color="inherit" />
  },
  undefined: {
    color: 'inherit',
    chip_color: 'default',
    arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" />
  },
  null: { color: 'inherit', chip_color: 'default', arrow: <RemoveOutlinedIcon fontSize="small" color="inherit" /> }
};

type AlertPriorityProps = {
  name: string;
  withText?: boolean;
  withChip?: boolean;
  size?: 'tiny' | 'small' | 'medium';
};

const WrappedAlertPriority: React.FC<AlertPriorityProps> = ({
  name,
  withText = false,
  withChip = false,
  size = 'small'
}) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  return withChip ? (
    <CustomChip
      wrap
      size={size}
      variant="outlined"
      color={COLOR_MAP[name].chip_color}
      label={name ? t(`priority_${name}`) : t('priority_unset')}
      icon={COLOR_MAP[name].arrow}
    />
  ) : (
    <Box style={{ color: COLOR_MAP[name].color }} display="inline-block" className={classes.priority}>
      {COLOR_MAP[name].arrow}{' '}
      {withText ? <Typography>{name ? t(`priority_${name}`) : t('priority_unset')}</Typography> : ''}
    </Box>
  );
};

const AlertPriority = React.memo(WrappedAlertPriority);
export default AlertPriority;
