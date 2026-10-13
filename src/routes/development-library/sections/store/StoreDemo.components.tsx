import { Checkbox, FormControlLabel, styled, TextField, Typography, useTheme } from '@mui/material';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { memo, useCallback } from 'react';
import { useRenderCount } from 'routes/development-library/sections/store/store.hooks';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { Button } from 'ui/buttons/Button';
import { PageSection } from 'ui/layouts/PageSection';

const RenderCounter = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  whiteSpace: 'nowrap'
}));

RenderCounter.displayName = 'RenderCounter';

const Row = styled('div')(({ theme }) => ({
  alignItems: 'center',
  columnGap: theme.spacing(2),
  display: 'grid',
  gridTemplateColumns: 'minmax(160px, 1fr) 100px minmax(0, 1.5fr)'
}));

Row.displayName = 'Row';

const Implementation = styled('code')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  fontSize: theme.typography.caption.fontSize,
  whiteSpace: 'pre-wrap'
}));

Implementation.displayName = 'Implementation';

//*****************************************************************************************
// Store Demo Section
//*****************************************************************************************

export type StoreDemoSectionProps = {
  /** Rows of the demo, one per input. */
  children: ReactNode;
  /** Header of the column that shows how each input writes to the store. */
  implementationLabel: string;
  /** Title of the section. */
  primary: ReactNode;
  /** Description of the section. */
  secondary: ReactNode;
  /** Content showing the whole store state. */
  values: ReactNode;
};

export const StoreDemoSection = memo(
  ({ children, implementationLabel, primary, secondary, values }: StoreDemoSectionProps) => {
    const theme = useTheme();

    return (
      <PageSection primary={primary} secondary={secondary} anchor>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(4) }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', flex: '3 1 560px', gap: theme.spacing(2), minWidth: 0 }}
          >
            <Row>
              <Typography color="textSecondary" variant="caption">
                Input
              </Typography>
              <Typography color="textSecondary" variant="caption">
                Renders
              </Typography>
              <Typography color="textSecondary" variant="caption">
                {implementationLabel}
              </Typography>
            </Row>
            {children}
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', flex: '1 1 240px', gap: theme.spacing(2), minWidth: 0 }}
          >
            <Typography color="textSecondary" variant="caption">
              Store state
            </Typography>
            {values}
          </div>
        </div>
      </PageSection>
    );
  }
);

StoreDemoSection.displayName = 'StoreDemoSection';

//*****************************************************************************************
// Store Demo Render Count
//*****************************************************************************************

export type StoreDemoRenderCountProps = {
  /** Ref returned by `useRenderCount`. */
  countRef: RefObject<HTMLSpanElement | null>;
};

export const StoreDemoRenderCount = memo(({ countRef }: StoreDemoRenderCountProps) => (
  <RenderCounter>
    <span ref={countRef}>0</span>
  </RenderCounter>
));

StoreDemoRenderCount.displayName = 'StoreDemoRenderCount';

//*****************************************************************************************
// Store Demo Text Field
//*****************************************************************************************

export type StoreDemoTextFieldProps = {
  /** Source of the code that writes the value to the store. */
  implementation: string;
  /** Label of the text field. */
  label: string;
  /** Callback fired when the value changes. */
  onChange: (value: string) => void;
  /** Current value of the text field. */
  value: string;
};

export const StoreDemoTextField = memo(({ implementation, label, onChange, value }: StoreDemoTextFieldProps) => {
  const countRef = useRenderCount();

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value), [onChange]);

  return (
    <Row>
      <TextField fullWidth label={label} size="small" value={value} onChange={handleChange} />
      <StoreDemoRenderCount countRef={countRef} />
      <Implementation>{implementation}</Implementation>
    </Row>
  );
});

StoreDemoTextField.displayName = 'StoreDemoTextField';

//*****************************************************************************************
// Store Demo Checkbox
//*****************************************************************************************

export type StoreDemoCheckboxProps = {
  /** Current checked state. */
  checked: boolean;
  /** Source of the code that writes the value to the store. */
  implementation: string;
  /** Label of the checkbox. */
  label: string;
  /** Callback fired when the checked state changes. */
  onChange: (checked: boolean) => void;
};

export const StoreDemoCheckbox = memo(({ checked, implementation, label, onChange }: StoreDemoCheckboxProps) => {
  const countRef = useRenderCount();

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: boolean) => onChange(value),
    [onChange]
  );

  return (
    <Row>
      <FormControlLabel control={<Checkbox checked={checked} size="small" onChange={handleChange} />} label={label} />
      <StoreDemoRenderCount countRef={countRef} />
      <Implementation>{implementation}</Implementation>
    </Row>
  );
});

StoreDemoCheckbox.displayName = 'StoreDemoCheckbox';

//*****************************************************************************************
// Store Demo Recreate Button
//*****************************************************************************************

export type StoreDemoRecreateButtonProps = {
  /** Unique id of the button, since several demos share the page. */
  id: string;
  /** Source of the code that recreates the store. */
  implementation: string;
  /** Callback fired when requesting the store to be recreated. */
  onClick: () => void;
};

export const StoreDemoRecreateButton = memo(({ id, implementation, onClick }: StoreDemoRecreateButtonProps) => {
  const countRef = useRenderCount();

  return (
    <Row>
      <div>
        <Button id={id} size="small" variant="outlined" onClick={onClick}>
          Recreate store
        </Button>
      </div>
      <StoreDemoRenderCount countRef={countRef} />
      <Implementation>{implementation}</Implementation>
    </Row>
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
      <RenderCounter>
        {'renders: '}
        <span ref={countRef}>0</span>
      </RenderCounter>
      <pre style={{ margin: 0 }}>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
});

StoreDemoValues.displayName = 'StoreDemoValues';
