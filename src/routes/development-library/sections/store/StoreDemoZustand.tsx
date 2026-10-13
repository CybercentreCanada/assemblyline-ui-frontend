import { createAppStore } from 'features/store';
import { memo, useCallback } from 'react';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';

const { StoreProvider, useSetStore, useStore } = createAppStore<StoreDemoState>(DEFAULT_STORE_DEMO_STATE);

//*****************************************************************************************
// Zustand First Field
//*****************************************************************************************

const ZustandFirstField = memo(() => {
  const value = useStore(s => s.first);
  const setStore = useSetStore();

  const handleChange = useCallback((first: string) => setStore({ first }), [setStore]);

  return <StoreDemoTextField label="First" value={value} onChange={handleChange} />;
});

ZustandFirstField.displayName = 'ZustandFirstField';

//*****************************************************************************************
// Zustand Last Field
//*****************************************************************************************

const ZustandLastField = memo(() => {
  const value = useStore(s => s.last);
  const setStore = useSetStore();

  const handleChange = useCallback((last: string) => setStore({ last }), [setStore]);

  return <StoreDemoTextField label="Last" value={value} onChange={handleChange} />;
});

ZustandLastField.displayName = 'ZustandLastField';

//*****************************************************************************************
// Zustand Checked Field
//*****************************************************************************************

const ZustandCheckedField = memo(() => {
  const checked = useStore(s => s.checked);
  const setStore = useSetStore();

  const handleChange = useCallback((value: boolean) => setStore({ checked: value }), [setStore]);

  return <StoreDemoCheckbox label="Checked" checked={checked} onChange={handleChange} />;
});

ZustandCheckedField.displayName = 'ZustandCheckedField';

//*****************************************************************************************
// Zustand Recreate Button
//*****************************************************************************************

const ZustandRecreateButton = memo(() => {
  const setStore = useSetStore();

  const handleClick = useCallback(() => setStore({ ...DEFAULT_STORE_DEMO_STATE }), [setStore]);

  return <StoreDemoRecreateButton id="store-demo-zustand-recreate" onClick={handleClick} />;
});

ZustandRecreateButton.displayName = 'ZustandRecreateButton';

//*****************************************************************************************
// Zustand Values
//*****************************************************************************************

const ZustandValues = memo(() => {
  const values = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

ZustandValues.displayName = 'ZustandValues';

//*****************************************************************************************
// Store Demo Zustand
//*****************************************************************************************

export const StoreDemoZustand = memo(() => (
  <StoreProvider>
    <DemoSection
      primary="Zustand"
      secondary="Store created with `createAppStore`. Each field subscribes to its own leaf value."
      left={
        <>
          <ZustandFirstField />
          <ZustandLastField />
          <ZustandCheckedField />
          <ZustandRecreateButton />
        </>
      }
      right={<ZustandValues />}
    />
  </StoreProvider>
));

StoreDemoZustand.displayName = 'StoreDemoZustand';
