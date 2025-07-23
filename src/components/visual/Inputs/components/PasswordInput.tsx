import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, useTheme } from '@mui/material';
import { getAriaLabel, usePreventPassword } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import React from 'react';

export type PasswordInputProps<T> = {
  props: InputProps<T>;
  showPassword: boolean;
  onShowPassword: (event: React.SyntheticEvent) => void;
};

export const PasswordInput = <T,>({
  props,
  showPassword = false,
  onShowPassword = () => null
}: PasswordInputProps<T>) => {
  const theme = useTheme();

  const preventRender = usePreventPassword(props);

  const { resetProps, tiny = false } = props;

  return preventRender ? null : (
    <IconButton
      aria-label={`${getAriaLabel(props)}-password`}
      color="secondary"
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onShowPassword(event);
      }}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
        ...resetProps?.sx
      }}
    >
      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
};
