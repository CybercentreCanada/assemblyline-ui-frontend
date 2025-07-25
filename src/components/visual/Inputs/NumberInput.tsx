import type { TextFieldProps } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  isValidNumber,
  isValidValue,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledTextField,
  useInputState
} from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type NumberInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> &
  InputProps<number> & {
    max?: number;
    min?: number;
    unnullable?: boolean;
  };

const WrappedNumberInput = (props: NumberInputProps) => {
  const { t } = useTranslation('inputs');

  const {
    error = () => '',
    loading = false,
    max = null,
    min = null,
    password = false,
    preventRender = false,
    required = false,
    rootProps = null,
    tiny = false
  } = props;

  const state = useInputState<number, string>(
    props,
    v => {
      const num = isValidValue(v) ? Number(v) : null;
      if (error(num)) return error(num);
      else if (required && !isValidValue(num)) return t('error.required');
      else if (!isValidNumber(num, props)) {
        if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
        else if (typeof min === 'number') return t('error.min', { min });
        else if (typeof max === 'number') return t('error.max', { max });
      } else return null;
    },
    v => (typeof v === 'object' ? '' : `${v}`),
    v => (v !== null && v !== undefined && v !== '' ? Number(v) : null)
  );

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} state={state} />
      <StyledFormControl props={props} state={state}>
        {loading ? (
          <StyledInputSkeleton props={props} state={state} />
        ) : (
          <>
            <StyledTextField
              props={props}
              state={state}
              type={password && state.showPassword ? 'password' : 'number'}
              slotProps={{
                input: {
                  inputProps: {
                    ...(min && { min: min }),
                    ...(max && { max: max }),
                    ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
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

export const NumberInput: React.FC<NumberInputProps> = React.memo(WrappedNumberInput);
