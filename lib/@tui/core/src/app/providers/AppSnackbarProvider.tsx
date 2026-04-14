import { SnackbarContent, styled, useTheme } from '@mui/material';
import { forwardRef, useMemo, type FC, type PropsWithChildren } from 'react';

import { SnackbarProvider } from 'notistack';

const StyledSnackbarProvider = styled(SnackbarProvider)`
  & .SnackbarItem-message {
    word-break: break-all;
  }
`;

const ThemedSnackbar = forwardRef<HTMLDivElement, any>(function ThemedSnackbar(props, ref) {
  const theme = useTheme();
  const { variant } = props;

  const style = useMemo(() => {
    if (variant === 'default') {
      return {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.getContrastText(theme.palette.background.default),
        boxShadow: 4
      };
    }
    return {
      bgcolor: theme.palette[variant!].main,
      color: theme.palette.getContrastText(theme.palette[variant!].main),
      boxShadow: 1
    };
  }, [theme, variant]);

  return (
    <SnackbarContent
      ref={ref}
      sx={style}
      classes={props.classes}
      action={props.action}
      message={props.message}
      role={props.role}
    />
  );
});

// Ensure MUI themes are applied to snackbar background and color CSS properties.
const AppSnackbarProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <StyledSnackbarProvider
      Components={{
        success: ThemedSnackbar,
        error: ThemedSnackbar,
        info: ThemedSnackbar,
        warning: ThemedSnackbar,
        default: ThemedSnackbar
      }}
    >
      {children}
    </StyledSnackbarProvider>
  );
};

export default AppSnackbarProvider;
