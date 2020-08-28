import { Box, Chip, makeStyles, Typography, useTheme } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React from 'react';

const COLOR_MAP = {
  CRITICAL: { color: 'hsl(0, 100%, 50%)', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
  HIGH: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
  MEDIUM: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
  LOW: { color: 'hsl(120, 100%, 25%)', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> }
};

const AlertPriority = ({ name, withText = false, withChip = false }) => {
  const theme = useTheme();
  const { color, arrow } = COLOR_MAP[name];
  const { icon } = makeStyles({ icon: { color: theme.palette.getContrastText(color) } })();
  if (withChip) {
    return (
      <Chip
        classes={{ icon }}
        size="small"
        label={name}
        icon={arrow}
        style={{ backgroundColor: color, color: theme.palette.getContrastText(color) }}
      />
    );
  }
  return (
    <Box style={{ color }} display="inline-flex">
      {arrow} {withText ? <Typography>{name}</Typography> : ''}
    </Box>
  );
};

export default AlertPriority;
