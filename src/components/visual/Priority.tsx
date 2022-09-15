import { Tooltip } from '@material-ui/core';
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
      text: t('priority.userlow'),
      color: 'default' as 'default'
    },
    'user-medium': {
      text: t('priority.usermedium'),
      color: 'primary' as 'primary'
    },
    'user-high': {
      text: t('priority.userhigh'),
      color: 'warning' as 'warning'
    },
    critical: {
      text: t('priority.critical'),
      color: 'error' as 'error'
    },
    high: {
      text: t('priority.high'),
      color: 'warning' as 'warning'
    },
    medium: {
      text: t('priority.medium'),
      color: 'primary' as 'primary'
    },
    low: {
      text: t('priority.low'),
      color: 'default' as 'default'
    }
  };

  const { text, color } = PRIORITY_MAP[priorityText(priority)];

  return (
    <Tooltip title={`${text} [Priority: ${priority}]`}>
      <span>
        <CustomChip variant="outlined" size={size} label={text} color={color} />
      </span>
    </Tooltip>
  );
};

const Priority = React.memo(WrappedPriority);
export default Priority;
