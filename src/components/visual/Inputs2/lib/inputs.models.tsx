import type { FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import type React from 'react';

export type ValidationState = 'default' | 'info' | 'success' | 'warning' | 'error';

export const VALIDATION_PRIORITY: ValidationState[] = ['error', 'warning', 'success', 'info', 'default'];

export type ValidationStatus = {
  state?: ValidationState;
  message?: string;
};

export type InputValues<Value, InputValue = Value, Event = React.SyntheticEvent> = {
  /**
   * The current value of the input
   */
  value: Value;

  /**
   * The default value of the input
   */
  defaultValue?: Value;

  /**
   * The raw user-entered value (may differ from `value`)
   */
  inputValue?: InputValue;

  // parser?: (inputValue: InputValue) => InputValue;

  /**
   * If `true`, shows a reset/clear button
   * @default false
   */
  reset?: boolean | ((value: Value, inputValue: InputValue) => boolean);

  /**
   * Validation function that returns an error message string
   * when the value is invalid
   */
  error?: (value: Value) => string;

  /**
   * Callback fired when the value changes
   *
   * @param event The React event
   * @param value The new value
   * @param other Additional arguments
   */
  onChange?: (event: Event, value: Value, ...other: unknown[]) => void;

  /**
   * Callback fired when the reset button is clicked
   */
  onReset?: IconButtonProps['onClick'];

  onValidate?: (event: Event, inputValue: InputValue) => ValidationStatus;
};

export const DEFAULT_INPUT_VALUES: InputValues<unknown, unknown> = {
  defaultValue: null,
  error: () => null,
  inputValue: null,
  reset: () => false,
  value: null,
  onChange: () => null,
  onReset: null
};

export type InputProps = {
  /**
   * If `true`, a small badge indicator is shown
   * @default false
   */
  badge?: boolean;

  /**
   * If `true`, text will be automatically capitalized
   * @default false
   */
  capitalize?: boolean;

  /**
   * If `true`, the input will be disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * If `true`, renders a divider under/around the input
   * @default false
   */
  divider?: boolean;

  /**
   * Element rendered at the end (e.g. icon, button)
   */
  endAdornment?: React.ReactNode;

  /**
   * When enabled, the input will only propagate valid values.
   */
  enforceValidValue?: boolean;

  /**
   * Props applied to the error helper text
   */
  errorProps?: FormHelperTextProps;

  /**
   * If `true`, shows an expand/collapse button
   * @default false
   */
  expand?: boolean;

  /**
   * Props applied to the expand/collapse button
   */
  expandProps?: IconButtonProps;

  /**
   * The helper/description text displayed under the input
   */
  helperText?: string;

  /**
   * Props applied to the helper text component
   */
  helperTextProps?: FormHelperTextProps;

  /**
   * The id of the input element
   */
  id?: string;

  /**
   * The label content
   */
  label?: string;

  /**
   * Props applied to the label typography
   */
  labelProps?: TypographyProps;

  /**
   * If `true`, shows a loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * If `true`, renders input text in monospace font
   * @default false
   */
  monospace?: boolean;

  /**
   * If `true`, hides text overflow
   * @default false
   */
  overflowHidden?: boolean;

  /**
   * If `true`, the input behaves as a password field
   * @default false
   */
  password?: boolean;

  /**
   * The short hint displayed in the input before the user enters a value
   */
  placeholder?: string;

  /**
   * If `true`, disables the default greyed-out style when disabled
   * @default false
   */
  preventDisabledColor?: boolean;

  /**
   * If `true`, prevents the input from rendering
   * @default false
   */
  preventRender?: boolean;

  /**
   * If `true`, the input is read-only
   * @default false
   */
  readOnly?: boolean;

  /**
   * If `true`, marks the input as required
   * @default false
   */
  required?: boolean;

  /**
   * Props applied to the reset button
   */
  resetProps?: IconButtonProps;

  /**
   * Props applied to the root container element
   */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;

  /**
   * Element rendered at the start (e.g. icon)
   */
  startAdornment?: React.ReactNode;

  /**
   * If `true`, applies a compact "tiny" style
   * @default false
   */
  tiny?: boolean;

  /**
   * Tooltip content to display on hover
   */
  tooltip?: TooltipProps['title'];

  /**
   * Props applied to the tooltip component
   */
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;

  /**
   * Callback fired when the input loses focus
   */
  onBlur?: (event: React.SyntheticEvent | Event) => void;

  /**
   * Callback fired when validation fails
   */
  onError?: (error: string) => void;

  /**
   * Callback fired when the expand button is clicked
   */
  onExpand?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

  /**
   * Callback fired when the input gains focus
   */
  onFocus?: (event: React.SyntheticEvent | Event) => void;
};

export const DEFAULT_INPUT_PROPS: InputProps = {
  badge: false,
  capitalize: false,
  disabled: false,
  divider: false,
  endAdornment: null,
  enforceValidValue: false,
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
  resetProps: null,
  rootProps: null,
  startAdornment: null,
  tiny: false,
  tooltip: null,
  tooltipProps: null,

  onBlur: () => null,
  onError: () => null,
  onExpand: () => null,
  onFocus: () => null
};

export type InputStates = {
  /**
   * If `true`, the clear adornment is visible
   * @default false
   */
  clearAdornment?: boolean;

  /**
   * The current error message to display below the input.
   */
  errorMessage?: string;

  /**
   * If `true`, the input is focused
   * @default false
   */
  focused?: boolean;

  /**
   * If `true`, this input has a menu end adornment
   * @default false
   */
  menuAdornment?: boolean;

  /**
   * If `true`, the menu is opened
   * @default false
   */
  showMenu?: boolean;

  /**
   * If `true`, the password is visible
   * @default true
   */
  showPassword?: boolean;

  /**
   * If `true`, the spinner adornment is visible
   * @default false
   */
  spinnerAdornment?: boolean;
};

export const DEFAULT_INPUT_STATES: InputStates = {
  clearAdornment: false,
  errorMessage: null,
  focused: false,
  menuAdornment: false,
  showMenu: false,
  showPassword: true,
  spinnerAdornment: false
};

export type InputModel<Value, InputValue = Value, Event = React.SyntheticEvent> = InputValues<
  Value,
  InputValue,
  Event
> &
  InputProps &
  InputStates;

export type InputModelWithChildren<Value, InputValue = Value, Event = React.SyntheticEvent> = {
  children: React.ReactNode;
} & InputModel<Value, InputValue, Event>;
