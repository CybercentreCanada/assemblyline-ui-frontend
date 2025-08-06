import type { AutocompleteProps } from '@mui/material';
import { Autocomplete, useTheme } from '@mui/material';
import {
  HelperText,
  StyledCustomChip,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React from 'react';

export type ChipsInputProps = InputValues<string[]> &
  InputProps & {
    autoComplete?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['autoComplete'];
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: string[];
  };

const WrappedChipsInput = React.memo(() => {
  const theme = useTheme();
  const [get] = usePropStore<ChipsInputProps>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const endAdornment = get('endAdornment');
  const error = get('errorMsg');
  const focused = get('focused');
  const id = get('id');
  const inputValue = get('inputValue');
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options');
  const password = get('password');
  const placeholder = get('placeholder');
  const preventPasswordRender = get('preventPasswordRender');
  const preventResetRender = get('preventResetRender');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const startAdornment = get('startAdornment');
  const tiny = get('tiny');
  const value = get('value');

  // const { handleBlur, handleChange, handleFocus } = useDefaultHandlers();

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<ChipsInputProps>();

  // const handleChange = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string[]) => {
  //     setStore(s => {
  //       return s;
  //       // const newValue = event.target.value;
  //       // const num = newValue !== '' ? Number(newValue) : null;
  //       // const err = s.error(num);
  //       // s.onError(err);
  //       // if (!err) s.onChange(event, num);
  //       // return { ...s, inputValue: newValue, errorMsg: err };
  //     });
  //   },
  //   [setStore]
  // );

  // const handleFocus = useCallback(
  //   (event: React.FocusEvent) => {
  //     setStore(s => {
  //       s.onFocus(event);
  //       return {
  //         ...s,
  //         inputValue: s.value,
  //         focused: !s.readOnly && !s.disabled && document.activeElement === event.target
  //       };
  //     });
  //   },
  //   [setStore]
  // );

  // const handleBlur = useCallback(
  //   (event: React.FocusEvent) => {
  //     setStore(s => {
  //       s.onBlur(event);
  //       return { ...s, focused: false, inputValue: null };
  //     });
  //   },
  //   [setStore]
  // );

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Autocomplete
            autoComplete={autoComplete}
            disabled={disabled}
            freeSolo
            id={id}
            multiple
            options={options}
            readOnly={readOnly}
            size="small"
            value={inputValue ?? value ?? []}
            isOptionEqualToValue={isOptionEqualToValue}
            onChange={(e, v) => handleChange(e, v, v)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            renderValue={(values, getTagProps) =>
              values.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <StyledCustomChip key={key} label={option} {...tagProps} />;
              })
            }
            renderInput={params => (
              <StyledTextField
                params={params}
                slotProps={{
                  input: {
                    ...(!preventResetRender && { style: { paddingRight: '85px' } })

                    //   ...params.InputProps,
                    //   ...(!preventResetRender && { style: { paddingRight: '85px' } }),
                    //   'aria-describedby': get(s => s['aria-describedby']),
                    //   startAdornment: (
                    //     <>
                    //       {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
                    //       {params.InputProps?.startAdornment}
                    //     </>
                    //   ),
                    //   endAdornment: (
                    //     <>
                    //       {preventPasswordRender && preventResetRender && !endAdornment ? null : (
                    //         <InputAdornment
                    //           position="end"
                    //           sx={{
                    //             position: 'absolute',
                    //             right: '37px',
                    //             top: '50%',
                    //             transform: 'translate(0, -50%)',
                    //             ...(!focused && { visibility: 'hidden' })
                    //           }}
                    //         >
                    //           <PasswordInput />
                    //           <ResetInput onChange={(e, v) => handleChange(e, v, v)} />
                    //           {endAdornment}
                    //         </InputAdornment>
                    //       )}
                    //       {params.InputProps?.endAdornment}
                    //     </>
                    //   )
                  }
                }}
              />
            )}
          />
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const ChipsInput = ({
  autoComplete = false,
  isOptionEqualToValue = (option, value) => option === value,
  options = [],
  preventRender = false,
  ...props
}: ChipsInputProps) => {
  const parsedProps = useInputParsedProps({
    ...props,
    autoComplete,
    options,
    preventRender,
    isOptionEqualToValue
  });

  return preventRender ? null : (
    <PropProvider<ChipsInputProps> props={parsedProps}>
      <WrappedChipsInput />
    </PropProvider>
  );
};
