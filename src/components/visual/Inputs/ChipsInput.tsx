import type { AutocompleteProps, TextFieldProps } from '@mui/material';
import { Autocomplete } from '@mui/material';
import {
  HelperText,
  StyledCustomChip,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useErrorCallback,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ChipsInputProps = InputValues<string[], string[], React.SyntheticEvent<Element, Event>> &
  InputProps & {
    allowEmptyStrings?: boolean;
    autoComplete?: TextFieldProps['autoComplete'];
    currentValue?: string;
    disableCloseOnSelect?: AutocompleteProps<string, true, false, true, ElementType>['disableCloseOnSelect'];
    filterSelectedOptions?: AutocompleteProps<string, true, false, true, ElementType>['filterSelectedOptions'];
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: string[] | readonly string[];
    renderOption?: AutocompleteProps<string, true, false, true, ElementType>['renderOption'];
    renderValue?: AutocompleteProps<string, true, false, true, ElementType>['renderValue'];
  };

const WrappedChipsInput = () => {
  const { t } = useTranslation('inputs');

  const [get, setStore] = usePropStore<ChipsInputProps>();

  const allowEmptyStrings = get('allowEmptyStrings');
  const currentValue = get('currentValue') ?? '';
  const disableCloseOnSelect = get('disableCloseOnSelect');
  const disabled = get('disabled');
  const filterSelectedOptions = get('filterSelectedOptions');
  const focused = get('focused');
  const id = usePropID();
  const inputValue = get('inputValue') ?? [];
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const options = get('options') ?? [];
  const readOnly = get('readOnly');
  const renderOption = get('renderOption');
  const renderValue = get('renderValue');
  const value = get('value');

  const handleBlur = useInputBlur<ChipsInputProps>();
  const handleChange = useInputChange<ChipsInputProps>();
  const handleFocus = useInputFocus<ChipsInputProps>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Autocomplete
            disableCloseOnSelect={disableCloseOnSelect}
            disabled={disabled}
            filterSelectedOptions={filterSelectedOptions}
            freeSolo
            id={id}
            inputValue={currentValue}
            isOptionEqualToValue={isOptionEqualToValue}
            multiple
            options={options}
            readOnly={readOnly}
            size="small"
            value={inputValue}
            onInputChange={(e, v) => setStore(s => ({ ...s, currentValue: v }))}
            onChange={(e, v) => handleChange(e, v as string[], v as string[])}
            onFocus={handleFocus}
            onBlur={e => {
              setStore(s => ({ ...s, currentValue: '' }));
              handleBlur(
                e,
                currentValue ? [...value, currentValue] : value,
                currentValue ? [...value, currentValue] : value
              );
            }}
            renderValue={
              renderValue ??
              ((values, getTagProps) =>
                values.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <StyledCustomChip key={key} label={option ? option : '\u00A0'} {...tagProps} />;
                }))
            }
            renderInput={params => (
              <StyledTextField
                params={{
                  ...params,
                  inputProps: {
                    placeholder:
                      !focused || currentValue || inputValue?.length ? undefined : t('chips-input.placeholder'),
                    ...params.inputProps,
                    ...(allowEmptyStrings && {
                      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === 'Enter') {
                          const current = (event.currentTarget as HTMLInputElement).value;
                          if (current === '') {
                            event.preventDefault();
                            const next = Array.from(new Set([...(inputValue ?? []), '']));
                            handleChange(event as any, next, next);
                          }
                        }
                      }
                    })
                  }
                }}
              />
            )}
            renderOption={renderOption}
            sx={{
              ...(readOnly &&
                !disabled && {
                  pointerEvents: 'none',
                  '& .MuiAutocomplete-input': {
                    pointerEvents: 'none'
                  }
                })
            }}
          />
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
};

export const ChipsInput = ({ preventRender = false, value = [], ...props }: ChipsInputProps) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<ChipsInputProps>
      props={{
        allowEmptyStrings: false,
        autoComplete: 'off',
        clearAdornment: true,
        currentValue: '',
        disableCloseOnSelect: false,
        errorMessage,
        filterSelectedOptions: false,
        inputValue: value,
        isOptionEqualToValue: (option, value) => option === value,
        options: [],
        preventRender,
        renderOption: null,
        renderValue: null,
        value,
        ...props
      }}
    >
      <WrappedChipsInput />
    </PropProvider>
  );
};
