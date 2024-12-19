import type {
  AutocompleteProps,
  AutocompleteValue,
  FormHelperTextProps,
  IconButtonProps,
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
import type { ElementType } from 'react';
import React, { useState } from 'react';
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
  error?: FormHelperTextProps['children'];
  errorProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  value: string;
  onChange?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['onInputChange'];
  onReset?: IconButtonProps['onClick'];
};

const WrappedTextInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  disabled,
  error = null,
  errorProps = null,
  label,
  labelProps,
  loading = false,
  options = [],
  preventRender = false,
  reset = false,
  resetProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  ...autocompleteProps
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const [_value, setValue] =
    useState<AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>>(null);

  return preventRender ? null : (
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
          <Autocomplete
            id={label}
            autoComplete
            freeSolo
            disableClearable
            fullWidth
            size="small"
            value={_value}
            disabled={disabled}
            inputValue={value || ''}
            options={options}
            onChange={(e, v) => setValue(v)}
            onInputChange={(e, v, o) => {
              setValue(v as AutocompleteValue<Value, Multiple, true | DisableClearable, true | FreeSolo>);
              onChange(e, v, o);
            }}
            renderInput={({ InputProps, ...params }) => (
              <>
                <TextField
                  id={label}
                  variant="outlined"
                  error={!!error}
                  InputProps={{
                    endAdornment: !reset ? null : (
                      <InputAdornment position="end">
                        <ResetInput
                          label={label}
                          preventRender={!reset || disabled}
                          onReset={onReset}
                          {...resetProps}
                        />
                      </InputAdornment>
                    ),
                    ...InputProps
                  }}
                  {...params}
                />
                {!error || disabled ? null : (
                  <FormHelperText
                    sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
                    variant="outlined"
                    {...errorProps}
                  >
                    {error}
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
