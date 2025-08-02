import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';

export const getAriaLabel = <T>({ id = null, label = null }: InputValues<T> & InputProps) =>
  (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const getAriaDescribedBy = <T>({
  disabled = false,
  error = () => '',
  helperText = null,
  id = null,
  label = null,
  value
}: InputValues<T> & InputProps) =>
  disabled || !(error(value) || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const isValidValue = <T>(value: T): boolean =>
  value !== null && value !== undefined && value !== '' && (typeof value !== 'number' || !isNaN(value));

export const isValidNumber = (value: number, { min = null, max = null }: { min?: number; max?: number }): boolean =>
  !isNaN(value) && (min === null || value >= min) && (max === null || value <= max);

export const parseInputProps = <Props extends InputProps>(props: Props): Props & InputStates => ({
  errorMsg: null,
  focused: false,
  showPassword: true,
  ...props,
  label: props.label ?? '\u00A0',
  id: (props.id || (props.label ?? '\u00A0')).toLowerCase().replaceAll(' ', '-'),
  preventExpandRender: props.expand === null,
  preventPasswordRender: props.loading || props.disabled || props.readOnly || !props.password,
  preventResetRender: props.loading || props.disabled || props.readOnly || !props.reset
});
