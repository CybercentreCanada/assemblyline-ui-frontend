import type { ListItemTextProps, OutlinedInputProps, TypographyProps } from '@mui/material';
import { InputAdornment, ListItem, OutlinedInput, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

type Props = Omit<OutlinedInputProps, ''> & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  primaryProps?: TypographyProps;
  min?: number;
  max?: number;
  capitalize?: boolean;
  endAdornment?: ReactNode;
  loading?: boolean;
};

const WrappedNumberInput = ({
  primary,
  secondary,
  primaryProps = null,
  min,
  max,
  endAdornment,
  loading = false,
  disabled = false,
  capitalize = false,
  ...other
}: Props) => {
  return (
    <ListItem disabled={disabled} sx={{ justifyContent: 'space-between' }}>
      <div>
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

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
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
