/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';

/**
 * Returns the label for an input, or a non-breaking space if not defined
 */
export const useInputLabel = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  return get('label') ?? '\u00A0';
};

/**
 * Returns a deterministic input ID, using label if ID not defined
 */
export const useInputId = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const id = get('id');
  const label = get('label');
  return id ?? (typeof label === 'string' ? label.toLowerCase().replaceAll(' ', '-') : '\u00A0');
};

/**
 * Returns whether the clear/reset button should be rendered
 */
export const useShouldRenderClear = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const showClearButton = get('showClearButton');
  return Boolean(showClearButton) && !readOnly && !disabled;
};

/**
 * Returns whether the expand button should be rendered
 */
export const useShouldRenderExpand = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const expand = get('expand');
  return Boolean(expand);
};

/**
 * Returns whether the menu adornment should be rendered
 */
export const useShouldRenderMenu = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const hasMenuAdornment = get('hasMenuAdornment');
  return Boolean(hasMenuAdornment) && !readOnly && !disabled;
};

/**
 * Returns whether the spinner should be rendered
 */
export const useShouldRenderNumericalSpinner = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const showNumericalSpinner = get('showNumericalSpinner');
  return Boolean(showNumericalSpinner) && !readOnly && !disabled;
};

/**
 * Returns whether the password toggle should be rendered
 */
export const useShouldRenderPassword = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const loading = get('loading');
  const password = get('password');
  const readOnly = get('readOnly');
  return Boolean(password) && !loading && !disabled && !readOnly;
};

/**
 * Returns whether the reset button should be rendered
 */
export const useShouldRenderReset = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const loading = get('loading');
  const readOnly = get('readOnly');
  const reset = get('reset');
  const rawValue = get('rawValue');
  const value = get('value');

  const canReset = typeof reset === 'function' ? reset(value, rawValue) : reset;
  return Boolean(canReset) && !disabled && !readOnly && !loading;
};

/**
 * Returns whether any adornment should be rendered
 */
export const useShouldRenderAdornments = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps>();

  const endAdornment = get('endAdornment');

  const shouldRenderClear = useShouldRenderClear<Value, RawValue>();
  const shouldRenderExpand = useShouldRenderExpand<Value, RawValue>();
  const shouldRenderMenu = useShouldRenderMenu<Value, RawValue>();
  const shouldRenderSpinner = useShouldRenderNumericalSpinner<Value, RawValue>();
  const shouldRenderPassword = useShouldRenderPassword<Value, RawValue>();
  const shouldRenderReset = useShouldRenderReset<Value, RawValue>();

  return (
    endAdornment ||
    shouldRenderClear ||
    shouldRenderExpand ||
    shouldRenderMenu ||
    shouldRenderSpinner ||
    shouldRenderPassword ||
    shouldRenderReset
  );
};
