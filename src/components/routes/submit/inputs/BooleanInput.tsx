import type { ListItemButtonProps, TypographyProps } from '@mui/material';
import { Checkbox, ListItemButton, ListItemIcon, ListItemText, Skeleton, useTheme } from '@mui/material';
import React from 'react';

type Props = ListItemButtonProps & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  value: boolean;
};

const WrappedBooleanInput = ({ label, labelProps, loading = false, value, ...other }: Props) => {
  const theme = useTheme();

  return (
    <ListItemButton sx={{ padding: '0px 12px' }} {...other}>
      <ListItemIcon sx={{ minWidth: 0 }}>
        {loading ? (
          <Skeleton
            style={{ height: '2rem', width: '1.5rem', marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
          />
        ) : (
          <Checkbox checked={value} edge="start" size="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={label.replaceAll('_', ' ')}
        style={{ marginRight: theme.spacing(2) }}
        primaryTypographyProps={{ variant: 'body2', whiteSpace: 'nowrap', textTransform: 'capitalize', ...labelProps }}
      />
    </ListItemButton>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
