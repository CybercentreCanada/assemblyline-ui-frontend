import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { ButtonProps, FormControlLabelProps, TypographyProps } from '@mui/material';
import { Button, FormControlLabel, Skeleton, Typography, useTheme } from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import { InputRequiredBadge } from 'components/visual/Inputs/components/inputs.component.form';
import {
  useInputId,
  useShouldRenderExpand,
  useShouldRenderPassword,
  useShouldRenderProgress,
  useShouldRenderReset
} from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import type { TooltipProps } from 'components/visual/Tooltip';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';

export const InputCircularSkeleton = React.memo(() => {
  const [get] = usePropStore<InputControllerProps>();

  const id = useInputId();
  const skeletonProps = get('slotProps')?.skeleton;

  return (
    <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
      <Skeleton
        id={`${id}-skeleton`}
        variant="circular"
        {...skeletonProps}
        sx={{ height: '24px', width: '24px', ...skeletonProps?.sx }}
      />
    </div>
  );
});

InputCircularSkeleton.displayName = 'InputCircularSkeleton';

export const InputFormButtonTooltip = React.memo(({ children }: { children?: TooltipProps['children'] }) => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const loading = get('loading');
  const tooltip = get('tooltip');
  const tooltipProps = get('slotProps')?.formLabelTooltip;

  return (
    <Tooltip
      title={loading ? null : tooltip}
      {...tooltipProps}
      slotProps={{
        tooltip: {
          ...tooltipProps?.slotProps?.tooltip,
          style: {
            marginTop: theme.spacing(0.5),
            ...(tooltipProps?.slotProps?.tooltip as any)?.style
          }
        }
      }}
      sx={{ ...tooltipProps?.sx }}
    >
      {children}
    </Tooltip>
  );
});

InputFormButtonTooltip.displayName = 'InputFormButtonTooltip';

export const InputFormButton = React.memo(({ children, ...props }: ButtonProps) => {
  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const isPasswordVisible = get('isPasswordVisible');
  const loading = get('loading');
  const overflowHidden = get('overflowHidden');
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
        ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
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
    const shouldRenderProgress = useShouldRenderProgress();
    const shouldRenderReset = useShouldRenderReset();
    const tiny = get('tiny');

    return (
      <FormControlLabel
        control={loading ? <InputCircularSkeleton /> : (children as React.ReactElement)}
        disabled={loading || disabled || readOnly}
        label={label}
        {...props}
        slotProps={{
          ...props?.slotProps,
          typography: {
            ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
            width: '100%',
            ...props?.slotProps?.typography
          }
        }}
        sx={{
          marginLeft: 0,
          marginRight: 0,
          paddingRight: `calc(${[!shouldRenderExpand, !shouldRenderPassword, !shouldRenderProgress, !shouldRenderReset].filter(value => value === false).length} * ${tiny ? '24px' : '28px'})`,
          ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
          ...props?.sx
        }}
      />
    );
  }
);

InputButtonFormControlLabel.displayName = 'InputButtonFormControlLabel';

type InputButtonLabelProps = {
  ignoreRequired?: boolean;
  ignoreTooltipIcon?: boolean;
  isFocused?: boolean;
  label?: string;
};

export const InputButtonLabel = React.memo(
  ({
    ignoreRequired = false,
    ignoreTooltipIcon = false,
    isFocused: isFocusedProp,
    label: labelProp
  }: InputButtonLabelProps) => {
    const theme = useTheme();

    const [get] = usePropStore<InputControllerProps>();

    const disabled = get('disabled');
    const formLabelProps = get('slotProps')?.formLabel;
    const isFocused = isFocusedProp ?? get('isFocused');
    const isPasswordVisible = get('isPasswordVisible');
    const label = labelProp ?? get('label');
    const loading = get('loading');
    const monospace = get('monospace');
    const overflowHidden = get('overflowHidden');
    const password = get('password');
    const preventDisabledColor = get('preventDisabledColor');
    const readOnly = get('readOnly');
    const tooltip = get('tooltip');
    const validationStatus = get('validationStatus');

    const color = useMemo<TypographyProps['color']>(() => {
      if (!preventDisabledColor && (disabled || loading)) {
        return 'textDisabled';
      }

      if (readOnly) return 'textSecondary';

      switch (validationStatus) {
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
          if (isFocused) return theme.palette.primary.main;
          return theme.palette.text.primary;
      }
    }, [
      disabled,
      isFocused,
      loading,
      preventDisabledColor,
      readOnly,
      theme.palette.error.main,
      theme.palette.info.main,
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.text.primary,
      theme.palette.warning.main,
      validationStatus
    ]);

    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          columnGap: theme.spacing(0.5),
          ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' })
        }}
      >
        <Typography
          color={color}
          variant="body2"
          {...formLabelProps}
          sx={{
            ...formLabelProps?.sx,
            marginLeft: theme.spacing(1),
            textAlign: 'start',
            width: '100%',
            ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
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
        {tooltip && !ignoreTooltipIcon && <InfoOutlinedIcon sx={{ color, fontSize: 'small' }} />}
      </div>
    );
  }
);

InputButtonLabel.displayName = 'InputButtonLabel';
