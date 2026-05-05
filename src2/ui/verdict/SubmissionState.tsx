import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import UpdateIcon from '@mui/icons-material/Update';
import { Tooltip } from '@mui/material';
import { memo, useMemo } from 'react';
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

export const SubmissionState = memo(({ state, error_count = 0 }: SubmissionStateProps) => {
  const { t } = useTranslation();
  const curState = useMemo(() => (error_count !== 0 ? 'error' : state), [error_count, state]);
  const icon = useMemo(() => STATE_ICON_MAP[curState], [curState]);

  return <Tooltip title={t(`submission.state.${curState}`)}>{icon}</Tooltip>;
});

SubmissionState.displayName = 'SubmissionState';
