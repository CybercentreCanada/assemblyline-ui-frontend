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
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React from 'react';

export type ChipsInputProps = InputValues<string[], string[], React.SyntheticEvent<Element, Event>> &
  InputProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    disableCloseOnSelect?: AutocompleteProps<string, true, false, true, ElementType>['disableCloseOnSelect'];
    filterSelectedOptions?: AutocompleteProps<string, true, false, true, ElementType>['filterSelectedOptions'];
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: string[] | readonly string[];
    renderOption?: AutocompleteProps<string, true, false, true, ElementType>['renderOption'];
    renderValue?: AutocompleteProps<string, true, false, true, ElementType>['renderValue'];
  };

const WrappedChipsInput = () => {
  const [get] = usePropStore<ChipsInputProps>();

  const disableCloseOnSelect = get('disableCloseOnSelect');
  const disabled = get('disabled');
  const filterSelectedOptions = get('filterSelectedOptions');
  const id = get('id');
  const inputValue = get('inputValue') ?? [];
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const options = get('options');
  const readOnly = get('readOnly');
  const renderOption = get('renderOption');
  const renderValue = get('renderValue');

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
            isOptionEqualToValue={isOptionEqualToValue}
            multiple
            options={options}
            readOnly={readOnly}
            size="small"
            value={inputValue}
            onChange={(e, v) => handleChange(e, v as string[], v as string[])}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e)}
            renderValue={
              renderValue ??
              ((values, getTagProps) =>
                values.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <StyledCustomChip key={key} label={option} {...tagProps} />;
                }))
            }
            renderInput={params => <StyledTextField params={params} />}
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

export const ChipsInput = ({ preventRender = false, value = [], ...props }: ChipsInputProps) =>
  preventRender ? null : (
    <PropProvider<ChipsInputProps>
      props={{
        autoComplete: 'off',
        disableCloseOnSelect: false,
        filterSelectedOptions: false,
        inputValue: value,
        isOptionEqualToValue: (option, value) => option === value,
        options: [],
        preventRender,
        renderOption: null,
        renderValue: null,
        clearAdornment: true,
        value,
        ...props
      }}
    >
      <WrappedChipsInput />
    </PropProvider>
  );
