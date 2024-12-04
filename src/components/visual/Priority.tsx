import { Tooltip } from '@mui/material';
import CustomChip from 'components/visual/CustomChip';
import { priorityText } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

type PriorityProps = {
  priority: number;
  size?: 'tiny' | 'small' | 'medium';
};

const WrappedPriority: React.FC<PriorityProps> = ({ priority, size = 'tiny' }) => {
  const { t } = useTranslation();

  const PRIORITY_MAP = {
    'user-low': {
      tooltip: t('priority.userlow'),
      text: t('priority.low'),
      color: 'default' as 'default'
    },
    'user-medium': {
      tooltip: t('priority.usermedium'),
      text: t('priority.medium'),
      color: 'primary' as 'primary'
    },
    'user-high': {
      tooltip: t('priority.userhigh'),
      text: t('priority.high'),
      color: 'warning' as 'warning'
    },
    critical: {
      tooltip: t('priority.critical'),
      text: t('priority.critical'),
      color: 'error' as 'error'
    },
    high: {
      tooltip: t('priority.high'),
      text: t('priority.high'),
      color: 'warning' as 'warning'
    },
    medium: {
      tooltip: t('priority.medium'),
      text: t('priority.medium'),
      color: 'primary' as 'primary'
    },
    low: {
      tooltip: t('priority.low'),
      text: t('priority.low'),
      color: 'default' as 'default'
    }
  };

  const { tooltip, text, color } = PRIORITY_MAP[priorityText(priority)];

  return (
    <Tooltip title={`${tooltip} [Priority: ${priority}]`}>
      <span>
        <CustomChip variant="outlined" size={size} label={text} color={color} />
      </span>
    </Tooltip>
  );
};

const Priority = React.memo(WrappedPriority);
export default Priority;
