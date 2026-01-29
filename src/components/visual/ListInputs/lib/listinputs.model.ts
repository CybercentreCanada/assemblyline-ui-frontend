import type { FormHelperTextProps, IconButtonProps, ListItemTextProps, TypographyProps } from '@mui/material';
import type {
  CoercersSchema,
  ValidationSchema,
  ValidationStatus
} from 'components/visual/Inputs/lib/inputs.validation';
import type React from 'react';
import type { CSSProperties } from 'react';

/**********************************************************************************************************************
 * List Input Value Model (controlled data + validation behavior)
 *********************************************************************************************************************/
export type ListInputValueModel<Value, RawValue = Value, Event = React.SyntheticEvent> = {
  /**
   * Optional coercion function used to normalize raw values
   * (e.g. trimming strings, clamping numbers, etc.)
   */
  coerce?: (event: React.SyntheticEvent, value: Value, rawValue: RawValue) => Value;

  /**
   * Schema extension hook for coercion pipeline
   */
  coercers?: (schema: CoercersSchema<Value, RawValue>) => CoercersSchema<Value, RawValue>;

  /**
   * The default value used when the input is reset
   */
  defaultValue?: Value;

  /**
   * The raw user-entered value (may differ from `value`)
   */
  rawValue?: RawValue;

  /**
   * Controls whether the reset / clear button should be visible
   * @default false
   */
  reset?: boolean | ((value: Value, rawValue: RawValue) => boolean);

  /**
   * Validation function returning a validation result
   */
  validate?: (value: Value, rawValue: RawValue) => { status: ValidationStatus; message: string };

  /**
   * Schema extension hook for validation pipeline
   */
  validators?: (schema: ValidationSchema<Value, RawValue>) => ValidationSchema<Value, RawValue>;

  /**
   * The current parsed / committed value of the input
   */
  value: Value;

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
};

export const DEFAULT_LIST_INPUT_VALUE_MODEL: ListInputValueModel<unknown, unknown> = {
  coerce: v => v,
  coercers: s => s,
  defaultValue: null,
  rawValue: null,
  reset: () => false,
  validate: () => ({ status: 'default', message: null }),
  validators: s => s,
  value: null,
  onChange: null,
  onReset: null
};

/**********************************************************************************************************************
 * List Input Options (visual + behavioral configuration)
 *********************************************************************************************************************/
export type ListInputOptions = {
  /**
   * If `true`, a small badge indicator is shown.
   * @default false
   */
  badge?: boolean;

  /**
   * If `true`, text will be automatically capitalized.
   * @default false
   */
  capitalize?: boolean;

  /**
   * If `true`, the input will be disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * If `true`, renders a divider under/around the input.
   * @default false
   */
  divider?: boolean;

  /**
   * Element rendered at the end (e.g. icon, button).
   */
  endAdornment?: React.ReactNode;

  /**
   * If `true`, shows an expand/collapse button.
   * @default false
   */
  expand?: boolean;

  /**
   * Props applied to the expand/collapse button.
   */
  expandProps?: IconButtonProps;

  /**
   * The helper/description text displayed under the input.
   */
  helperText?: string;

  /**
   * Props applied to the helper text component.
   */
  helperTextProps?: FormHelperTextProps;

  /**
   * The id of the input element.
   */
  id?: string;

  /**
   * If `true`, applies an inset layout to the list item content.
   * @default false
   */
  inset?: boolean;

  /**
   * If `true`, shows a loading spinner.
   * @default false
   */
  loading?: boolean;

  /**
   * If `true`, renders input text in monospace font.
   * @default false
   */
  monospace?: boolean;

  /**
   * If `true`, hides text overflow.
   * @default false
   */
  overflowHidden?: boolean;

  /**
   * If `true`, the input behaves as a password field.
   * @default false
   */
  password?: boolean;

  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;

  /**
   * The primary text content of the list item.
   */
  primary?: ListItemTextProps['primary'];

  /**
   * Props applied to the primary text typography.
   */
  primaryProps?: TypographyProps;

  /**
   * If `true`, disables the default greyed-out style when disabled.
   * @default false
   */
  preventDisabledColor?: boolean;

  /**
   * If `true`, prevents the input from rendering.
   * @default false
   */
  preventRender?: boolean;

  /**
   * If `true`, the input is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Props applied to the reset button.
   */
  resetProps?: IconButtonProps;

  /**
   * The secondary text content of the list item.
   */
  secondary?: ListItemTextProps['secondary'];

  /**
   * Props applied to the secondary text typography.
   */
  secondaryProps?: TypographyProps;

  /**
   * Element rendered at the start (e.g. icon).
   */
  startAdornment?: React.ReactNode;

  /**
   * If `true`, applies a compact "tiny" style.
   * @default false
   */
  tiny?: boolean;

  /**
   * Maximum width of the list item.
   */
  width?: CSSProperties['maxWidth'];

  /**
   * Callback fired when the input loses focus.
   */
  onBlur?: (event: React.SyntheticEvent | Event) => void;

  /**
   * Callback fired when the input gains focus.
   */
  onFocus?: (event: React.SyntheticEvent | Event) => void;
};

export const DEFAULT_LIST_INPUT_OPTIONS: ListInputOptions = {
  badge: false,
  capitalize: false,
  disabled: false,
  divider: false,
  endAdornment: null,
  expand: null,
  helperText: null,
  helperTextProps: null,
  id: null,
  inset: false,
  loading: false,
  monospace: false,
  overflowHidden: false,
  password: false,
  placeholder: null,
  preventDisabledColor: false,
  preventRender: false,
  primary: null,
  primaryProps: null,
  readOnly: false,
  resetProps: null,
  secondary: null,
  secondaryProps: null,
  startAdornment: null,
  tiny: false,
  width: '30%',

  onBlur: () => null,
  onFocus: () => null
};

/**********************************************************************************************************************
 * List Input Runtime State (UI state managed internally)
 *********************************************************************************************************************/
export type ListInputRuntimeState = {
  /**
   * If `true`, the clear adornment is visible
   * @default false
   */
  hasClearAdornment?: boolean;

  /**
   * If `true`, the menu adornment is visible
   * @default false
   */
  hasMenuAdornment?: boolean;

  /**
   * Whether the input currently has focus
   * @default false
   */
  isFocused?: boolean;

  /**
   * Whether the dropdown / menu is open
   * @default false
   */
  isMenuOpen?: boolean;

  /**
   * Whether the password is currently visible
   * @default true
   */
  isPasswordVisible?: boolean;

  /**
   * Whether the clear/reset button is visible
   * @default false
   */
  showClearButton?: boolean;

  /**
   * Whether the spinner adornment is visible
   * @default false
   */
  showSpinner?: boolean;

  /**
   * Current validation message
   */
  validationMessage: string | null;

  /**
   * Current validation status
   */
  validationStatus: ValidationStatus;
};

export const DEFAULT_LIST_INPUT_RUNTIME_STATE: ListInputRuntimeState = {
  hasMenuAdornment: false,
  isFocused: false,
  isMenuOpen: false,
  isPasswordVisible: true,
  showClearButton: false,
  showSpinner: false,
  validationMessage: null,
  validationStatus: 'default'
};

/**********************************************************************************************************************
 * Combined Internal Controller Props
 *********************************************************************************************************************/
export type ListInputControllerProps<Value = unknown, RawValue = Value> = ListInputValueModel<Value, RawValue> &
  ListInputOptions &
  ListInputRuntimeState;

export const DEFAULT_LIST_INPUT_CONTROLLER_PROPS: ListInputControllerProps = {
  ...DEFAULT_LIST_INPUT_VALUE_MODEL,
  ...DEFAULT_LIST_INPUT_OPTIONS,
  ...DEFAULT_LIST_INPUT_RUNTIME_STATE
};
