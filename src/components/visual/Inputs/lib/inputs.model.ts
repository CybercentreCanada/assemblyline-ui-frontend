import type { FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import type {
  Coercer,
  CoercersSchema,
  ValidationSchema,
  ValidationStatus,
  Validator
} from 'components/visual/Inputs/lib/inputs.validation';
import type React from 'react';

/**********************************************************************************************************************
 * Input Value Model (controlled data + validation behavior)
 *********************************************************************************************************************/
export type InputValueModel<Value, RawValue = Value, Event = React.SyntheticEvent> = {
  /**
   * Optional coercion function used to normalize raw values
   * (e.g. trimming strings, clamping numbers, etc.)
   */
  coerce?: Coercer<Value, RawValue>;

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
  validate?: Validator<Value, RawValue>;

  /**
   * Schema extension hook for validation pipeline
   */
  validators?: (schema: ValidationSchema<Value, RawValue>) => ValidationSchema<Value, RawValue>;

  /**
   * The current parsed / committed value of the input
   */
  value: Value;

  /**
   * Callback fired when the parsed value changes
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

export const DEFAULT_INPUT_VALUE_MODEL: InputValueModel<unknown, unknown> = {
  coerce: (event, value) => ({ value, ignore: false }),
  coercers: s => s,
  defaultValue: null,
  rawValue: null,
  reset: () => false,
  validate: () => ({ status: 'default', message: null }),
  validators: s => s,
  value: null,
  onChange: () => null,
  onReset: null
};

/**********************************************************************************************************************
 * Input Options (visual + behavioral configuration)
 *********************************************************************************************************************/
export type InputOptions = {
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
   * If `true`, shows an expand/collapse button
   * @default false
   */
  expand?: boolean;

  /**
   * Props applied to the expand/collapse button
   */
  expandProps?: IconButtonProps;

  /**
   * Helper / description text displayed under the input
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
   * Placeholder text shown when the input is empty
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
   * Callback fired when the expand button is clicked
   */
  onExpand?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Callback fired when the input gains focus
   */
  onFocus?: (event: React.SyntheticEvent | Event) => void;
};

export const DEFAULT_INPUT_OPTIONS: InputOptions = {
  badge: false,
  capitalize: false,
  disabled: false,
  divider: false,
  endAdornment: null,
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
  resetProps: null,
  rootProps: null,
  startAdornment: null,
  tiny: false,
  tooltip: null,
  tooltipProps: null,

  onBlur: () => null,
  onExpand: () => null,
  onFocus: () => null
};

/**********************************************************************************************************************
 * Input Runtime State (UI state managed internally)
 *********************************************************************************************************************/
export type InputRuntimeState = {
  /**
   * Whether a menu adornment exists
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

export const DEFAULT_RUNTIME_STATE: InputRuntimeState = {
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
export type InputControllerProps<Value = unknown, RawValue = Value> = InputValueModel<Value, RawValue> &
  InputOptions &
  InputRuntimeState;

export const DEFAULT_INPUT_CONTROLLER_PROPS: InputControllerProps = {
  ...DEFAULT_INPUT_VALUE_MODEL,
  ...DEFAULT_INPUT_OPTIONS,
  ...DEFAULT_RUNTIME_STATE
};
