import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { AutocompleteProps, FormHelperTextProps, IconButtonProps, TypographyProps } from '@mui/material';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import type { ElementType } from 'react';
import React, { useState } from 'react';

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
  reset?: boolean;
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
  label,
  labelProps,
  disabled,
  error = null,
  errorProps = null,
  loading = false,
  options = [],
  reset = false,
  value,
  onChange,
  onReset,
  ...autocompleteProps
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const [_value, setValue] = useState(null);

  return (
    <>
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
              setValue(v);
              onChange(e, v, o);
            }}
            renderInput={params => (
              <>
                <OutlinedInput
                  id={label}
                  error={!!error}
                  endAdornment={
                    !reset ? null : (
                      <InputAdornment position="start">
                        <IconButton edge="end" onClick={onReset}>
                          <RefreshOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
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
    </>
  );
};

export const TextInput = React.memo(WrappedTextInput);
