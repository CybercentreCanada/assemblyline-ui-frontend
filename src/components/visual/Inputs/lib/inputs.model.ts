import type { FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { createStoreContext } from 'components/core/store/createStoreContext';
import type React from 'react';

export type InputProps<Type> = {
  defaultValue?: Type;
  disabled?: boolean;
  divider?: boolean;
  endAdornment?: React.ReactNode;
  error?: (value: Type) => string;
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
  password?: boolean;
  placeholder?: string;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  required?: boolean;
  reset?: boolean;
  resetProps?: IconButtonProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  showOverflow?: boolean;
  startAdornment?: React.ReactNode;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: Type;
  onBlur?: (event: React.SyntheticEvent | Event) => void;
  onChange?: (event: React.SyntheticEvent | Event, value: Type, ...other: unknown[]) => void;
  onError?: (error: string) => void;
  onExpand?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onFocus?: (event: React.SyntheticEvent | Event) => void;
  onReset?: IconButtonProps['onClick'];
};

export type InputStates<Type> = {
  ariaLabel?: string;
  ariaDescribeBy?: string;
  errorMsg?: string;
  focused?: boolean;
  inputValue?: Type;
  label?: string;
  preventExpandRender?: boolean;
  preventPasswordRender?: boolean;
  preventResetRender?: boolean;
  showPassword?: boolean;

  handleBlur?: (event: React.SyntheticEvent) => void;
  handleChange?: (event: React.SyntheticEvent, value: Type) => void;
  handleFocus?: (event: React.SyntheticEvent) => void;
  togglePassword?: (event: React.SyntheticEvent) => void;
};

export type InputData<Type> = InputProps<Type> & InputStates<Type>;

export type ComponentProps<T, P> = {
  children?: React.ReactNode;
  useStore: ReturnType<typeof createStoreContext<InputData<T>>>['useStore'];
};

export const DEFAULT_INPUT_DATA: InputData<undefined> = {
  defaultValue: undefined,
  disabled: false,
  divider: false,
  endAdornment: null,
  error: () => '',
  errorProps: null,
  expand: null,
  expandProps: null,
  helperText: null,
  helperTextProps: null,
  id: '',
  indeterminate: false,
  label: '',
  labelProps: null,
  loading: false,
  monospace: false,
  password: false,
  placeholder: null,
  preventDisabledColor: false,
  preventRender: false,
  readOnly: false,
  required: false,
  reset: false,
  resetProps: null,
  rootProps: null,
  showOverflow: false,
  startAdornment: null,
  tiny: false,
  tooltip: null,
  tooltipProps: null,
  value: undefined,

  onBlur: () => null,
  onChange: () => null,
  onError: () => null,
  onExpand: () => null,
  onFocus: () => null,
  onReset: () => null

  // ariaLabel: '',
  // ariaDescribeBy: '',
  // errorMsg: null,
  // focused: false,
  // inputValue: undefined,
  // preventExpandRender: false,
  // preventPasswordRender: false,
  // preventResetRender: false,
  // showPassword: false

  // handleBlur: () => null,
  // handleChange: () => null,
  // handleFocus: () => null,
  // togglePassword: () => null
};
