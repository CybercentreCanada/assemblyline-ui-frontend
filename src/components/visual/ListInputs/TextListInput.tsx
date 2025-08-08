import type { AutocompleteProps, FormHelperTextProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { Autocomplete, TextField, useTheme } from '@mui/material';
import { ListItemText } from 'components/visual/List/ListItemText';
import { BaseListItem } from 'components/visual/ListInputs/components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from 'components/visual/ListInputs/components/ResetListInput';
import { SkeletonListInput } from 'components/visual/ListInputs/components/SkeletonListInput';
import type { ElementType } from 'react';
import React, { useMemo } from 'react';

export type TextListInputProps<
  Value extends string = string,
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'value' | 'renderInput' | 'options' | 'onChange'
> & {
  capitalize?: boolean;
  defaultValue?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  inset?: boolean;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  preventRender?: boolean;
  primary?: React.ReactNode;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  showReset?: boolean;
  value: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedTextListInput = <
  Value extends string = string,
  Multiple extends boolean = boolean,
  DisableClearable extends boolean = boolean,
  FreeSolo extends boolean = boolean,
  ChipComponent extends ElementType = ElementType
>({
  capitalize = false,
  defaultValue,
  disabled = false,
  error = () => null,
  errorProps = null,
  id = null,
  inset = false,
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
  onError = () => null,
  onReset = null,
  ...autocompleteProps
}: TextListInputProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
      <ListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={primaryProps}
        secondaryTypographyProps={secondaryProps}
        capitalize={capitalize}
        style={{
          marginRight: theme.spacing(2),
          margin: `${theme.spacing(0.25)} 0`,
          ...(inset && { marginLeft: '42px' })
        }}
      />
      {loading ? (
        <SkeletonListInput />
      ) : (
        <>
          <ResetListInput
            defaultValue={defaultValue}
            id={id || primary.toString()}
            preventRender={!reset || disabled || readOnly}
            onChange={event => onChange(event, defaultValue)}
            onReset={onReset}
            {...resetProps}
          />
          <Autocomplete
            id={id || primary.toString()}
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
                variant="outlined"
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
                inputProps={inputProps}
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
