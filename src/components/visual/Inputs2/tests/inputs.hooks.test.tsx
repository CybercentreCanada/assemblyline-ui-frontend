import { useInputID, useInputLabel } from 'components/visual/Inputs2/lib/inputs.hooks';

describe('useInputLabel', () => {
  it('returns the label if provided', () => {
    const label = useInputLabel({ label: 'Email' } as any);
    expect(label).toBe('Email');
  });

  it('returns a non-breaking space if label is undefined', () => {
    const label = useInputLabel({} as any);
    expect(label).toBe('\u00A0');
  });

  it('returns a non-breaking space if label is null', () => {
    const label = useInputLabel({ label: null } as any);
    expect(label).toBe('\u00A0');
  });
});

describe('useInputID', () => {
  it('returns the id if provided', () => {
    const id = useInputID({ id: 'custom-id', label: 'Email' } as any);
    expect(id).toBe('custom-id');
  });

  it('generates id from label if id is not provided', () => {
    const id = useInputID({ label: 'First Name' } as any);
    expect(id).toBe('first-name');
  });

  it('returns a non-breaking space if label is not a string and id is undefined', () => {
    const id = useInputID({ label: null } as any);
    expect(id).toBe('\u00A0');
  });
});
