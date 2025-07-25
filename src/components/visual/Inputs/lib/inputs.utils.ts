import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';

export const getAriaLabel = <T>({ id = null, label = null }: InputProps<T>) =>
  (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const getAriaDescribedBy = <T>({
  disabled = false,
  error = () => '',
  helperText = null,
  id = null,
  label = null,
  value
}: InputProps<T>) =>
  disabled || !(error(value) || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-');
