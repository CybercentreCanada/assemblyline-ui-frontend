import type { IconButtonProps, OutlinedInputProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, OutlinedInput, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<OutlinedInputProps, 'value' | 'onChange'> & {
  endAdornment?: ReactNode;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  max?: number;
  min?: number;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  value: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberInput = ({
  disabled = false,
  endAdornment,
  label,
  labelProps,
  loading = false,
  max,
  min,
  preventRender = false,
  reset = false,
  resetProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  ...other
}: Props) =>
  preventRender ? null : (
    <div>
      <Typography
        component={InputLabel}
        htmlFor={label}
        variant="body2"
        whiteSpace="nowrap"
        gutterBottom
        {...labelProps}
        children={label}
      />
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <OutlinedInput
            id={label}
            type="number"
            margin="dense"
            size="small"
            fullWidth
            value={value?.toString()}
            disabled={disabled}
            inputProps={{ min: min, max: max }}
            onChange={event => {
              let num = Number(event.target.value);
              num = max ? Math.min(num, max) : num;
              num = min ? Math.max(num, min) : num;
              onChange(event, num);
            }}
            endAdornment={
              <>
                {!reset ? null : (
                  <InputAdornment position="end">
                    <ResetInput label={label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
                  </InputAdornment>
                )}
                {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
              </>
            }
            {...other}
          />
        )}
      </FormControl>
    </div>
  );

export const NumberInput = React.memo(WrappedNumberInput);
