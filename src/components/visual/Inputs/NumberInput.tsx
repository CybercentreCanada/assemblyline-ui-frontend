import type { IconButtonProps, TextFieldProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import type { ReactNode } from 'react';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  endAdornment?: ReactNode;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  max?: number;
  min?: number;
  preventDisabledColor?: boolean;
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
  preventDisabledColor = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  tooltip,
  tooltipProps,
  value,
  onChange = () => null,
  onReset = () => null,
  ...textFieldProps
}: Props) => {
  const theme = useTheme();

  return preventRender ? null : (
    <div>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id || label}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          sx={{
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
          {...labelProps}
          children={label}
        />
      </Tooltip>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <TextField
            id={id || label}
            type="number"
            size="small"
            fullWidth
            value={value?.toString()}
            disabled={disabled}
            inputProps={{ min: min, max: max }}
            InputProps={{
              sx: { paddingRight: '9px' },
              endAdornment: (
                <>
                  {!reset ? null : (
                    <InputAdornment position="end">
                      <ResetInput
                        id={id || label}
                        preventRender={!reset || disabled}
                        onReset={onReset}
                        {...resetProps}
                      />
                    </InputAdornment>
                  )}
                  {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
                </>
              )
            }}
            onChange={event => {
              let num = Number(event.target.value);
              num = max ? Math.min(num, max) : num;
              num = min ? Math.max(num, min) : num;
              onChange(event, num);
            }}
            {...textFieldProps}
          />
        )}
      </FormControl>
    </div>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
