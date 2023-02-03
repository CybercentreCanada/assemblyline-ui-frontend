import { Tooltip } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import TimerIcon from '@mui/icons-material/Timer';
import React from 'react';
import { useTranslation } from 'react-i18next';

const STATE_ICON_MAP = {
  incomplete: <ClearIcon color="error" />,
  completed: <DoneIcon color="primary" />,
  submitted: <TimerIcon color="secondary" />,
  skipped: <BlockIcon color="action" />
};

type ExtendedScanProps = {
  state: string;
  error_count?: number;
};

const WrappedExtendedScan: React.FC<ExtendedScanProps> = ({ state }) => {
  const { t } = useTranslation();
  const icon = STATE_ICON_MAP[state];

  return <Tooltip title={t(`extended_scan.${state}`)}>{icon}</Tooltip>;
};

const ExtendedScan = React.memo(WrappedExtendedScan);
export default ExtendedScan;
