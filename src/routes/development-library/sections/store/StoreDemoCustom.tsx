import { createStoreContext } from 'features/store';
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

const { StoreProvider, useStore } = createStoreContext<StoreDemoState>(DEFAULT_STORE_DEMO_STATE);

const FIRST_IMPLEMENTATION = 'const [, setStore] = useStore(s => s.first);\nsetStore({ first: value });';
const LAST_IMPLEMENTATION = 'const [, setStore] = useStore(s => s.last);\nsetStore({ last: value });';
const CHECKED_IMPLEMENTATION = 'const [, setStore] = useStore(s => s.checked);\nsetStore({ checked: value });';
const RECREATE_IMPLEMENTATION =
  'const [, setStore] = useStore(() => null);\nsetStore({ ...DEFAULT_STORE_DEMO_STATE });';

//*****************************************************************************************
// Custom First Field
//*****************************************************************************************

const CustomFirstField = memo(() => {
  const [value, setStore] = useStore(s => s.first);

  const handleChange = useCallback((first: string) => setStore({ first }), [setStore]);

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

CustomFirstField.displayName = 'CustomFirstField';

//*****************************************************************************************
// Custom Last Field
//*****************************************************************************************

const CustomLastField = memo(() => {
  const [value, setStore] = useStore(s => s.last);

  const handleChange = useCallback((last: string) => setStore({ last }), [setStore]);

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

CustomLastField.displayName = 'CustomLastField';

//*****************************************************************************************
// Custom Checked Field
//*****************************************************************************************

const CustomCheckedField = memo(() => {
  const [checked, setStore] = useStore(s => s.checked);

  const handleChange = useCallback((value: boolean) => setStore({ checked: value }), [setStore]);

  return (
    <StoreDemoCheckbox
      checked={checked}
      implementation={CHECKED_IMPLEMENTATION}
      label="Checked"
      onChange={handleChange}
    />
  );
});

CustomCheckedField.displayName = 'CustomCheckedField';

//*****************************************************************************************
// Custom Recreate Button
//*****************************************************************************************

const CustomRecreateButton = memo(() => {
  const [, setStore] = useStore(() => null);

  const handleClick = useCallback(() => setStore({ ...DEFAULT_STORE_DEMO_STATE }), [setStore]);

  return (
    <StoreDemoRecreateButton
      id="store-demo-custom-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
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
    <StoreDemoSection
      primary="Custom Store"
      secondary="Store created with `createStoreContext`, built on `useSyncExternalStore`. Each field subscribes to its own leaf value."
      implementationLabel="setStore"
      values={<CustomValues />}
    >
      <CustomFirstField />
      <CustomLastField />
      <CustomCheckedField />
      <CustomRecreateButton />
    </StoreDemoSection>
  </StoreProvider>
));

StoreDemoCustom.displayName = 'StoreDemoCustom';
