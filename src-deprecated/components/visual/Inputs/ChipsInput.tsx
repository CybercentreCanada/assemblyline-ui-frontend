import type { AutocompleteProps, TextFieldProps } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot,
  InputSkeleton
} from 'components/visual/Inputs/components/inputs.component.form';
import { InputCustomChip, InputTextField } from 'components/visual/Inputs/components/inputs.component.textfield';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import type { ElementType } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ChipsInputProps = InputValueModel<string[], React.SyntheticEvent<Element, Event>> &
  InputOptions &
  InputSlotProps & {
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

type ChipsInputController = ChipsInputProps & InputRuntimeState<string[]>;

const WrappedChipsInput = () => {
  const { t } = useTranslation('inputs');

  const [get, setStore] = usePropStore<ChipsInputController>();

  const allowEmptyStrings = get('allowEmptyStrings');
  const currentValue = get('currentValue') ?? '';
  const disableCloseOnSelect = get('disableCloseOnSelect');
  const disabled = get('disabled');
  const filterSelectedOptions = get('filterSelectedOptions');
  const id = useInputId();
  const isFocused = get('isFocused');
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const options = get('options') ?? [];
  const placeholder = get('placeholder');
  const rawValue = get('rawValue') ?? [];
  const readOnly = get('readOnly');
  const renderOption = get('renderOption');
  const renderValue = get('renderValue');
  const value = get('value');

  const handleBlur = useInputBlur<string[]>();
  const handleChange = useInputChange<string[]>();
  const handleFocus = useInputFocus<string[]>();

  return (
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        {loading ? (
          <InputSkeleton />
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
            value={rawValue}
            onInputChange={(e, v) => setStore(s => ({ ...s, currentValue: v }))}
            onChange={(e, v) => handleChange(e, v as string[], rawValue)}
            onFocus={handleFocus}
            onBlur={e => {
              setStore(s => ({ ...s, currentValue: '' }));
              handleBlur(e, currentValue && !value.includes(currentValue) ? [...value, currentValue] : value, rawValue);
            }}
            renderValue={
              renderValue ??
              ((values, getTagProps) =>
                values.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <InputCustomChip key={key} label={option ? option : '\u00A0'} {...tagProps} />;
                }))
            }
            renderInput={params => (
              <InputTextField
                params={{
                  ...params,
                  inputProps: {
                    placeholder:
                      placeholder ??
                      (!isFocused || currentValue || rawValue?.length ? undefined : t('input.chips.placeholder')),
                    ...params.inputProps,
                    ...(allowEmptyStrings && {
                      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === 'Enter') {
                          const current = (event.currentTarget as HTMLInputElement).value;
                          if (current === '') {
                            event.preventDefault();
                            const next = Array.from(new Set([...(rawValue ?? []), '']));
                            handleChange(event as any, next);
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
        <InputHelperText />
      </InputFormControl>
    </InputRoot>
  );
};

export const ChipsInput = ({ preventRender = false, value = [], ...props }: ChipsInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<string[]>({
    value: value ?? [],
    ...props
  });

  return preventRender ? null : (
    <PropProvider<ChipsInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as ChipsInputController}
      props={{
        allowEmptyStrings: false,
        autoComplete: 'off',
        currentValue: '',
        disableCloseOnSelect: false,
        filterSelectedOptions: false,
        isOptionEqualToValue: (option, value) => option === value,
        options: [],
        preventRender,
        rawValue: value ?? [],
        renderOption: null,
        renderValue: null,
        showClearButton: true,
        validationMessage,
        validationStatus,
        value,
        ...props
      }}
    >
      <WrappedChipsInput />
    </PropProvider>
  );
};
