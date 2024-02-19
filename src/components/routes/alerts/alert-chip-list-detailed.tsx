import { useTheme } from '@mui/material';
import { DetailedItem } from 'components/models/base/alert';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

type AlertListChipProps = {
  items: DetailedItem[];
  title: string;
  size?: 'tiny' | 'small' | 'medium';
  variant?: 'filled' | 'outlined';
};

const WrappedAlertListChipDetailed: React.FC<AlertListChipProps> = ({
  items,
  title,
  size = 'small',
  variant = 'outlined'
}) => {
  const theme = useTheme();
  const hasSuspicious = items && items.some(element => element.verdict === 'suspicious');
  const hasMalicious = items && items.some(element => element.verdict === 'malicious');
  return items && items.length > 0 ? (
    <CustomChip
      wrap
      size={size}
      variant={variant}
      color={hasMalicious ? 'error' : hasSuspicious ? 'warning' : 'default'}
      label={`${items.length}x ${title}`}
      tooltip={
        items.length > 5
          ? items
              .slice(0, 5)
              .map(item => item.value)
              .join(' | ') + ' ...'
          : items.map(item => item.value).join(' | ')
      }
      style={{
        marginBottom: theme.spacing(0.5),
        marginRight: theme.spacing(1),
        cursor: 'inherit'
      }}
    />
  ) : null;
};

const AlertListChipDetailed = React.memo(WrappedAlertListChipDetailed);
export default AlertListChipDetailed;
