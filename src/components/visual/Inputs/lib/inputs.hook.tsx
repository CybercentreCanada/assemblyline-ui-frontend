import type { createStoreContext } from 'components/core/store/createStoreContext';
import type { InputData, InputProps } from 'components/visual/Inputs/lib/inputs.model';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const usePreventPassword = <T,>({
  disabled = false,
  loading = false,
  password = false,
  readOnly = false
}: InputProps<T>) =>
  useMemo(() => loading || disabled || readOnly || !password, [disabled, loading, password, readOnly]);

export const usePreventReset = <T,>({
  disabled = false,
  loading = false,
  readOnly = false,
  reset = false
}: InputProps<T>) => useMemo(() => loading || disabled || readOnly || !reset, [disabled, loading, readOnly, reset]);

export const usePreventExpand = <T,>({ expand = null }: InputProps<T>) => useMemo(() => expand === null, [expand]);

export const useInputState = <T, P = string>(
  {
    disabled,
    id: idProp = null,
    label: labelProp = null,
    expand = null,
    helperText = null,
    loading = false,
    password = false,
    readOnly = false,
    reset = false,
    value,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  }: InputProps<T>,

  validator: (value: T) => string = () => null,
  encoder: (value: T) => P = v => v as unknown as P,
  decoder: (value: P) => T = v => v as unknown as T
) => {
  const [inputValue, setInputValue] = useState<P>(encoder(value));
  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);
  const error = useMemo<string>(() => validator(value), [validator, value]);
  const ariaDescribeBy = useMemo<string>(
    () => (disabled || !(error || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-')),
    [disabled, error, helperText, id, label]
  );

  const preventExpandRender = useMemo<boolean>(() => expand === null, [expand]);
  const preventPasswordRender = useMemo<boolean>(
    () => loading || disabled || readOnly || !password,
    [disabled, loading, password, readOnly]
  );
  const preventResetRender = useMemo<boolean>(
    () => loading || disabled || readOnly || !reset,
    [disabled, loading, readOnly, reset]
  );

  const togglePassword = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowPassword(p => !p);
  }, []);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, value: P = null) => {
      event.preventDefault();
      event.stopPropagation();

      setInputValue(value);
      const parsedValue = decoder(value);
      const err = validator(parsedValue);
      if (!err) onChange(event, parsedValue);
    },
    [decoder, onChange, validator]
  );

  const handleFocus = useCallback(
    (event: React.SyntheticEvent) => {
      setFocused(!readOnly && !disabled && document.activeElement === event.target);
      onFocus(event);
      setInputValue(encoder(value));
    },
    [disabled, encoder, onFocus, readOnly, value]
  );

  const handleBlur = useCallback(
    (event: React.SyntheticEvent) => {
      setFocused(false);
      onBlur(event);
      setInputValue(encoder(value));
    },
    [encoder, onBlur, value]
  );

  useEffect(() => {
    onError(error);
  }, [error, onError]);

  return {
    ariaDescribeBy,
    error,
    focused,
    id,
    inputValue,
    label,
    preventExpandRender,
    preventPasswordRender,
    preventResetRender,
    showPassword,
    setInputValue,
    handleChange,
    handleFocus,
    handleBlur,
    togglePassword
  };
};

export const useInputUpdater = <T,>(useStore: ReturnType<typeof createStoreContext<InputData<T>>>['useStore']) => {
  const [, setStore] = useStore(s => s);

  const [id] = useStore(s => s.label);
  const [label] = useStore(s => s.label);
  useEffect(() => {
    setStore({ label: label ?? '\u00A0', id: (id || (label ?? '\u00A0')).replaceAll(' ', '-') });
  }, [id, label, setStore]);

  const [disabled] = useStore(s => s.disabled);
  const [expand] = useStore(s => s.expand);
  const [loading] = useStore(s => s.loading);
  const [password] = useStore(s => s.password);
  const [readOnly] = useStore(s => s.readOnly);
  const [reset] = useStore(s => s.reset);

  useEffect(() => {
    setStore(s => ({
      ...s,
      preventExpandRender: s.expand === null,
      preventPasswordRender: s.loading || s.disabled || s.readOnly || !s.password,
      preventResetRender: s.loading || s.disabled || s.readOnly || !s.reset
    }));
  }, [disabled, expand, loading, password, readOnly, reset, setStore]);

  const [onBlur] = useStore(s => s.onBlur);
  const [onChange] = useStore(s => s.onChange);
  const [onFocus] = useStore(s => s.onFocus);
  useEffect(() => {
    setStore({
      handleFocus: (event: React.SyntheticEvent) => {
        setStore(s => ({ focused: !s?.readOnly && !s?.disabled && document.activeElement === event.target }));
        onFocus(event);
        // setInputValue(encoder(value));
      },
      handleBlur: (event: React.SyntheticEvent) => {
        setStore({ focused: false });
        onBlur(event);
        // setInputValue(encoder(value));
      },
      handleChange: (event: React.SyntheticEvent, value: T = null) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(event, value);

        // setInputValue(value);
        // const parsedValue = decoder(value);
        // const err = validator(parsedValue);
        // if (!err) onChange(event, parsedValue);
      }
    });
  }, [onBlur, onChange, onFocus, setStore]);
};
