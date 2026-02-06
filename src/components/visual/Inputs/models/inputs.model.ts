import type {
  CircularProgressProps,
  FormControlProps,
  FormHelperTextProps,
  SkeletonProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import type { IconButtonProps } from 'components/visual/Buttons/IconButton';
import type {
  Coercer,
  CoercersSchema,
  ValidationSchema,
  ValidationStatus,
  Validator
} from 'components/visual/Inputs/utils/inputs.util.validation';
import type React from 'react';

/**********************************************************************************************************************
 * Input Value Model (controlled data + validation behavior)
 *********************************************************************************************************************/
export type InputValueModel<Value, Event = React.SyntheticEvent> = {
  /**
   * Optional coercion function used to normalize raw values
   * (e.g. trimming strings, clamping numbers, etc.)
   */
  coerce?: Coercer<Value>;

  /**
   * Schema extension hook for coercion pipeline
   */
  coercers?: (schema: CoercersSchema<Value>) => CoercersSchema<Value>;

  /**
   * The default value used when the input is reset
   */
  defaultValue?: Value;

  /**
   * Controls whether the reset / clear button should be visible
   * @default false
   */
  reset?: boolean | ((value: Value) => boolean);

  /**
   * Validation function returning a validation result
   */
  validate?: Validator<Value>;

  /**
   * Schema extension hook for validation pipeline
   */
  validators?: (schema: ValidationSchema<Value>) => ValidationSchema<Value>;

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

export const DEFAULT_INPUT_VALUE_MODEL: InputValueModel<unknown> = {
  coerce: (event, value) => ({ value, ignore: false }),
  coercers: s => s,
  defaultValue: null,
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
   * If `true`, shows the help button
   * @default false
   */
  help?: `/${string}` | `${'http' | 'https'}://${string}`;

  /**
   * Helper / description text displayed under the input
   */
  helperText?: string;

  /**
   * The id of the input element
   */
  id?: string;

  /**
   * The label content
   */
  label?: string;

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
   * shows the progress spinner with a tooltip of the progress value
   */
  progress?: string;

  /**
   * If `true`, the input is read-only
   * @default false
   */
  readOnly?: boolean;

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
  help: null,
  helperText: null,
  id: null,
  label: null,
  loading: false,
  monospace: false,
  overflowHidden: false,
  password: false,
  placeholder: null,
  preventDisabledColor: false,
  preventRender: false,
  progress: null,
  readOnly: false,
  startAdornment: null,
  tiny: false,
  tooltip: null,

  onBlur: () => null,
  onExpand: () => null,
  onFocus: () => null
};

/**********************************************************************************************************************
 * Input Runtime State (UI state managed internally)
 *********************************************************************************************************************/
export type InputRuntimeState<RawValue> = {
  /**
   * The raw user-entered value (may differ from `value`)
   */
  rawValue?: RawValue;

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
  showNumericalSpinner?: boolean;

  /**
   * Current validation message
   */
  validationMessage: string | null;

  /**
   * Current validation status
   */
  validationStatus: ValidationStatus;
};

export const DEFAULT_INPUT_RUNTIME_STATE: InputRuntimeState<unknown> = {
  rawValue: null,
  hasMenuAdornment: false,
  isFocused: false,
  isMenuOpen: false,
  isPasswordVisible: true,
  showClearButton: false,
  showNumericalSpinner: false,
  validationMessage: null,
  validationStatus: null
};

/**********************************************************************************************************************
 * Input Slot Props
 *********************************************************************************************************************/
export type InputSlotProps = {
  slotProps?: {
    clearAdornment?: IconButtonProps;
    expandAdornment?: IconButtonProps;
    formControl?: FormControlProps;
    formLabel?: TypographyProps;
    formLabelTooltip?: Omit<TooltipProps, 'children' | 'title'>;
    helpAdornment?: IconButtonProps;
    helperText?: FormHelperTextProps;
    menuAdornment?: IconButtonProps;
    passwordAdornment?: IconButtonProps;
    progressAdornment?: CircularProgressProps;
    resetAdornment?: IconButtonProps;
    root?: React.HTMLAttributes<HTMLDivElement>;
    skeleton?: SkeletonProps;
  };
};

export const DEFAULT_INPUT_SLOT_PROPS: InputSlotProps = {
  slotProps: {
    clearAdornment: null,
    expandAdornment: null,
    formControl: null,
    formLabel: null,
    formLabelTooltip: null,
    helpAdornment: null,
    helperText: null,
    menuAdornment: null,
    passwordAdornment: null,
    progressAdornment: null,
    resetAdornment: null,
    root: null,
    skeleton: null
  }
};

/**********************************************************************************************************************
 * Combined Internal Controller Props
 *********************************************************************************************************************/
export type InputControllerProps<Value = unknown, RawValue = Value> = InputValueModel<Value> &
  InputOptions &
  InputRuntimeState<RawValue> &
  InputSlotProps;

export const DEFAULT_INPUT_CONTROLLER_PROPS: InputControllerProps = {
  ...DEFAULT_INPUT_VALUE_MODEL,
  ...DEFAULT_INPUT_OPTIONS,
  ...DEFAULT_INPUT_RUNTIME_STATE,
  ...DEFAULT_INPUT_SLOT_PROPS
};
