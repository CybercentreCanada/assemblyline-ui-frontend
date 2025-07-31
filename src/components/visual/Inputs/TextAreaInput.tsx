import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputState } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type TextAreaInputProps = Omit<TextFieldProps, 'rows' | 'onChange' | 'error' | 'defaultValue'> &
  InputProps<string> & {
    rows: TextFieldProps['rows'];
  };

const WrappedTextAreaInput = (props: TextAreaInputProps) => {
  const { t } = useTranslation('inputs');

  return null;

  const {
    error = () => '',
    loading = false,
    password = false,
    preventRender = false,
    required = false,
    rootProps = null,
    rows = 1,
    tiny = false,
    value
  } = props;

  const state = useInputState<string, string>(props, v => {
    if (error(v)) return error(v);
    else if (required && !isValidValue(v)) return t('error.required');
    else return null;
  });

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} state={state} />
      <StyledFormControl props={props} state={state}>
        {loading ? (
          <Skeleton
            sx={{ height: `calc(23px * ${rows} + 17px)`, transform: 'unset', ...(tiny && { height: '28px' }) }}
          />
        ) : (
          <>
            <StyledTextField
              props={props}
              state={state}
              multiline
              rows={password && state.showPassword ? 1 : rows}
              value={value}
              slotProps={{
                input: {
                  inputProps: {
                    sx: {
                      ...(tiny && { padding: '2.5px 4px 2.5px 8px' }),
                      ...(password &&
                        state.showPassword && {
                          fontFamily: 'password',
                          WebkitTextSecurity: 'disc',
                          MozTextSecurity: 'disc',
                          textSecurity: 'disc'
                        })
                    }
                  }
                }
              }}
            />
            <HelperText props={props} state={state} />
          </>
        )}
      </StyledFormControl>
    </div>
  );
};

export const TextAreaInput: React.FC<TextAreaInputProps> = React.memo(WrappedTextAreaInput);
