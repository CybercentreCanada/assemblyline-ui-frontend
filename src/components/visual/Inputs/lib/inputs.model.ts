import type { FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import type React from 'react';

export type InputValues<Value, InputValue = Value, Event = React.SyntheticEvent> = {
  value: Value;
  defaultValue?: Value;
  inputValue?: InputValue;
  error?: (value: Value) => string;
  onChange?: (event: Event, value: Value, ...other: unknown[]) => void;
};

export type InputProps = {
  badge?: boolean;
  capitalize?: boolean;
  disabled?: boolean;
  divider?: boolean;
  endAdornment?: React.ReactNode;
  errorProps?: FormHelperTextProps;
  expand?: boolean;
  expandProps?: IconButtonProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  id?: string;
  indeterminate?: boolean;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  monospace?: boolean;
  overflowHidden?: boolean;
  password?: boolean;
  placeholder?: string;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  required?: boolean;
  reset?: boolean;
  resetProps?: IconButtonProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  startAdornment?: React.ReactNode;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  onBlur?: (event: React.SyntheticEvent | Event) => void;
  onError?: (error: string) => void;
  onExpand?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onFocus?: (event: React.SyntheticEvent | Event) => void;
  onReset?: IconButtonProps['onClick'];
};

export const DEFAULT_INPUT_PROPS: InputProps = {
  badge: false,
  capitalize: false,
  disabled: false,
  divider: false,
  endAdornment: null,
  errorProps: null,
  expand: null,
  expandProps: null,
  helperText: null,
  helperTextProps: null,
  id: null,
  label: null,
  labelProps: null,
  loading: false,
  monospace: false,
  overflowHidden: false,
  password: false,
  placeholder: null,
  preventDisabledColor: false,
  preventRender: false,
  readOnly: false,
  required: false,
  reset: false,
  resetProps: null,
  rootProps: null,
  startAdornment: null,
  tiny: false,
  tooltip: null,
  tooltipProps: null,

  onBlur: () => null,
  onError: () => null,
  onExpand: () => null,
  onFocus: () => null,
  onReset: null
};

export type InputStates = {
  errorMsg?: string;
  focused?: boolean;
  inputValue?: unknown;
  preventExpandRender?: boolean;
  preventPasswordRender?: boolean;
  preventResetRender?: boolean;
  preventSpinnerRender?: boolean;
  showPassword?: boolean;
};

export const DEFAULT_INPUT_STATES: InputStates = {
  errorMsg: null,
  focused: false,
  preventSpinnerRender: true,
  showPassword: true
  // inputValue: null
};
