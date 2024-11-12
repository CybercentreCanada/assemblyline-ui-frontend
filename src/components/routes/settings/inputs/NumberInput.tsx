import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemTextProps, OutlinedInputProps, TypographyProps } from '@mui/material';
import { IconButton, InputAdornment, ListItem, OutlinedInput, Skeleton, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

type Props = Omit<OutlinedInputProps, 'value'> & {
  capitalize?: boolean;
  defaultValue?: number;
  endAdornment?: ReactNode;
  loading?: boolean;
  max?: number;
  min?: number;
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  secondary?: ListItemTextProps['secondary'];
  value: number;
  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberInput = ({
  capitalize = false,
  defaultValue = null,
  disabled = false,
  endAdornment,
  loading = false,
  max,
  min,
  primary,
  primaryProps = null,
  secondary,
  value = null,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  return (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5) }}>
      <div style={{ flex: 1 }}>
        {primary && (
          <Typography
            color="textPrimary"
            variant="body1"
            whiteSpace="nowrap"
            textTransform={capitalize ? 'capitalize' : null}
            children={primary}
            {...primaryProps}
          />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      <div style={{ ...((defaultValue === null || value === defaultValue) && { opacity: 0 }) }}>
        <IconButton
          color="primary"
          children={<RefreshIcon fontSize="small" />}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onReset(event);
          }}
        />
      </div>

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
          value={value}
          disabled={disabled}
          sx={{ maxWidth: '30%' }}
          inputProps={{ min: min, max: max }}
          endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
          {...other}
        />
      )}
    </ListItem>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
