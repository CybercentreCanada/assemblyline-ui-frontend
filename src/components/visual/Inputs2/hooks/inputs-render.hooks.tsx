import type { InputModel } from 'components/visual/Inputs2/lib/inputs.models';
import { useMemo } from 'react';

/**********************************************************************************************************************
 * Determines whether the clear button should be rendered.
 *********************************************************************************************************************/
export const usePreventClearRender = <Value, InputValue>({
  clearAdornment,
  disabled,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !clearAdornment || (readOnly && !disabled), [clearAdornment, readOnly, disabled]);

/**********************************************************************************************************************
 * Determines whether the expand icon should be rendered.
 *********************************************************************************************************************/
export const usePreventExpandRender = <Value, InputValue>({ expand }: InputModel<Value, InputValue>): boolean =>
  useMemo(() => expand === null, [expand]);

/**********************************************************************************************************************
 * Determines whether the menu adornment should be rendered.
 *********************************************************************************************************************/
export const usePreventMenuRender = <Value, InputValue>({
  disabled,
  menuAdornment,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !menuAdornment || (readOnly && !disabled), [menuAdornment, readOnly, disabled]);

/**********************************************************************************************************************
 * Determines whether the password toggle should be rendered.
 *********************************************************************************************************************/
export const usePreventPasswordRender = <Value, InputValue>({
  disabled,
  loading,
  readOnly,
  password
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => loading || disabled || readOnly || !password, [loading, disabled, readOnly, password]);

/**********************************************************************************************************************
 * Determines whether the reset button should be rendered.
 *********************************************************************************************************************/
export const usePreventResetRender = <Value, InputValue>({
  disabled,
  inputValue,
  loading,
  readOnly,
  reset,
  value
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => {
    const canReset = typeof reset === 'function' ? reset(value, inputValue) : reset;
    return loading || disabled || readOnly || !canReset;
  }, [disabled, inputValue, loading, readOnly, reset, value]);

/**********************************************************************************************************************
 * Determines whether the spinner should be rendered.
 *********************************************************************************************************************/
export const usePreventSpinnerRender = <Value, InputValue>({
  disabled,
  spinnerAdornment,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !spinnerAdornment || (readOnly && !disabled), [spinnerAdornment, readOnly, disabled]);
