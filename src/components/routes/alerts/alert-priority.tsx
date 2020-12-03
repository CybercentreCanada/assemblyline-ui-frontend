import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

const useStyles = makeStyles({
  priority: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  }
});

const COLOR_MAP = {
  CRITICAL: { color: 'hsl(0, 100%, 50%)', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
  HIGH: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowUpwardIcon fontSize="small" color="inherit" /> },
  MEDIUM: { color: 'hsl(39, 100%, 50%)', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> },
  LOW: { color: 'hsl(120, 100%, 25%)', arrow: <ArrowDownwardIcon fontSize="small" color="inherit" /> }
};

const AlertPriority = ({ name, withText = false, withChip = false }) => {
  const theme = useTheme();
  const classes = useStyles();
  return name ? (
    withChip ? (
      <CustomChip
        size="small"
        label={name}
        icon={COLOR_MAP[name].arrow}
        style={{ backgroundColor: COLOR_MAP[name].color, color: theme.palette.getContrastText(COLOR_MAP[name].color) }}
      />
    ) : (
      <Box style={{ color: COLOR_MAP[name].color }} display="inline-block" className={classes.priority}>
        {COLOR_MAP[name].arrow} {withText ? <Typography>{name}</Typography> : ''}
      </Box>
    )
  ) : null;
};

export default AlertPriority;
