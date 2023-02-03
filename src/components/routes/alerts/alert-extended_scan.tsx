import { Box, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import clsx from 'clsx';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  extended: {
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
  error: {
    color: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
  }
}));

const EXTENDED_MAP = {
  submitted: {
    color: 'info',
    arrow: <SlowMotionVideoIcon fontSize="small" color="inherit" />
  },
  skipped: {
    color: 'default',
    arrow: <RemoveCircleOutlineIcon fontSize="small" color="inherit" />
  },
  incomplete: {
    color: 'error',
    arrow: <BlockIcon fontSize="small" color="inherit" />
  },
  completed: {
    color: 'success',
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
      color={extendedData.color}
      label={t(`extended_${name}`)}
      tooltip={t(`extended_${name}_desc`)}
      style={{ cursor: 'inherit' }}
    />
  ) : (
    <Tooltip title={t(`extended_${name}_desc`)}>
      <Box display="inline-block" className={clsx(classes.extended, classes[extendedData.color])}>
        {extendedData.arrow}
      </Box>
    </Tooltip>
  );
};

const AlertExtendedScan = React.memo(WrappedAlertExtendedScan);
export default AlertExtendedScan;
