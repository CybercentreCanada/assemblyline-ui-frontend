import type { IconButtonProps, OutlinedInputProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, OutlinedInput, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';
import { TooltipInput } from './components/TooltipInput';

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
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberInput = ({
  disabled = false,
  endAdornment,
  id = null,
  label,
  labelProps,
  loading = false,
  max,
  min,
  preventRender = false,
  reset = false,
  resetProps = null,
  tooltip,
  tooltipProps,
  value,
  onChange = () => null,
  onReset = () => null,
  ...other
}: Props) =>
  preventRender ? null : (
    <div>
      <TooltipInput tooltip={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id || label}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          {...labelProps}
          children={label}
        />
      </TooltipInput>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <OutlinedInput
            id={id || label}
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
                    <ResetInput id={id || label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
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
