import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type {
  FormControlProps,
  ListItemButtonProps,
  ListItemProps,
  ListItemTextProps,
  TypographyProps
} from '@mui/material';
import {
  Badge,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import { useInputId, useInputLabel } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';

/**********************************************************************************************************************
 * Skeletons
 *********************************************************************************************************************/
export const InputSkeleton = React.memo(() => {
  const [get] = usePropStore<InputControllerProps>();

  const tiny = get('tiny');

  return <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />;
});

InputSkeleton.displayName = 'InputSkeleton';

export const InputCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

InputCircularSkeleton.displayName = 'InputCircularSkeleton';

/**********************************************************************************************************************
 * Forms
 *********************************************************************************************************************/

export const InputRoot = React.memo(({ children }: { children: React.ReactNode }) => {
  const [get] = usePropStore<InputControllerProps>();

  const id = useInputId();
  const rootProps = get('rootProps');

  return (
    <div {...rootProps} id={`${id}-root`} style={{ textAlign: 'left', ...rootProps?.style }}>
      {children}
    </div>
  );
});

InputRoot.displayName = 'InputRoot';

export const InputFormControl = React.memo(({ children, ...props }: FormControlProps) => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const divider = get('divider');
  const id = useInputId();
  const readOnly = get('readOnly');

  return (
    <FormControl
      id={`${id}-form`}
      component="form"
      size="small"
      fullWidth
      {...(readOnly && !disabled && { isFocused: null })}
      {...props}
      onSubmit={e => e.preventDefault()}
      sx={{
        ...props?.sx,
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
      {children}
    </FormControl>
  );
});

InputFormControl.displayName = 'InputFormControl';

/**********************************************************************************************************************
 * Labels and HelperText
 *********************************************************************************************************************/
type InputRequiredBadgeProps = {
  children?: React.ReactNode;
  ignoreRequired?: boolean;
};

export const InputRequiredBadge = React.memo(({ children, ignoreRequired = false }: InputRequiredBadgeProps) => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const badge = get('badge');
  const overflowHidden = get('overflowHidden');

  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!badge || ignoreRequired}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      sx={{
        ...(overflowHidden && {
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden'
        }),
        '& .MuiBadge-badge': {
          right: theme.spacing(-1),
          top: theme.spacing(0.5)
        }
      }}
    >
      <span
        style={
          !overflowHidden
            ? null
            : {
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                maxWidth: '100%'
              }
        }
      >
        {children}
      </span>
    </Badge>
  );
});

InputRequiredBadge.displayName = 'InputRequiredBadge';

export const InputFormLabel = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isFocused = get('isFocused');
  const label = useInputLabel();
  const labelProps = get('labelProps');
  const loading = get('loading');
  const overflowHidden = get('overflowHidden');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const validationStatus = get('validationStatus');

  const color = useMemo<TypographyProps['color']>(() => {
    if (!preventDisabledColor && (disabled || loading)) {
      return 'textDisabled';
    }

    switch (validationStatus) {
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
        if (isFocused) return 'primary';
        if (readOnly) return 'textSecondary';
        return 'textSecondary';
    }
  }, [disabled, isFocused, loading, preventDisabledColor, readOnly, validationStatus]);

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Typography
        color={color}
        component={InputLabel}
        gutterBottom
        htmlFor={id}
        variant="body2"
        whiteSpace="nowrap"
        {...labelProps}
        sx={{
          ...(!overflowHidden && { whiteSpace: 'normal' }),
          ...(disabled &&
            !preventDisabledColor && {
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
            }),
          ...labelProps?.sx
        }}
      >
        <InputRequiredBadge>{label}</InputRequiredBadge>
      </Typography>
    </Tooltip>
  );
});

InputFormLabel.displayName = 'InputFormLabel';

export const InputHelperText = React.memo(() => {
  const theme = useTheme();
  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const helperText = get('helperText');
  const helperTextProps = get('helperTextProps');
  const id = useInputId();
  const loading = get('loading');
  const readOnly = get('readOnly');
  const validationMessage = get('validationMessage');
  const validationStatus = get('validationStatus');

  // Do not render helper text in non-interactive states
  if (disabled || loading || readOnly) return null;

  // No validation feedback to display
  if (!validationStatus || !helperText) return null;

  const color = (() => {
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
        return theme.palette.text.secondary;
    }
  })();

  const Icon = (() => {
    switch (validationStatus) {
      case 'success':
        return CheckCircleOutlinedIcon;
      case 'info':
        return InfoOutlinedIcon;
      case 'warning':
        return WarningAmberOutlinedIcon;
      case 'error':
        return ErrorOutlineOutlinedIcon;
      default:
        return null;
    }
  })();

  return (
    <FormHelperText
      id={`${id}-helper-text`}
      component="div"
      variant="outlined"
      {...helperTextProps}
      sx={{
        color,
        marginLeft: 0,
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        ...helperTextProps?.sx
      }}
    >
      {Icon && <Icon fontSize="small" />}

      <span>{validationMessage ?? helperText}</span>
    </FormHelperText>
  );
});

InputHelperText.displayName = 'InputHelperText';

/**********************************************************************************************************************
 * List
 *********************************************************************************************************************/

export type InputListItemProps = {
  button?: boolean;
  children?: React.ReactNode;
  buttonProps?: ListItemButtonProps;
  itemProps?: ListItemProps;
};

export const InputListItem: React.FC<InputListItemProps> = React.memo(
  ({ button = false, children = null, buttonProps = null, itemProps = null }: InputListItemProps) => {
    switch (button) {
      case true:
        return <ListItemButton role={undefined} {...buttonProps} children={children} />;
      case false:
        return <ListItem {...itemProps} children={children} />;
      default:
        return null;
    }
  }
);

InputListItem.displayName = 'InputListItem';

export const InputListItemText = React.memo(({ primary, secondary = null, ...props }: ListItemTextProps) => {
  const [get] = usePropStore<InputControllerProps>();

  const capitalize = get('capitalize');
  const isPasswordVisible = get('isPasswordVisible');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const tiny = get('tiny');

  return (
    <ListItemText
      primary={primary}
      secondary={secondary}
      {...props}
      slotProps={{
        ...props?.slotProps,
        primary: {
          ...props?.slotProps?.primary,
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(capitalize && { textTransform: 'capitalize' }),
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
          }
        },
        secondary: {
          ...props?.slotProps?.secondary,
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
          }
        }
      }}
      sx={{
        marginTop: 'initial',
        marginBottom: 'initial',
        ...(password &&
          isPasswordVisible && {
            wordBreak: 'break-all',
            fontFamily: 'password',
            WebkitTextSecurity: 'disc',
            MozTextSecurity: 'disc',
            textSecurity: 'disc'
          }),
        ...props?.sx
      }}
    />
  );
});

InputListItemText.displayName = 'InputListItemText';
