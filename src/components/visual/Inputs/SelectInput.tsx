import type {
  FormHelperTextProps,
  IconButtonProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
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
import React, { useMemo } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SelectProps, 'error' | 'value' | 'onChange'> & {
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
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
  error = () => null,
  errorProps = null,
  hasEmpty = false,
  id = null,
  label,
  labelProps,
  loading = false,
  options = [],
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
            variant="outlined"
            size="small"
            fullWidth
            disabled={disabled}
            displayEmpty
            readOnly={readOnly}
            inputProps={{ id: id || label }}
            value={options.some(o => o.value === value) ? value : ''}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => {
              onChange(event, event.target.value as string);

              const err = error(event.target.value as string);
              if (err) onError(err);
            }}
            endAdornment={
              loading || !reset || disabled || readOnly ? null : (
                <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                  <ResetInput
                    id={id || label}
                    preventRender={loading || !reset || disabled || readOnly}
                    onReset={onReset}
                    {...resetProps}
                  />
                </InputAdornment>
              )
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
        {!errorValue || disabled ? null : (
          <FormHelperText
            sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
            variant="outlined"
            {...errorProps}
          >
            {errorValue}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};

export const SelectInput = React.memo(WrappedSelectInput);
