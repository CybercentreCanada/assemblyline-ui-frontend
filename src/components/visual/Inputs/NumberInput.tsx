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

type Props = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
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
  tooltip,
  tooltipProps,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: Props) => {
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div style={{ textAlign: 'left' }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id || label}
          color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
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
            value={value?.toString() || ''}
            disabled={disabled}
            error={!!errorValue}
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
            {...(readOnly &&
              !disabled && {
                focused: null,
                sx: {
                  '& .MuiInputBase-input': { cursor: 'default' },
                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  }
                }
              })}
            inputProps={{ min: min, max: max }}
            InputProps={{
              placeholder: placeholder,
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
                  {endAdornment && (
                    <InputAdornment position="end" sx={{ marginRight: `-7px` }}>
                      {endAdornment}
                    </InputAdornment>
                  )}
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
            {...textFieldProps}
          />
        )}
      </FormControl>
    </div>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
