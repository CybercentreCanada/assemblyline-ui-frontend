import { fireEvent, render, screen } from '@testing-library/react';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { vi } from 'vitest';

const setup = (props: any = {}) => {
  render(<TextInput label="Text Input" {...props} />);
  const input = screen.queryByRole('combobox');
  return { input };
};

describe('<TextInput />', () => {
  it('renders with label', () => {
    setup();
    expect(screen.getByLabelText(/text input/i)).toBeInTheDocument();
  });

  it('applies value when provided', () => {
    const { input } = setup({ value: 'hello' });
    expect(input).toHaveValue('hello');
  });

  it('renders with placeholder', () => {
    const { input } = setup({ placeholder: 'Enter value' });
    expect(input).toHaveAttribute('placeholder', 'Enter value');
  });

  it('respects disabled prop', () => {
    const { input } = setup({ disabled: true });
    expect(input).toBeDisabled();
  });

  it('respects readOnly prop', () => {
    const { input } = setup({ readOnly: true });
    expect(input).toHaveAttribute('readonly');
  });

  it('renders badge when required + badge=true', () => {
    setup({ required: true, badge: true });
    expect(document.querySelector('.MuiBadge-badge')).toBeVisible();
  });

  it('does not render when preventRender is true', () => {
    const { input } = setup({ preventRender: true });
    expect(input).not.toBeInTheDocument();
  });

  it('renders helperText', () => {
    setup({ helperText: 'This is help' });
    expect(screen.getByText('This is help')).toBeInTheDocument();
  });

  it('triggers onFocus and onBlur callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { input } = setup({ onFocus, onBlur });
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders tooltip when provided', async () => {
    setup({ tooltip: 'Tooltip text' });
    fireEvent.mouseOver(screen.getByText('Text Input'));
    expect(await screen.findByText('Tooltip text')).toBeInTheDocument();
  });

  it('applies custom id to input', () => {
    const { input } = setup({ id: 'custom-id' });
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});
