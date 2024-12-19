import type {
  AutocompleteProps,
  AutocompleteValue,
  FormHelperTextProps,
  IconButtonProps,
  OutlinedInputProps,
  TypographyProps
} from '@mui/material';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Skeleton,
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
  onChange,
  onReset,
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
        textTransform="capitalize"
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
            // eslint-disable-next-line no-unused-vars
            renderInput={({ InputLabelProps, InputProps, inputProps, ...otherParams }) => (
              <>
                <OutlinedInput
                  id={label}
                  error={!!error}
                  endAdornment={
                    !reset ? null : (
                      <InputAdornment position="end">
                        <ResetInput
                          label={label}
                          preventRender={!reset || disabled}
                          onReset={onReset}
                          {...resetProps}
                        />
                      </InputAdornment>
                    )
                  }
                  style={{ padding: 0, ...inputProps?.style }}
                  {...otherParams}
                  {...(inputProps as unknown as OutlinedInputProps)}
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
