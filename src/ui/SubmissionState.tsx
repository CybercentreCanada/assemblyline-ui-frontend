import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import UpdateIcon from '@mui/icons-material/Update';
import { Tooltip } from '@mui/material';
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

const WrappedSubmissionState: React.FC<SubmissionStateProps> = ({ state, error_count = 0 }) => {
  const { t } = useTranslation();
  const curState = error_count !== 0 ? 'error' : state;
  const icon = STATE_ICON_MAP[curState];

  return <Tooltip title={t(`submission.state.${curState}`)}>{icon}</Tooltip>;
};

const SubmissionState = React.memo(WrappedSubmissionState);
export default SubmissionState;
