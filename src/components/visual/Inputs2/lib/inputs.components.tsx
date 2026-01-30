import type { TypographyProps } from '@mui/material';
import { FormControl, FormHelperText, InputLabel, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import { useInputID, useInputLabel } from 'components/visual/Inputs2/lib/inputs.hooks';
import type { InputModel, InputModelWithChildren } from 'components/visual/Inputs2/lib/inputs.models';
import React, { useMemo } from 'react';

/**
 * Circular skeleton used as a placeholder for inputs with circular adornments.
 */
export const StyledCircularSkeleton = React.memo(<Input, InputValue>({ tiny }: InputModel<Input, InputValue>) => {
  return (
    <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
      <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
    </div>
  );
}) as <Input, InputValue>(props: InputModel<Input, InputValue>) => React.ReactElement;

/**
 * Rectangular skeleton used as a placeholder for input fields while loading.
 */
export const StyledInputSkeleton = React.memo(<Input, InputValue>({ tiny }: InputModel<Input, InputValue>) => {
  return <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />;
}) as <Input, InputValue>(props: InputModel<Input, InputValue>) => React.ReactElement;

/**
 * Root container for an input component.
 * Wraps children and generates a unique ID based on the input label/id.
 */
export const StyledRoot = React.memo(
  <Input, InputValue>({ children, ...props }: InputModelWithChildren<Input, InputValue>) => {
    const id = useInputID(props);

    return (
      <div aria-labelledby={id} id={`${id}-root`} role="group" style={{ textAlign: 'left' }}>
        {children}
      </div>
    );
  }
) as <Input, InputValue>(props: InputModelWithChildren<Input, InputValue>) => React.ReactElement;

/**
 * Displays the label associated with the input.
 */
export const StyledFormLabel = React.memo(<Input, InputValue>(props: InputModel<Input, InputValue>) => {
  const theme = useTheme();

  const {
    disabled,
    focused,
    labelProps,
    loading,
    overflowHidden,
    preventDisabledColor,
    readOnly,
    tooltip,
    tooltipProps,
    validationState
  } = props;

  const id = useInputID(props);
  const label = useInputLabel(props);

  const color = useMemo<TypographyProps['color']>(() => {
    if (!preventDisabledColor && (disabled || loading)) {
      return 'textDisabled';
    }

    switch (validationState) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      case 'default':
      default:
        if (focused) return 'primary';
        if (readOnly) return 'textSecondary';
        return 'textSecondary';
    }
  }, [disabled, focused, loading, preventDisabledColor, readOnly, validationState]);

  return (
    <Tooltip title={tooltip ?? ''} disableHoverListener={!tooltip} {...tooltipProps}>
      <Typography
        component={InputLabel}
        htmlFor={id}
        gutterBottom
        variant="body2"
        color={color}
        whiteSpace="nowrap"
        {...labelProps}
        sx={{
          whiteSpace: overflowHidden ? 'nowrap' : 'normal',
          ...(disabled &&
            !preventDisabledColor && {
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
            }),

          ...labelProps?.sx
        }}
      >
        {label}
        {/* <RequiredBadge>{label}</RequiredBadge> */}
      </Typography>
    </Tooltip>
  );
}) as <Input, InputValue>(props: InputModel<Input, InputValue>) => React.ReactElement;

/**
 * Displays validation feedback below the input.
 */
export const StyledHelperText = React.memo(<Input, InputValue>(props: InputModel<Input, InputValue>) => {
  const theme = useTheme();

  const { disabled, helperText, loading, readOnly, validationState, validationMessage } = props;

  const id = useInputID(props);

  // Do not render helper text in non-interactive states
  if (disabled || loading || readOnly) return null;

  // No validation feedback to display
  if (!validationMessage || !helperText) return null;

  const color = (() => {
    switch (validationState) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
        return theme.palette.info.main;
      case 'default':
      default:
        return theme.palette.text.secondary;
    }
  })();

  return (
    <FormHelperText id={`${id}-helper-text`} variant="outlined" sx={{ color }}>
      {validationMessage ?? helperText}
    </FormHelperText>
  );
}) as <Input, InputValue>(props: InputModel<Input, InputValue>) => React.ReactElement;

/*******************************************************************************************
 * Defined the form controller for the input components
 ******************************************************************************************/
export const StyledFormControl = React.memo(
  <Input, InputValue>({ children, ...props }: InputModelWithChildren<Input, InputValue>) => {
    const theme = useTheme();

    const { disabled, divider, loading, readOnly } = props;

    const id = useInputID(props);

    return (
      <FormControl
        id={`${id}-form`}
        component="form"
        size="small"
        fullWidth
        {...(readOnly && !disabled && { focused: null })}
        onSubmit={e => e.preventDefault()}
        sx={{
          ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
          ...(readOnly &&
            !disabled && {
              '& .MuiInputBase-input': { cursor: 'default' },
              '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
              }
            })
        }}
      >
        {loading ? <StyledInputSkeleton {...props} /> : children}
        <StyledHelperText {...props} />
      </FormControl>
    );
  }
) as <Input, InputValue>(props: InputModelWithChildren<Input, InputValue>) => React.ReactElement;
