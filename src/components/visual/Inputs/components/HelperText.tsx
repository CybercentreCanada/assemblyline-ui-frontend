import type { FormHelperTextProps } from '@mui/material';
import { FormHelperText, useTheme } from '@mui/material';
import React from 'react';

export type HelperTextProps = {
  disabled: boolean;
  errorProps: FormHelperTextProps;
  errorText: string;
  helperText: string;
  helperTextProps: FormHelperTextProps;
  id: string;
  label: string;
};

export const HelperText = React.memo(
  ({
    disabled = false,
    errorProps = null,
    errorText = '',
    helperText = '',
    helperTextProps = null,
    id = null,
    label = null
  }: HelperTextProps) => {
    const theme = useTheme();

    return helperText ? (
      <FormHelperText
        id={`${id || label}-helper-text`}
        variant="outlined"
        {...helperTextProps}
        sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
      >
        {helperText}
      </FormHelperText>
    ) : disabled ? null : errorText ? (
      <FormHelperText
        id={`${id || label}-helper-text`}
        variant="outlined"
        {...errorProps}
        sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
      >
        {errorText}
      </FormHelperText>
    ) : null;
  }
);
