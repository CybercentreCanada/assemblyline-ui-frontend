import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, useTheme } from '@mui/material';
import type { useInputState } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';

export type PasswordInputProps<T, P> = {
  props: InputProps<T>;
  state: ReturnType<typeof useInputState<T, P>>;
};

export const PasswordInput = <T, P>({ props, state }: PasswordInputProps<T, P>) => {
  const theme = useTheme();

  const { id, preventPasswordRender, showPassword, togglePassword } = state;
  const { resetProps, tiny = false } = props;

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      onClick={event => togglePassword(event)}
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
