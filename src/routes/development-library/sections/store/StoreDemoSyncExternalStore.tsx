import { memo, useCallback, useSyncExternalStore } from 'react';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoSection,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';

let state: StoreDemoState = { ...DEFAULT_STORE_DEMO_STATE };
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getState = () => state;
const getFirst = () => state.first;
const getLast = () => state.last;
const getChecked = () => state.checked;

const setState = (patch: Partial<StoreDemoState>) => {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
};

const FIRST_IMPLEMENTATION = 'setState({ first: value });';
const LAST_IMPLEMENTATION = 'setState({ last: value });';
const CHECKED_IMPLEMENTATION = 'setState({ checked: value });';
const RECREATE_IMPLEMENTATION = 'setState({ ...DEFAULT_STORE_DEMO_STATE });';

//*****************************************************************************************
// Sync External Store First Field
//*****************************************************************************************

const SyncExternalStoreFirstField = memo(() => {
  const value = useSyncExternalStore(subscribe, getFirst);

  const handleChange = useCallback((first: string) => setState({ first }), []);

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

SyncExternalStoreFirstField.displayName = 'SyncExternalStoreFirstField';

//*****************************************************************************************
// Sync External Store Last Field
//*****************************************************************************************

const SyncExternalStoreLastField = memo(() => {
  const value = useSyncExternalStore(subscribe, getLast);

  const handleChange = useCallback((last: string) => setState({ last }), []);

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

SyncExternalStoreLastField.displayName = 'SyncExternalStoreLastField';

//*****************************************************************************************
// Sync External Store Checked Field
//*****************************************************************************************

const SyncExternalStoreCheckedField = memo(() => {
  const checked = useSyncExternalStore(subscribe, getChecked);

  const handleChange = useCallback((value: boolean) => setState({ checked: value }), []);

  return (
    <StoreDemoCheckbox
      checked={checked}
      implementation={CHECKED_IMPLEMENTATION}
      label="Checked"
      onChange={handleChange}
    />
  );
});

SyncExternalStoreCheckedField.displayName = 'SyncExternalStoreCheckedField';

//*****************************************************************************************
// Sync External Store Recreate Button
//*****************************************************************************************

const SyncExternalStoreRecreateButton = memo(() => {
  const handleClick = useCallback(() => setState({ ...DEFAULT_STORE_DEMO_STATE }), []);

  return (
    <StoreDemoRecreateButton
      id="store-demo-sync-external-store-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
});

SyncExternalStoreRecreateButton.displayName = 'SyncExternalStoreRecreateButton';

//*****************************************************************************************
// Sync External Store Values
//*****************************************************************************************

const SyncExternalStoreValues = memo(() => {
  const values = useSyncExternalStore(subscribe, getState);

  return <StoreDemoValues values={values} />;
});

SyncExternalStoreValues.displayName = 'SyncExternalStoreValues';

//*****************************************************************************************
// Store Demo Sync External Store
//*****************************************************************************************

export const StoreDemoSyncExternalStore = memo(() => (
  <StoreDemoSection
    primary="useSyncExternalStore"
    secondary="Module-level store read with React's `useSyncExternalStore`, without a context or factory. Each field reads its own leaf value."
    implementationLabel="setState"
    values={<SyncExternalStoreValues />}
  >
    <SyncExternalStoreFirstField />
    <SyncExternalStoreLastField />
    <SyncExternalStoreCheckedField />
    <SyncExternalStoreRecreateButton />
  </StoreDemoSection>
));

StoreDemoSyncExternalStore.displayName = 'StoreDemoSyncExternalStore';
