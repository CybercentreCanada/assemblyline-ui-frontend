import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

export type NumberInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  max?: number;
  min?: number;
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  startAdornment?: TextFieldProps['InputProps']['startAdornment'];
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedNumberInput = ({
  disabled = false,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  helperText = null,
  helperTextProps = null,
  id = null,
  label,
  labelProps,
  loading = false,
  max,
  min,
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  reset = false,
  resetProps = null,
  startAdornment = null,
  tiny = false,
  tooltip,
  tooltipProps,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: NumberInputProps) => {
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div style={{ textAlign: 'left' }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
          component={InputLabel}
          gutterBottom
          htmlFor={id || label}
          variant="body2"
          whiteSpace="nowrap"
          {...labelProps}
          children={label}
          sx={{
            ...labelProps?.sx,
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
        />
      </Tooltip>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
        ) : (
          <TextField
            id={id || label}
            type="number"
            size="small"
            fullWidth
            value={value?.toString() || ''}
            disabled={disabled}
            error={!!errorValue}
            {...(readOnly && !disabled && { focused: null })}
            helperText={disabled ? null : errorValue || helperText}
            FormHelperTextProps={
              disabled
                ? null
                : errorValue
                ? { variant: 'outlined', sx: { color: theme.palette.error.main, ...errorProps?.sx }, ...errorProps }
                : helperText
                ? {
                    variant: 'outlined',
                    sx: { color: theme.palette.text.secondary, ...helperTextProps?.sx },
                    ...errorProps
                  }
                : null
            }
            inputProps={{ min: min, max: max, ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } }) }}
            InputProps={{
              placeholder: placeholder,
              readOnly: readOnly,
              sx: { paddingRight: '9px', ...(tiny && { '& .MuiInputBase-root': { padding: '0px !important' } }) },
              startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
              endAdornment: (
                <>
                  {loading || !reset || disabled || readOnly ? null : (
                    <InputAdornment position="end">
                      <ResetInput
                        id={id || label}
                        preventRender={loading || !reset || disabled || readOnly}
                        tiny={tiny}
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
            onFocus={event => setFocused(document.activeElement === event.target)}
            onBlur={() => setFocused(false)}
            sx={{
              ...(readOnly &&
                !disabled && {
                  '& .MuiInputBase-input': { cursor: 'default' },
                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  }
                })
            }}
            {...textFieldProps}
          />
        )}
      </FormControl>
    </div>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
