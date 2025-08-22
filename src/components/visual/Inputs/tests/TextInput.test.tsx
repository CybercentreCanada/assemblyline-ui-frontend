import { fireEvent, render, screen } from '@testing-library/react';
import { TextInput } from 'components/visual/Inputs/TextInput';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { describe, expect, it, vi } from 'vitest';

const setup = (props: Partial<InputProps & InputValues<string>> = {}) => {
  const utils = render(<TextInput value="" onChange={() => {}} {...props} />);
  const input = utils.getByRole('combobox') as HTMLInputElement;
  return { input, ...utils };
};

describe('TextInput', () => {
  it('renders with label', () => {
    setup({ label: 'Text Input' });
    expect(screen.getByRole('combobox', { name: /text input/i })).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    const { input } = setup({ placeholder: 'Type here' });
    expect(input).toHaveAttribute('placeholder', 'Type here');
  });

  it('applies disabled state', () => {
    const { input } = setup({ disabled: true });
    expect(input).toBeDisabled();
  });

  it('applies readOnly state', () => {
    const { input } = setup({ readOnly: true });
    expect(input).toHaveAttribute('readonly');
  });

  it('renders helper text', () => {
    setup({ helperText: 'Enter a value' });
    expect(screen.getByText('Enter a value')).toBeInTheDocument();
  });

  it('shows error state with custom message', () => {
    setup({ error: (v: string) => (v !== 'bad' ? null : 'Invalid input'), value: 'bad' });
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  it.skip('applies defaultValue', () => {
    const { input } = setup({ defaultValue: 'hello' });
    expect(input.value).toBe('hello');
  });

  it.skip('applies capitalize class if enabled', () => {
    const { input } = setup({ capitalize: true });
    expect(input).toHaveClass('capitalize');
  });

  it.skip('renders start and end adornments', () => {
    setup({ startAdornment: <span data-testid="start" />, endAdornment: <span data-testid="end" /> });
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders tooltip when hovering input', async () => {
    setup({ tooltip: 'Tooltip text' });
    fireEvent.mouseOver(screen.getByRole('combobox'));
    expect(await screen.findByLabelText('Tooltip text')).toBeInTheDocument();
  });

  it.skip('renders masked password style', async () => {
    const { container } = setup({ password: true });
    const input = container.querySelector('input');
    expect(input).not.toBeNull();

    const styles = window.getComputedStyle(input);
    expect(styles.fontFamily).toBe('password');
  });

  it.skip('applies monospace class when enabled', () => {
    const { input } = setup({ monospace: true });
    const styles = window.getComputedStyle(input);
    expect(styles.fontFamily).toBe('monospace');
  });

  it.skip('renders divider if enabled', () => {
    setup({ divider: true });
    expect(screen.getByTestId('input-divider')).toBeInTheDocument();
  });

  it.skip('renders badge if enabled', () => {
    setup({ badge: true });
    expect(screen.getByTestId('input-badge')).toBeInTheDocument();
  });

  it.skip('calls onChange when typing', () => {
    const handleChange = vi.fn();
    const { input } = setup({ onChange: handleChange });
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), 'abc', 'abc');
  });

  it('calls onFocus and onBlur', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { input } = setup({ onFocus, onBlur });

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it('fires onReset when clicking reset button', () => {
    const onReset = vi.fn();
    setup({ reset: true, onReset });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
