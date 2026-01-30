import type { IconButtonProps } from '@mui/material';
import type React from 'react';

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
