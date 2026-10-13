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
// CreateStoreContext First Field
//*****************************************************************************************

const CreateStoreContextFirstField = memo(() => {
  const [value, setStore] = useStore(s => s.first);

  const handleChange = useCallback((first: string) => setStore({ first }), [setStore]);

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

CreateStoreContextFirstField.displayName = 'CreateStoreContextFirstField';

//*****************************************************************************************
// CreateStoreContext Last Field
//*****************************************************************************************

const CreateStoreContextLastField = memo(() => {
  const [value, setStore] = useStore(s => s.last);

  const handleChange = useCallback((last: string) => setStore({ last }), [setStore]);

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

CreateStoreContextLastField.displayName = 'CreateStoreContextLastField';

//*****************************************************************************************
// CreateStoreContext Checked Field
//*****************************************************************************************

const CreateStoreContextCheckedField = memo(() => {
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

CreateStoreContextCheckedField.displayName = 'CreateStoreContextCheckedField';

//*****************************************************************************************
// CreateStoreContext Recreate Button
//*****************************************************************************************

const CreateStoreContextRecreateButton = memo(() => {
  const [, setStore] = useStore(() => null);

  const handleClick = useCallback(() => setStore({ ...DEFAULT_STORE_DEMO_STATE }), [setStore]);

  return (
    <StoreDemoRecreateButton
      id="store-demo-create-store-context-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
});

CreateStoreContextRecreateButton.displayName = 'CreateStoreContextRecreateButton';

//*****************************************************************************************
// CreateStoreContext Values
//*****************************************************************************************

const CreateStoreContextValues = memo(() => {
  const [values] = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

CreateStoreContextValues.displayName = 'CreateStoreContextValues';

//*****************************************************************************************
// Store Demo CreateStoreContext
//*****************************************************************************************

export const StoreDemoCreateStoreContext = memo(() => (
  <StoreProvider data={DEFAULT_STORE_DEMO_STATE}>
    <StoreDemoSection
      primary="createStoreContext"
      secondary="Store created with `createStoreContext`, built on `useSyncExternalStore`. Each field subscribes to its own leaf value."
      implementationLabel="setStore"
      values={<CreateStoreContextValues />}
    >
      <CreateStoreContextFirstField />
      <CreateStoreContextLastField />
      <CreateStoreContextCheckedField />
      <CreateStoreContextRecreateButton />
    </StoreDemoSection>
  </StoreProvider>
));

StoreDemoCreateStoreContext.displayName = 'StoreDemoCreateStoreContext';
