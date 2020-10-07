import { Tooltip } from '@material-ui/core';
import BlockIcon from '@material-ui/icons/Block';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import TimerIcon from '@material-ui/icons/Timer';
import React from 'react';
import { useTranslation } from 'react-i18next';

const STATE_ICON_MAP = {
  incomplete: <ClearIcon color="error" />,
  completed: <DoneIcon color="primary" />,
  submitted: <TimerIcon color="action" />,
  skipped: <BlockIcon color="action" />
};

type ExtendedScanProps = {
  state: string;
  error_count?: number;
};

const ExtendedScan: React.FC<ExtendedScanProps> = ({ state }) => {
  const { t } = useTranslation();
  const icon = STATE_ICON_MAP[state];

  return <Tooltip title={t(`extended_scan.${state}`)}>{icon}</Tooltip>;
};

export default ExtendedScan;
