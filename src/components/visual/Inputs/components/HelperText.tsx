import { FormHelperText, useTheme } from '@mui/material';
import { getAriaLabel } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';

export type HelperTextProps<T> = {
  props: InputProps<T>;
};

export const HelperText = <T,>({ props }: HelperTextProps<T>) => {
  const theme = useTheme();

  const {
    disabled = false,
    error = () => null,
    errorProps = null,
    helperText = '',
    helperTextProps = null,
    loading = false,
    readOnly = false,
    value
  } = props;

  return disabled || loading || readOnly ? null : error(value) ? (
    <FormHelperText
      id={`${getAriaLabel(props)}-helper-text`}
      variant="outlined"
      {...errorProps}
      sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
    >
      {error(value)}
    </FormHelperText>
  ) : helperText ? (
    <FormHelperText
      id={`${getAriaLabel(props)}-helper-text`}
      variant="outlined"
      {...helperTextProps}
      sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
    >
      {helperText}
    </FormHelperText>
  ) : null;
};
