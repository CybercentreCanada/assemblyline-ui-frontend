import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  endAdornment?: ReactNode;
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  max?: number;
  min?: number;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedNumberInput = ({
  disabled = false,
  endAdornment,
  error = () => null,
  errorProps = null,
  id = null,
  label,
  labelProps,
  loading = false,
  max,
  min,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  reset = false,
  resetProps = null,
  tooltip,
  tooltipProps,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: Props) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id || label}
          color={!disabled && errorValue ? 'error' : 'textSecondary'}
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
            error={!!errorValue}
            helperText={errorValue}
            FormHelperTextProps={errorProps}
            {...(readOnly && {
              focused: null,
              sx: {
                '& .MuiInputBase-input': { cursor: 'default' },
                '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)'
                }
              }
            })}
            inputProps={{ min: min, max: max }}
            InputProps={{
              readOnly: readOnly,
              sx: { paddingRight: '9px' },
              endAdornment: (
                <>
                  {loading || !reset || disabled || readOnly ? null : (
                    <InputAdornment position="end">
                      <ResetInput
                        id={id || label}
                        preventRender={loading || !reset || disabled || readOnly}
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

              const err = error(num);
              if (err) onError(err);
            }}
            {...textFieldProps}
          />
        )}
      </FormControl>
    </div>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
