import { useTheme } from '@material-ui/core';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import React from 'react';

type AlertListChipProps = {
  items: string[];
  title: string;
  color?: PossibleColors;
  size?: 'tiny' | 'small' | 'medium';
  variant?: 'default' | 'outlined';
};

const WrappedAlertListChip: React.FC<AlertListChipProps> = ({
  items,
  title,
  color = 'default',
  size = 'small',
  variant = 'outlined'
}) => {
  const theme = useTheme();
  return (
    items &&
    items.length > 0 && (
      <CustomChip
        wrap
        size={size}
        variant={variant}
        color={color}
        label={`${items.length}x ${title}`}
        tooltip={items.join(' | ')}
        style={{
          marginBottom: theme.spacing(0.5),
          marginRight: theme.spacing(1),
          cursor: 'inherit'
        }}
      />
    )
  );
};

const AlertListChip = React.memo(WrappedAlertListChip);
export default AlertListChip;
