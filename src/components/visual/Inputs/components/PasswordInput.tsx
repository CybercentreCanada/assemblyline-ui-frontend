import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { IconButtonProps } from '@mui/material';
import { IconButton, useTheme } from '@mui/material';
import React from 'react';

export type PasswordInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  preventRender?: boolean;
  tiny?: boolean;
  showPassword: boolean;
  onShowPassword: IconButtonProps['onClick'];
};

export const PasswordInput: React.FC<PasswordInputProps> = React.memo(
  ({
    id = null,
    preventRender = false,
    tiny = false,
    showPassword = false,
    onShowPassword,
    ...buttonProps
  }: PasswordInputProps) => {
    const theme = useTheme();

    return preventRender ? null : (
      <IconButton
        aria-label={`password ${id}`}
        color="secondary"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onShowPassword(event);
        }}
        {...buttonProps}
        sx={{ padding: theme.spacing(0.5), ...buttonProps?.sx }}
      >
        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    );
  }
);
