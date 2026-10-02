import { fireEvent, render, screen } from '@testing-library/react';
import type { TextInputProps } from 'components/visual/Inputs/TextInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { vi } from 'vitest';

const setup = (props: Partial<TextInputProps> = {}) => {
  const { container } = render(<TextInput label="Text Input" {...(props as TextInputProps)} />);
  const input = screen.queryByRole('combobox');
  return { container, input };
};

describe('<TextInput />', () => {
  it.skip('applies custom id to input', () => {
    const { input } = setup({ id: 'custom-id' });
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it.skip('renders with label', () => {
    setup({ label: 'This is a test' });
    expect(screen.getByText(/This is a test/i)).toBeInTheDocument();
  });

  it.skip('applies value when provided', () => {
    const { input } = setup({ value: 'hello' });
    expect(input).toHaveValue('hello');
  });

  it.skip('does not render when preventRender is true', () => {
    const { input } = setup({ preventRender: true });
    expect(input).not.toBeInTheDocument();
  });

  it.skip('respects disabled prop', () => {
    const { input } = setup({ disabled: true });
    expect(input).toBeDisabled();
  });

  it.skip('respects loading prop (renders skeleton)', () => {
    const { container } = setup({ loading: true });
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it.skip('resets to defaultValue when reset adornment is clicked', () => {
    const { input } = setup({ label: 'test', reset: true, defaultValue: 'defaultValue' });

    fireEvent.change(input, { target: { value: 'something else' } });
    expect(input).toHaveValue('something else');

    const resetButton = screen.getByRole('button', { name: /test-reset/i });
    fireEvent.click(resetButton);
    setTimeout(() => {
      expect(input).toHaveValue('defaultValue');
    }, 1000);
  });

  it.skip('calls onReset when reset adornment is clicked', () => {
    const onReset = vi.fn().mockReturnValue('defaultValue');
    const { input } = setup({ label: 'test', reset: true, value: 'value', onReset });
    const resetButton = screen.getByRole('button', { name: /test-reset/i });
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();

    setTimeout(() => {
      expect(input).toHaveValue('defaultValue');
    }, 1000);
  });

  it.skip('renders tooltip when provided', async () => {
    setup({ tooltip: 'Tooltip text' });
    fireEvent.mouseOver(screen.getByText('Text Input'));
    expect(await screen.findByText('Tooltip text')).toBeInTheDocument();
  });

  it.skip('shows required error when value is empty', () => {
    setup({ value: '', validators: v => v.required() });
    expect(screen.getByText(/error.required/i)).toBeVisible();
  });

  it.skip("shows custom error when value is 'asd'", () => {
    setup({
      value: 'asd',
      validate: value => (value === 'asd' ? { status: 'error', message: "Value cannot be 'asd'" } : null)
    });
    expect(screen.getByText("Value cannot be 'asd'")).toBeVisible();
  });

  it.skip('respects readOnly prop', () => {
    const { input } = setup({ readOnly: true });
    expect(input).toHaveAttribute('readonly');
  });

  it.skip('renders helperText', () => {
    setup({ helperText: 'This is help' });
    expect(screen.getByText('This is help')).toBeInTheDocument();
  });

  it.skip('renders with placeholder', () => {
    const { input } = setup({ placeholder: 'Enter value' });
    expect(input).toHaveAttribute('placeholder', 'Enter value');
  });

  it.skip('respects tiny prop (32px height)', () => {
    const { input } = setup({ tiny: true });
    expect(input).toHaveStyle({ height: '32px' });
  });

  it.skip('respects monospace prop', () => {
    const { input } = setup({ monospace: true });
    expect(input).toHaveStyle({ fontFamily: expect.stringMatching(/monospace/i) });
  });

  it.skip('respects password prop', () => {
    const { input } = setup({ password: true });
    expect(input).toHaveStyle({ fontFamily: expect.stringMatching(/password/i) });
  });

  it.skip('renders badge when required + badge=true', () => {
    setup({ badge: true, validators: v => v.required() });
    expect(document.querySelector('.MuiBadge-badge')).toBeVisible();
  });

  it.skip('triggers onChange callback', () => {
    const onChange = vi.fn();
    const { input } = setup({ onChange });
    fireEvent.change(input, { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('new text');
  });

  it.skip('triggers onFocus and onBlur callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { input } = setup({ onFocus, onBlur });
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });
});
