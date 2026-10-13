import { createAppStore } from 'features/store';
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

const { StoreProvider, useSetStore, useStore } = createAppStore<StoreDemoState>(DEFAULT_STORE_DEMO_STATE);

const FIRST_IMPLEMENTATION = 'const setStore = useSetStore();\nsetStore({ first: value });';
const LAST_IMPLEMENTATION = 'const setStore = useSetStore();\nsetStore({ last: value });';
const CHECKED_IMPLEMENTATION = 'const setStore = useSetStore();\nsetStore({ checked: value });';
const RECREATE_IMPLEMENTATION = 'const setStore = useSetStore();\nsetStore({ ...DEFAULT_STORE_DEMO_STATE });';

//*****************************************************************************************
// CreateAppStore First Field
//*****************************************************************************************

const CreateAppStoreFirstField = memo(() => {
  const value = useStore(s => s.first);
  const setStore = useSetStore();

  const handleChange = useCallback((first: string) => setStore({ first }), [setStore]);

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

CreateAppStoreFirstField.displayName = 'CreateAppStoreFirstField';

//*****************************************************************************************
// CreateAppStore Last Field
//*****************************************************************************************

const CreateAppStoreLastField = memo(() => {
  const value = useStore(s => s.last);
  const setStore = useSetStore();

  const handleChange = useCallback((last: string) => setStore({ last }), [setStore]);

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

CreateAppStoreLastField.displayName = 'CreateAppStoreLastField';

//*****************************************************************************************
// CreateAppStore Checked Field
//*****************************************************************************************

const CreateAppStoreCheckedField = memo(() => {
  const checked = useStore(s => s.checked);
  const setStore = useSetStore();

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

CreateAppStoreCheckedField.displayName = 'CreateAppStoreCheckedField';

//*****************************************************************************************
// CreateAppStore Recreate Button
//*****************************************************************************************

const CreateAppStoreRecreateButton = memo(() => {
  const setStore = useSetStore();

  const handleClick = useCallback(() => setStore({ ...DEFAULT_STORE_DEMO_STATE }), [setStore]);

  return (
    <StoreDemoRecreateButton
      id="store-demo-create-app-store-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
});

CreateAppStoreRecreateButton.displayName = 'CreateAppStoreRecreateButton';

//*****************************************************************************************
// CreateAppStore Values
//*****************************************************************************************

const CreateAppStoreValues = memo(() => {
  const values = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

CreateAppStoreValues.displayName = 'CreateAppStoreValues';

//*****************************************************************************************
// Store Demo CreateAppStore
//*****************************************************************************************

export const StoreDemoCreateAppStore = memo(() => (
  <StoreProvider>
    <StoreDemoSection
      primary="createAppStore"
      secondary="Store created with `createAppStore`. Each field subscribes to its own leaf value."
      implementationLabel="setStore"
      values={<CreateAppStoreValues />}
    >
      <CreateAppStoreFirstField />
      <CreateAppStoreLastField />
      <CreateAppStoreCheckedField />
      <CreateAppStoreRecreateButton />
    </StoreDemoSection>
  </StoreProvider>
));

StoreDemoCreateAppStore.displayName = 'StoreDemoCreateAppStore';
