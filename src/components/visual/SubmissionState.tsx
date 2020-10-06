import { Tooltip } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import UpdateIcon from '@material-ui/icons/Update';
import React from 'react';
import { useTranslation } from 'react-i18next';

const STATE_ICON_MAP = {
  error: <ClearIcon color="error" />,
  completed: <DoneIcon color="primary" />,
  submitted: <UpdateIcon color="action" />
};

type SubmissionStateProps = {
  state: string;
  error_count?: number;
};

const SubmissionState: React.FC<SubmissionStateProps> = ({ state, error_count = 0 }) => {
  const { t } = useTranslation();
  const curState = error_count !== 0 ? 'error' : state;
  const icon = STATE_ICON_MAP[curState];

  return <Tooltip title={t(`submission.state.${curState}`)}>{icon}</Tooltip>;
};

export default SubmissionState;
