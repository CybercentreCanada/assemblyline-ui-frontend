import { FormHelperText, useTheme } from '@mui/material';
import type { useInputState } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';

export type HelperTextProps<T, P> = {
  props: InputProps<T>;
  state: ReturnType<typeof useInputState<T, P>>;
};

export const HelperText = <T, P>({ props, state }: HelperTextProps<T, P>) => {
  const theme = useTheme();

  const { error, id } = state;

  const {
    disabled = false,
    errorProps = null,
    helperText = '',
    helperTextProps = null,
    loading = false,
    readOnly = false
  } = props;

  return disabled || loading || readOnly ? null : error ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...errorProps}
      sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
    >
      {error}
    </FormHelperText>
  ) : helperText ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...helperTextProps}
      sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
    >
      {helperText}
    </FormHelperText>
  ) : null;
};
