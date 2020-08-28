import { Box, Chip, makeStyles } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React from 'react';

const useStyles = makeStyles(theme => ({
  icon: {
    color: 'orange'
  }
}));

const COLOR_MAP = {
  CRITICAL: { color: 'hsl(0, 100%, 50%)', arrow: <ArrowUpwardIcon color="inherit" /> },
  HIGH: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowUpwardIcon color="inherit" /> },
  MEDIUM: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowDownwardIcon color="inherit" /> },
  LOW: { color: 'hsl(120, 100%, 25%)', arrow: <ArrowDownwardIcon color="inherit" /> }
  // CRITICAL: { color: 'hsl(0, 100%, 50%)', arrow: <ArrowUpwardIcon /> },
  // HIGH: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowUpwardIcon /> },
  // MEDIUM: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowDownwardIcon /> },
  // LOW: { color: 'hsl(120, 100%, 25%)', arrow: <ArrowDownwardIcon /> }
};

const AlertPriority = ({ name, withText = false }) => {
  const { color, arrow } = COLOR_MAP[name];
  const { icon } = makeStyles({ icon: { color } })();
  if (withText) {
    return <Chip classes={{ icon }} size="small" label={name} icon={arrow} />;
  }
  return (
    <Box style={{ color }} display="inline-flex">
      {arrow}
    </Box>
  );
};

export default AlertPriority;
