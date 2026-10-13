import { Checkbox, FormControlLabel, styled, TextField } from '@mui/material';
import type { ChangeEvent, RefObject } from 'react';
import { memo, useCallback } from 'react';
import { useRenderCount } from 'routes/development-library/sections/store/store.hooks';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { Button } from 'ui/buttons/Button';

const RenderCounter = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  whiteSpace: 'nowrap'
}));

RenderCounter.displayName = 'RenderCounter';

//*****************************************************************************************
// Store Demo Render Count
//*****************************************************************************************

export type StoreDemoRenderCountProps = {
  /** Ref returned by `useRenderCount`. */
  countRef: RefObject<HTMLSpanElement | null>;
};

export const StoreDemoRenderCount = memo(({ countRef }: StoreDemoRenderCountProps) => (
  <RenderCounter>
    {'renders: '}
    <span ref={countRef}>0</span>
  </RenderCounter>
));

StoreDemoRenderCount.displayName = 'StoreDemoRenderCount';

//*****************************************************************************************
// Store Demo Text Field
//*****************************************************************************************

export type StoreDemoTextFieldProps = {
  /** Label of the text field. */
  label: string;
  /** Callback fired when the value changes. */
  onChange: (value: string) => void;
  /** Current value of the text field. */
  value: string;
};

export const StoreDemoTextField = memo(({ label, onChange, value }: StoreDemoTextFieldProps) => {
  const countRef = useRenderCount();

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value), [onChange]);

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <TextField fullWidth label={label} size="small" value={value} onChange={handleChange} />
      <StoreDemoRenderCount countRef={countRef} />
    </div>
  );
});

StoreDemoTextField.displayName = 'StoreDemoTextField';

//*****************************************************************************************
// Store Demo Checkbox
//*****************************************************************************************

export type StoreDemoCheckboxProps = {
  /** Current checked state. */
  checked: boolean;
  /** Label of the checkbox. */
  label: string;
  /** Callback fired when the checked state changes. */
  onChange: (checked: boolean) => void;
};

export const StoreDemoCheckbox = memo(({ checked, label, onChange }: StoreDemoCheckboxProps) => {
  const countRef = useRenderCount();

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: boolean) => onChange(value),
    [onChange]
  );

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      <FormControlLabel control={<Checkbox checked={checked} size="small" onChange={handleChange} />} label={label} />
      <StoreDemoRenderCount countRef={countRef} />
    </div>
  );
});

StoreDemoCheckbox.displayName = 'StoreDemoCheckbox';

//*****************************************************************************************
// Store Demo Recreate Button
//*****************************************************************************************

export type StoreDemoRecreateButtonProps = {
  /** Unique id of the button, since several demos share the page. */
  id: string;
  /** Callback fired when requesting the store to be recreated. */
  onClick: () => void;
};

export const StoreDemoRecreateButton = memo(({ id, onClick }: StoreDemoRecreateButtonProps) => {
  const countRef = useRenderCount();

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      <Button id={id} size="small" variant="outlined" onClick={onClick}>
        Recreate store
      </Button>
      <StoreDemoRenderCount countRef={countRef} />
    </div>
  );
});

StoreDemoRecreateButton.displayName = 'StoreDemoRecreateButton';

//*****************************************************************************************
// Store Demo Values
//*****************************************************************************************

export type StoreDemoValuesProps = {
  /** Whole store state to display. */
  values: StoreDemoState;
};

export const StoreDemoValues = memo(({ values }: StoreDemoValuesProps) => {
  const countRef = useRenderCount();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StoreDemoRenderCount countRef={countRef} />
      <pre style={{ margin: 0 }}>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
});

StoreDemoValues.displayName = 'StoreDemoValues';
