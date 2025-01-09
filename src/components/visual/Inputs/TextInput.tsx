import type {
  AutocompleteProps,
  AutocompleteValue,
  FormHelperTextProps,
  IconButtonProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import type { ElementType } from 'react';
import React, { useMemo, useState } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props<
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput' | 'options' | 'onChange' | 'value'
> & {
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: string;
  onChange?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['onInputChange'];
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedTextInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  disabled,
  error = () => null,
  errorProps = null,
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
  ...autocompleteProps
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const [_value, setValue] =
    useState<AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>>(null);

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
          <Autocomplete
            id={id || label}
            autoComplete
            freeSolo
            disableClearable
            fullWidth
            size="small"
            value={_value}
            disabled={disabled}
            readOnly={readOnly}
            inputValue={value || ''}
            options={options}
            onChange={(e, v) => setValue(v)}
            onInputChange={(e, v, o) => {
              setValue(v as AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>);
              onChange(e, v, o);

              const err = error(v);
              if (err) onError(err);
            }}
            renderInput={({ InputProps, ...params }) => (
              <>
                <TextField
                  id={id || label}
                  variant="outlined"
                  error={!!errorValue}
                  {...(readOnly &&
                    !disabled && {
                      focused: null,
                      sx: {
                        '& .MuiInputBase-input': { cursor: 'default' },
                        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                        }
                      }
                    })}
                  InputProps={{
                    readOnly: readOnly,
                    endAdornment:
                      loading || !reset || disabled || readOnly ? null : (
                        <InputAdornment position="end">
                          <ResetInput
                            id={id || label}
                            preventRender={loading || !reset || disabled || readOnly}
                            onReset={onReset}
                            {...resetProps}
                          />
                        </InputAdornment>
                      ),
                    ...InputProps
                  }}
                  {...params}
                />
                {!errorValue || disabled ? null : (
                  <FormHelperText
                    sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
                    variant="outlined"
                    {...errorProps}
                  >
                    {errorValue}
                  </FormHelperText>
                )}
              </>
            )}
            {...autocompleteProps}
          />
        )}
      </FormControl>
    </div>
  );
};

export const TextInput = React.memo(WrappedTextInput);
