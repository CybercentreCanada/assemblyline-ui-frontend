import type {
  FormHelperTextProps,
  IconButtonProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SelectProps, 'error' | 'value' | 'onChange'> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: string;
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSelectInput = ({
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  hasEmpty = false,
  helperText = null,
  helperTextProps = null,
  id = null,
  label,
  labelProps,
  loading = false,
  options = [],
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  reset = false,
  resetProps = null,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...selectProps
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
      <FormControl
        fullWidth
        error={!!errorValue}
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
      >
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <Select
            disabled={disabled}
            displayEmpty
            fullWidth
            placeholder={placeholder}
            readOnly={readOnly}
            size="small"
            value={options.some(o => o.value === value) ? value : ''}
            variant="outlined"
            inputProps={{ id: id || label }}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => {
              const v = event.target.value as string;
              onChange(event, v);

              const err = error(v);
              if (err) onError(err);
            }}
            onFocus={event => setFocused(document.activeElement === event.target)}
            onBlur={() => setFocused(false)}
            endAdornment={
              <>
                {loading || !reset || disabled || readOnly ? null : (
                  <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                    <ResetInput
                      id={id || label}
                      preventRender={loading || !reset || disabled || readOnly}
                      onReset={onReset}
                      {...resetProps}
                    />
                  </InputAdornment>
                )}
              </>
            }
            {...selectProps}
          >
            {hasEmpty && <MenuItem value="" sx={{ height: '36px' }}></MenuItem>}
            {options.map((option, i) => (
              <MenuItem key={i} value={option.value} sx={{ textTransform: 'capitalize' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
        {disabled ? null : errorValue ? (
          <FormHelperText
            sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
            variant="outlined"
            {...errorProps}
          >
            {errorValue}
          </FormHelperText>
        ) : helperText ? (
          <FormHelperText
            sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
            variant="outlined"
            {...helperTextProps}
          >
            {helperText}
          </FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};

export const SelectInput = React.memo(WrappedSelectInput);
