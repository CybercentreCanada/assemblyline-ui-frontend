import type { AutocompleteProps, FormHelperTextProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { Autocomplete, TextField, useTheme } from '@mui/material';
import type { ElementType } from 'react';
import React, { useMemo } from 'react';
import { BaseListItem, BaseListItemText } from './components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props<
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'value' | 'renderInput' | 'options' | 'onChange'
> & {
  capitalize?: boolean;
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  showReset?: boolean;
  value: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedTextListInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  capitalize = false,
  disabled = false,
  error = () => null,
  errorProps = null,
  id,
  loading = false,
  options = [],
  preventRender = false,
  primary,
  primaryProps = null,
  readOnly = false,
  reset,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...autocompleteProps
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
      <BaseListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={primaryProps}
        secondaryTypographyProps={secondaryProps}
        capitalize={capitalize}
      />
      {loading ? (
        <SkeletonListInput />
      ) : (
        <>
          <ResetListInput
            id={primary}
            preventRender={!reset || disabled || readOnly}
            onReset={onReset}
            {...resetProps}
          />
          <Autocomplete
            autoComplete
            freeSolo
            disableClearable
            fullWidth
            size="small"
            sx={{ maxWidth: '30%', minWidth: '30%' }}
            // value={value || null}
            disabled={disabled}
            readOnly={readOnly}
            options={options}
            inputValue={value}
            onInputChange={(e, v) => {
              onChange(e, v);

              const err = error(v);
              if (err) onError(err);
            }}
            renderInput={({ inputProps, ...params }) => (
              <TextField
                error={!!errorValue && !readOnly}
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
                {...params}
                inputProps={{ ...inputProps, id }}
              />
            )}
            {...autocompleteProps}
          />
        </>
      )}
    </BaseListItem>
  );
};

export const TextListInput = React.memo(WrappedTextListInput);
