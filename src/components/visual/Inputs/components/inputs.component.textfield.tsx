import type { AutocompleteProps, AutocompleteRenderInputParams, TextFieldProps } from '@mui/material';
import { Autocomplete, InputAdornment, TextField, useTheme } from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { CustomChipProps } from 'components/visual/CustomChip';
import { CustomChip } from 'components/visual/CustomChip';
import {
  ClearInputAdornment,
  HelpInputAdornment,
  InputEndAdornment,
  NumericalSpinnerInputAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { useInputId, useInputLabel } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import type { ValidationStatus } from 'components/visual/Inputs/utils/inputs.util.validation';
import React, { useMemo } from 'react';

export const useInputTextFieldSlots = (overrides?: Partial<TextFieldProps>) => {
  const theme = useTheme();
  const [get] = usePropStore<InputControllerProps & { autoComplete?: TextFieldProps['autoComplete'] }>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const helperText = get('helperText');
  const id = useInputId();
  const isPasswordVisible = get('isPasswordVisible');
  const label = useInputLabel();
  const loading = get('loading');
  const monospace = get('monospace');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');
  const tiny = get('tiny');
  const validationStatus = get('validationStatus');

  return useMemo<TextFieldProps>(
    () => ({
      'aria-label': label,
      ...(disabled || loading || readOnly
        ? null
        : helperText || validationStatus === 'error'
          ? { 'aria-describedby': `${id}-helper-text` }
          : null),
      autoComplete: autoComplete,
      disabled: disabled,
      error: validationStatus === 'error',
      fullWidth: true,
      id: id,
      margin: 'dense',
      size: 'small',
      variant: 'outlined',
      ...(readOnly && !disabled && { isFocused: null }),
      ...overrides,
      slotProps: {
        ...overrides?.slotProps,
        input: {
          placeholder,
          readOnly,
          startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
          ...overrides?.slotProps?.input
        }
      },
      InputProps: {
        placeholder,
        readOnly,
        startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
        ...overrides?.InputProps
      },
      sx: [
        {
          margin: 0,
          '& .MuiInputBase-root': {
            minHeight: '32px',
            paddingRight: '9px !important',
            ...(tiny && {
              paddingTop: '2px !important',
              paddingBottom: '2px !important',
              fontSize: '14px'
            }),
            ...(readOnly && !disabled && { cursor: 'default' })
          },
          '& .MuiInputBase-input': {
            paddingRight: '4px',
            ...(overflowHidden && {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }),
            ...(readOnly && !disabled && { cursor: 'default' }),
            ...(monospace && { fontFamily: 'monospace' }),
            ...(tiny && {
              paddingTop: '2.5px ',
              paddingBottom: '2.5px '
            }),
            ...(password &&
              isPasswordVisible && {
                fontFamily: 'password',
                WebkitTextSecurity: 'disc',
                MozTextSecurity: 'disc',
                textSecurity: 'disc'
              })
          },
          '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            ...(readOnly &&
              !disabled && {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
              })
          },
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0
          },
          '& input[type=number]': {
            MozAppearance: 'textfield'
          }
        },
        ...(Array.isArray(overrides?.sx) ? overrides.sx : overrides?.sx ? [overrides.sx] : [])
      ]
    }),
    [
      label,
      disabled,
      loading,
      readOnly,
      helperText,
      validationStatus,
      id,
      autoComplete,
      overrides,
      placeholder,
      startAdornment,
      tiny,
      overflowHidden,
      monospace,
      password,
      isPasswordVisible,
      theme.palette.mode
    ]
  );
};

export type InputTextFieldProps = TextFieldProps & {
  params?: AutocompleteRenderInputParams;
};

export const InputTextField = React.memo(({ params, ...props }: InputTextFieldProps) => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const endAdornment = get('endAdornment');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');
  const validationStatus = get('validationStatus');

  const inputTextFieldSlots = useInputTextFieldSlots();

  const validationColorMap = useMemo<Record<ValidationStatus, { main: string; contrast?: string }>>(
    () => ({
      error: { main: theme.palette.error.main },
      warning: { main: theme.palette.warning.main },
      success: { main: theme.palette.success.main },
      info: { main: theme.palette.info.main },
      default: { main: theme.palette.text.secondary }
    }),
    [
      theme.palette.error.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.text.secondary,
      theme.palette.warning.main
    ]
  );

  const getValidationSx = (status?: ValidationStatus) => {
    if (!status || status === 'default') return {};

    const color = validationColorMap[status].main;

    return {
      // Label
      '& .MuiInputLabel-root': {
        color
      },
      '& .MuiInputLabel-root.Mui-isFocused': {
        color
      },

      // Outline (outlined variant)
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: `${color} !important`
        },
        '&:hover fieldset': {
          borderColor: `${color} !important`
        },
        '&.Mui-isFocused fieldset': {
          borderColor: `${color} !important`
        }
      },

      // Input text (optional)
      '& .MuiInputBase-input': {
        color: status === 'error' ? undefined : 'text.primary'
      },

      // Helper text
      '& .MuiFormHelperText-root': {
        color
      }
    };
  };

  return (
    <TextField
      {...inputTextFieldSlots}
      {...params}
      {...props}
      sx={[
        getValidationSx(validationStatus),
        ...(Array.isArray(inputTextFieldSlots?.sx)
          ? (inputTextFieldSlots.sx as unknown[])
          : inputTextFieldSlots?.sx
            ? [inputTextFieldSlots.sx as unknown]
            : []),
        ...(Array.isArray(props?.sx) ? (props.sx as unknown[]) : props?.sx ? [props.sx as unknown] : [])
      ]}
      slotProps={{
        ...inputTextFieldSlots?.slotProps,
        ...props?.slotProps,
        inputLabel: {
          ...props?.slotProps?.inputLabel,
          ...params?.InputLabelProps
        },
        input: {
          ...inputTextFieldSlots?.slotProps?.input,
          ...props?.slotProps?.input,
          ...params?.InputProps,
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: (
            <>
              {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
              {params?.InputProps?.startAdornment}
            </>
          ),
          endAdornment: (
            <InputEndAdornment preventRender={!props?.slotProps?.input?.['endAdornment']}>
              {props?.slotProps?.input?.['endAdornment']}
              {endAdornment}
              <HelpInputAdornment />
              <PasswordInputAdornment />
              <ProgressInputAdornment />
              <ResetInputAdornment />
              <NumericalSpinnerInputAdornment />
              <ClearInputAdornment />
            </InputEndAdornment>
          )
        }
      }}
    />
  );
});

InputTextField.displayName = 'InputTextField';

export type InputAutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> = AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>;

export const InputAutocomplete = <
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
>({
  ...props
}: InputAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const [get] = usePropStore<InputAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const id = useInputId();
  const options = get('options') ?? [];
  const readOnly = get('readOnly');

  return (
    <Autocomplete
      id={id}
      autoComplete={autoComplete}
      disableClearable
      disabled={disabled}
      freeSolo
      fullWidth
      options={options}
      readOnly={readOnly}
      size="small"
      {...props}
    />
  );
};

InputAutocomplete.displayName = 'InputAutocomplete';

export const InputCustomChip = React.memo(({ label, onDelete = () => null, sx, ...props }: CustomChipProps) => {
  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const isPasswordVisible = get('isPasswordVisible');
  const monospace = get('monospace');
  const password = get('password');
  const readOnly = get('readOnly');

  return (
    <CustomChip
      label={label}
      wrap
      size="small"
      {...props}
      onDelete={disabled || readOnly ? undefined : onDelete}
      sx={{
        ...(readOnly && !disabled && { cursor: 'default', userSelect: 'text' }),
        ...(monospace && { fontFamily: 'monospace' }),
        ...(password &&
          isPasswordVisible && {
            wordBreak: 'break-all',
            fontFamily: 'password',
            WebkitTextSecurity: 'disc',
            MozTextSecurity: 'disc',
            textSecurity: 'disc'
          }),
        ...sx
      }}
    />
  );
});

InputCustomChip.displayName = 'InputCustomChip';
