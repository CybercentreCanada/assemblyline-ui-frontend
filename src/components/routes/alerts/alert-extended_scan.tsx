import { Box, makeStyles, Tooltip } from '@material-ui/core';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  extended: {
    '& > svg': {
      verticalAlign: 'bottom'
    }
  }
});

const EXTENDED_MAP = {
  submitted: {
    color: 'inherit',
    chip_color: 'default',
    arrow: <SlowMotionVideoIcon fontSize="small" color="inherit" />
  },
  skipped: {
    color: 'hsl(39, 100%, 40%)',
    chip_color: 'warning',
    arrow: <RemoveCircleOutlineIcon fontSize="small" color="inherit" />
  },
  incomplete: {
    color: 'hsl(0, 100%, 40%)',
    chip_color: 'error',
    arrow: <BlockIcon fontSize="small" color="inherit" />
  },
  completed: {
    color: 'hsl(120, 100%, 30%)',
    chip_color: 'success',
    arrow: <CheckCircleOutlineIcon fontSize="small" color="inherit" />
  }
};

type AlertExtendedScanProps = {
  name: string;
  withChip?: boolean;
  size?: 'tiny' | 'small' | 'medium';
};

const WrappedAlertExtendedScan: React.FC<AlertExtendedScanProps> = ({ name, withChip = false, size = 'small' }) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();

  if (name === null || name === undefined) {
    return null;
  }

  const extendedData = EXTENDED_MAP[name];

  return withChip ? (
    <CustomChip
      wrap
      size={size}
      variant="outlined"
      color={extendedData.chip_color}
      label={t(`extended_${name}`)}
      icon={extendedData.arrow}
      tooltip={t(`extended_${name}_desc`)}
    />
  ) : (
    <Tooltip title={t(`extended_${name}_desc`)}>
      <Box style={{ color: extendedData.color }} display="inline-block" className={classes.extended}>
        {extendedData.arrow}
      </Box>
    </Tooltip>
  );
};

const AlertExtendedScan = React.memo(WrappedAlertExtendedScan);
export default AlertExtendedScan;
