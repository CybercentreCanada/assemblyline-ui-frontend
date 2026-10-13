import { memo, useCallback } from 'react';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoSection,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';
import { create } from 'zustand';

const useDemoStore = create<StoreDemoState>(() => ({ ...DEFAULT_STORE_DEMO_STATE }));

const FIRST_IMPLEMENTATION = 'useDemoStore.setState({ first: value });';
const LAST_IMPLEMENTATION = 'useDemoStore.setState({ last: value });';
const CHECKED_IMPLEMENTATION = 'useDemoStore.setState({ checked: value });';
const RECREATE_IMPLEMENTATION = 'useDemoStore.setState({ ...DEFAULT_STORE_DEMO_STATE });';

//*****************************************************************************************
// Zustand First Field
//*****************************************************************************************

const ZustandFirstField = memo(() => {
  const value = useDemoStore(s => s.first);

  const handleChange = useCallback((first: string) => useDemoStore.setState({ first }), []);

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

ZustandFirstField.displayName = 'ZustandFirstField';

//*****************************************************************************************
// Zustand Last Field
//*****************************************************************************************

const ZustandLastField = memo(() => {
  const value = useDemoStore(s => s.last);

  const handleChange = useCallback((last: string) => useDemoStore.setState({ last }), []);

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

ZustandLastField.displayName = 'ZustandLastField';

//*****************************************************************************************
// Zustand Checked Field
//*****************************************************************************************

const ZustandCheckedField = memo(() => {
  const checked = useDemoStore(s => s.checked);

  const handleChange = useCallback((value: boolean) => useDemoStore.setState({ checked: value }), []);

  return (
    <StoreDemoCheckbox
      checked={checked}
      implementation={CHECKED_IMPLEMENTATION}
      label="Checked"
      onChange={handleChange}
    />
  );
});

ZustandCheckedField.displayName = 'ZustandCheckedField';

//*****************************************************************************************
// Zustand Recreate Button
//*****************************************************************************************

const ZustandRecreateButton = memo(() => {
  const handleClick = useCallback(() => useDemoStore.setState({ ...DEFAULT_STORE_DEMO_STATE }), []);

  return (
    <StoreDemoRecreateButton
      id="store-demo-zustand-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
});

ZustandRecreateButton.displayName = 'ZustandRecreateButton';

//*****************************************************************************************
// Zustand Values
//*****************************************************************************************

const ZustandValues = memo(() => {
  const values = useDemoStore(s => s);

  return <StoreDemoValues values={values} />;
});

ZustandValues.displayName = 'ZustandValues';

//*****************************************************************************************
// Store Demo Zustand
//*****************************************************************************************

export const StoreDemoZustand = memo(() => (
  <StoreDemoSection
    primary="zustand"
    secondary="Module-level store created with zustand's `create`, without a provider or factory. Each field selects its own leaf value."
    implementationLabel="setState"
    values={<ZustandValues />}
  >
    <ZustandFirstField />
    <ZustandLastField />
    <ZustandCheckedField />
    <ZustandRecreateButton />
  </StoreDemoSection>
));

StoreDemoZustand.displayName = 'StoreDemoZustand';
