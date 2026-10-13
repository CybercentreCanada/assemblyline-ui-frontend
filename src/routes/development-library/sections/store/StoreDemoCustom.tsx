import { createStoreContext } from 'features/store';
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

const { StoreProvider, useStore } = createStoreContext<StoreDemoState>(DEFAULT_STORE_DEMO_STATE);

//*****************************************************************************************
// Custom First Field
//*****************************************************************************************

const CustomFirstField = memo(() => {
  const [value, setStore] = useStore(s => s.first);

  const handleChange = useCallback((first: string) => setStore({ first }), [setStore]);

  return <StoreDemoTextField label="First" value={value} onChange={handleChange} />;
});

CustomFirstField.displayName = 'CustomFirstField';

//*****************************************************************************************
// Custom Last Field
//*****************************************************************************************

const CustomLastField = memo(() => {
  const [value, setStore] = useStore(s => s.last);

  const handleChange = useCallback((last: string) => setStore({ last }), [setStore]);

  return <StoreDemoTextField label="Last" value={value} onChange={handleChange} />;
});

CustomLastField.displayName = 'CustomLastField';

//*****************************************************************************************
// Custom Checked Field
//*****************************************************************************************

const CustomCheckedField = memo(() => {
  const [checked, setStore] = useStore(s => s.checked);

  const handleChange = useCallback((value: boolean) => setStore({ checked: value }), [setStore]);

  return <StoreDemoCheckbox label="Checked" checked={checked} onChange={handleChange} />;
});

CustomCheckedField.displayName = 'CustomCheckedField';

//*****************************************************************************************
// Custom Recreate Button
//*****************************************************************************************

const CustomRecreateButton = memo(() => {
  const [, setStore] = useStore(() => null);

  const handleClick = useCallback(() => setStore({ ...DEFAULT_STORE_DEMO_STATE }), [setStore]);

  return <StoreDemoRecreateButton id="store-demo-custom-recreate" onClick={handleClick} />;
});

CustomRecreateButton.displayName = 'CustomRecreateButton';

//*****************************************************************************************
// Custom Values
//*****************************************************************************************

const CustomValues = memo(() => {
  const [values] = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

CustomValues.displayName = 'CustomValues';

//*****************************************************************************************
// Store Demo Custom
//*****************************************************************************************

export const StoreDemoCustom = memo(() => (
  <StoreProvider data={DEFAULT_STORE_DEMO_STATE}>
    <DemoSection
      primary="Custom Store"
      secondary="Store created with `createStoreContext`, built on `useSyncExternalStore`. Each field subscribes to its own leaf value."
      left={
        <>
          <CustomFirstField />
          <CustomLastField />
          <CustomCheckedField />
          <CustomRecreateButton />
        </>
      }
      right={<CustomValues />}
    />
  </StoreProvider>
));

StoreDemoCustom.displayName = 'StoreDemoCustom';
