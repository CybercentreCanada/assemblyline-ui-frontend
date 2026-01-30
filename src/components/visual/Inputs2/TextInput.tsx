import type { AutocompleteRenderInputParams, TextFieldProps } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import {
  StyledFormControl,
  StyledFormLabel,
  StyledRoot
} from 'components/visual/Inputs2/components/inputs-form.components';
import { useInputValues } from 'components/visual/Inputs2/hooks/inputs-states.hooks';
import type { InputModel } from 'components/visual/Inputs2/models/inputs-main.models';
import React from 'react';

export type TextInputProps = InputModel<string, string> & {
  autoComplete?: TextFieldProps['autoComplete'];
  options?: string[] | readonly string[];
};

export const TextInput: React.FC<TextInputProps> = React.memo((props: TextInputProps) => {
  const values = useInputValues<TextInputProps>(props);

  // const states = useInputStates<string, string>(props);
  // const validation = useValidateInput({ ...props, ...states });

  const states = {};

  // const { value } = props;
  // const { inputValue } = states;

  // const handleBlur = useInputBlur<string, string>({ ...props, ...states });
  // const handleChange = useInputChange<string, string>({ ...props, ...states });
  // const handleFocus = useInputFocus<string, string>({ ...props, ...states });

  const { autoComplete = false, options = [], value, onChange = () => null } = values;

  console.log(props, values);

  return (
    <StyledRoot {...props} {...states}>
      <StyledFormLabel {...props} {...states} />
      <StyledFormControl {...props} {...states}>
        <Autocomplete
          size="small"
          value={value}
          inputValue={value}
          renderInput={(params: AutocompleteRenderInputParams) => <TextField {...params} />}
          options={options}
          onChange={(e, v) => onChange(e, v, v)}
          onInputChange={(e, v) => onChange(e, v, v)}
          // onFocus={handleFocus}
          // onBlur={e => handleBlur(e, value, value)}
        />
      </StyledFormControl>
    </StyledRoot>
  );
});
