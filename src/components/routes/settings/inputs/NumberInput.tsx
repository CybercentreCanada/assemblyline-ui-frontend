import type { ListItemTextProps, OutlinedInputProps } from '@mui/material';
import { InputAdornment, ListItem, OutlinedInput, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

type Props = Omit<OutlinedInputProps, ''> & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  min?: number;
  max?: number;
  capitalize?: boolean;
  endAdornment?: ReactNode;
  loading?: boolean;
};

const WrappedNumberInput = ({
  primary,
  secondary,
  min,
  max,
  endAdornment,
  loading = false,
  capitalize = false,
  ...other
}: Props) => {
  return (
    <ListItem sx={{ justifyContent: 'space-between' }}>
      <div>
        {primary && (
          <Typography
            color="textPrimary"
            variant="body1"
            whiteSpace="nowrap"
            textTransform={capitalize ? 'capitalize' : null}
            children={primary}
          />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
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
