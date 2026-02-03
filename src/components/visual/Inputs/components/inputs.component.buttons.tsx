import type { ButtonProps, FormControlLabelProps } from '@mui/material';
import { Button, FormControlLabel, Typography, useTheme } from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import { InputCircularSkeleton, InputRequiredBadge } from 'components/visual/Inputs/components/inputs.component.form';
import {
  useShouldRenderExpand,
  useShouldRenderPassword,
  useShouldRenderReset
} from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

export const InputFormButton = React.memo(({ children, ...props }: ButtonProps) => {
  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const isPasswordVisible = get('isPasswordVisible');
  const loading = get('loading');
  const password = get('password');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tiny = get('tiny');

  return (
    <Button
      color="inherit"
      disabled={loading || disabled || readOnly}
      fullWidth
      size="small"
      {...props}
      sx={{
        justifyContent: 'start',
        color: 'inherit',
        textTransform: 'none',
        minHeight: tiny ? '32px' : '40px',
        ...(disabled && preventDisabledColor && { color: 'inherit !important' }),
        ...(readOnly && !disabled && { color: 'inherit !important', pointerEvents: 'none', userSelect: 'text' }),
        ...(password && isPasswordVisible && { wordBreak: 'break-all' }),
        ...props?.sx
      }}
    >
      {children}
    </Button>
  );
});

InputFormButton.displayName = 'InputFormButton';

type InputButtonFormControlLabelProps = Omit<FormControlLabelProps, 'control'> & {
  children: FormControlLabelProps['control'];
};

export const InputButtonFormControlLabel = React.memo(
  ({ children, label, ...props }: InputButtonFormControlLabelProps) => {
    const [get] = usePropStore<InputControllerProps>();

    const disabled = get('disabled');
    const loading = get('loading');
    const overflowHidden = get('overflowHidden');
    const readOnly = get('readOnly');
    const shouldRenderExpand = useShouldRenderExpand();
    const shouldRenderPassword = useShouldRenderPassword();
    const shouldRenderReset = useShouldRenderReset();
    const tiny = get('tiny');

    return (
      <FormControlLabel
        control={loading ? <InputCircularSkeleton /> : (children as React.ReactElement)}
        disabled={loading || disabled || readOnly}
        label={label}
        {...props}
        slotProps={{ ...props?.slotProps, typography: { width: '100%', ...props?.slotProps?.typography } }}
        sx={{
          marginLeft: 0,
          marginRight: 0,
          paddingRight: `calc(8px + ${[!shouldRenderExpand, !shouldRenderPassword, !shouldRenderReset].filter(value => value === false).length} * ${tiny ? '24px' : '28px'})`,
          ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
          ...props?.sx
        }}
      />
    );
  }
);

InputButtonFormControlLabel.displayName = 'InputButtonFormControlLabel';

type InputButtonLabelProps = {
  label?: string;
  isFocused?: boolean;
  ignoreRequired?: boolean;
};

export const InputButtonLabel = React.memo(
  ({ label: labelProp, isFocused: isFocusedProp, ignoreRequired = false }: InputButtonLabelProps) => {
    const theme = useTheme();

    const [get] = usePropStore<InputControllerProps>();

    const disabled = get('disabled');
    const endAdornment = get('endAdornment');
    const isFocused = isFocusedProp ?? get('isFocused');
    const isPasswordVisible = get('isPasswordVisible');
    const label = labelProp ?? get('label');
    const labelProps = get('labelProps');
    const loading = get('loading');
    const monospace = get('monospace');
    const password = get('password');
    const preventDisabledColor = get('preventDisabledColor');
    const readOnly = get('readOnly');
    const validationStatus = get('validationStatus');

    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: theme.spacing(1)
        }}
      >
        <Typography
          color={
            !preventDisabledColor && (loading || disabled)
              ? 'textDisabled'
              : readOnly
                ? 'textPrimary'
                : validationStatus === 'error'
                  ? 'error'
                  : isFocused
                    ? 'primary'
                    : 'textPrimary'
          }
          variant="body2"
          {...labelProps}
          sx={{
            ...labelProps?.sx,
            marginLeft: theme.spacing(1),
            textAlign: 'start',
            width: '100%',
            ...(monospace && { fontFamily: 'monospace' }),
            ...(password &&
              isPasswordVisible && {
                fontFamily: 'password',
                WebkitTextSecurity: 'disc',
                MozTextSecurity: 'disc',
                textSecurity: 'disc'
              })
          }}
        >
          <InputRequiredBadge ignoreRequired={ignoreRequired}>{label}</InputRequiredBadge>
        </Typography>

        {endAdornment}
      </div>
    );
  }
);

InputButtonLabel.displayName = 'InputButtonLabel';
