import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import { useMemo, useState } from 'react';

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

// export const useInputState = <T, P, O extends object = object>(
//   props: InputProps<T> & O,
//   validator: (data: InputProps<T>) => string = () => null,
//   encoder: (value: T) => P = v => v as unknown as P,
//   decoder: (value: P) => T = v => v as unknown as T
// ): InputState<T, P> & O => {
//   const { onBlur, onChange, onError, onFocus, ...data } = useMemo<InputProps<T> & O>(
//     () => ({ ...DEFAULT_INPUT_DATA, ...props }),
//     [props]
//   );

//   const [inputValue, setInputValue] = useState<P>(encoder(data.value));
//   const [focused, setFocused] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState<boolean>(true);

//   const label = useMemo<string>(() => data.label ?? '\u00A0', [data.label]);
//   const id = useMemo<string>(() => (data.id || label).toLowerCase().replaceAll(' ', '-'), [data.id, label]);
//   const errorMsg = useMemo<string>(() => validator(data), [data, validator]);
//   const ariaDescribeBy = useMemo<string>(
//     () => (data.disabled || !(data.error || data.helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-')),
//     [data.disabled, data.error, data.helperText, id, label]
//   );

//   const preventExpandRender = useMemo<boolean>(() => data.expand === null, [data.expand]);
//   const preventPasswordRender = useMemo<boolean>(
//     () => data.loading || data.disabled || data.readOnly || !data.password,
//     [data.disabled, data.loading, data.password, data.readOnly]
//   );
//   const preventResetRender = useMemo<boolean>(
//     () => data.loading || data.disabled || data.readOnly || !data.reset,
//     [data.disabled, data.loading, data.readOnly, data.reset]
//   );

//   const togglePassword = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//     event.preventDefault();
//     event.stopPropagation();
//     setShowPassword(p => !p);
//   }, []);

//   const handleChange = useCallback(
//     (event: React.SyntheticEvent, value: P = null) => {
//       event.preventDefault();
//       event.stopPropagation();

//       setInputValue(value);
//       const parsedValue = decoder(value);
//       const err = validator(data);
//       if (!err) onChange(event, parsedValue);
//     },
//     [decoder, validator, data, onChange]
//   );

//   const handleFocus = useCallback(
//     (event: React.SyntheticEvent) => {
//       setFocused(!data.readOnly && !data.disabled && document.activeElement === event.target);
//       onFocus(event);
//       setInputValue(encoder(data.value));
//     },
//     [data.readOnly, data.disabled, data.value, onFocus, encoder]
//   );

//   const handleBlur = useCallback(
//     (event: React.SyntheticEvent) => {
//       setFocused(false);
//       onBlur(event);
//       setInputValue(encoder(data.value));
//     },
//     [onBlur, encoder, data.value]
//   );

//   useEffect(() => {
//     onError(errorMsg);
//   }, [errorMsg, onError]);

//   return {
//     ...data,

//     ariaDescribeBy,
//     errorMsg,
//     focused,
//     id,
//     inputValue,
//     label,
//     preventExpandRender,
//     preventPasswordRender,
//     preventResetRender,
//     showPassword,
//     handleChange,
//     handleFocus,
//     handleBlur,
//     togglePassword,
//     setInputValue
//   } as InputProps<T> & O;
// };

export const useInputState = <T, P extends InputProps<T> = InputProps<T>>({
  defaultValue = undefined,
  disabled = false,
  divider = false,
  endAdornment = null,
  error = () => '',
  errorProps = null,
  expand = null,
  expandProps = null,
  helperText = null,
  helperTextProps = null,
  id = '',
  label = '',
  labelProps = null,
  loading = false,
  monospace = false,
  password = false,
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
  readOnly = false,
  required = false,
  reset = false,
  resetProps = null,
  rootProps = null,
  showOverflow = false,
  startAdornment = null,
  tiny = false,
  tooltip = null,
  tooltipProps = null,
  value = undefined,
  ...props
}: P) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  return {
    ...props,
    defaultValue,
    disabled,
    divider,
    endAdornment,
    error,
    errorProps,
    expand,
    expandProps,
    helperText,
    helperTextProps,
    labelProps,
    loading,
    monospace,
    password,
    placeholder,
    preventDisabledColor,
    preventRender,
    readOnly,
    required,
    reset,
    resetProps,
    rootProps,
    showOverflow,
    startAdornment,
    tiny,
    tooltip,
    tooltipProps,
    value,

    label: label ?? '\u00A0',
    id: (id || (label ?? '\u00A0')).toLowerCase().replaceAll(' ', '-'),
    preventExpandRender: expand === null,
    preventPasswordRender: loading || disabled || readOnly || !password,
    preventResetRender: loading || disabled || readOnly || !reset,
    focused,
    showPassword,
    setFocused,
    setShowPassword
  };
};
