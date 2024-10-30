import type { OutlinedInputProps, TypographyProps } from '@mui/material';
import { InputAdornment, OutlinedInput, Skeleton, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

type Props = Omit<OutlinedInputProps, ''> & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  min?: number;
  max?: number;
  endAdornment?: ReactNode;
};

const WrappedNumberInput = ({ label, labelProps, loading = false, min, max, endAdornment, ...other }: Props) => {
  const theme = useTheme();

  return (
    <div style={{ margin: `${theme.spacing(1)} 0px` }}>
      {label && (
        <Typography
          color="textSecondary"
          variant="caption"
          whiteSpace="nowrap"
          textTransform="capitalize"
          gutterBottom
          {...labelProps}
          children={label.replaceAll('_', ' ')}
        />
      )}
      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
          inputProps={{ min: min, max: max }}
          endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
          {...other}
        />
      )}
    </div>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
