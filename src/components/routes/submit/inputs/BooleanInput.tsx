import ClearIcon from '@mui/icons-material/Clear';
import type { ListItemButtonProps, TypographyProps } from '@mui/material';
import { Checkbox, IconButton, ListItemButton, ListItemIcon, ListItemText, Skeleton, useTheme } from '@mui/material';
import React from 'react';

type Props = ListItemButtonProps & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  value: boolean;
  onReset?: () => void;
};

const WrappedBooleanInput = ({ label, labelProps, loading = false, value, disabled, onReset, ...other }: Props) => {
  const theme = useTheme();

  return (
    <ListItemButton disabled={disabled} sx={{ padding: '0px 12px' }} {...other}>
      <ListItemIcon sx={{ minWidth: 0 }}>
        {loading ? (
          <Skeleton
            style={{ height: '2rem', width: '1.5rem', marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
          />
        ) : (
          <Checkbox checked={value} disabled={disabled} edge="start" size="small" />
        )}
      </ListItemIcon>
      <ListItemText
        style={{ marginRight: theme.spacing(2) }}
        primaryTypographyProps={{
          variant: 'body2',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
          ...labelProps
        }}
        primary={
          <>
            <span>{label.replaceAll('_', ' ')}</span>

            {onReset && !!value && !disabled && (
              <IconButton
                size="small"
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  onReset();
                }}
              >
                <ClearIcon style={{ width: theme.spacing(2.5), height: theme.spacing(2.5) }} />
              </IconButton>
            )}
          </>
        }
      />
    </ListItemButton>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
