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

const FIRST_IMPLEMENTATION = `setStore(s => ({
  account: {
    ...s.account,
    profile: { ...s.account.profile, name: { ...s.account.profile.name, first: value } }
  }
}));`;

const LAST_IMPLEMENTATION = `setStore(s => ({
  account: {
    ...s.account,
    identity: {
      ...s.account.identity,
      family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last: value } }
    }
  }
}));`;

const CHECKED_IMPLEMENTATION = `setStore(s => ({
  settings: {
    ...s.settings,
    options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked: value } }
  }
}));`;

const RECREATE_IMPLEMENTATION = 'setStore(structuredClone(DEFAULT_STORE_DEMO_STATE));';

//*****************************************************************************************
// Create App Store First Field
//*****************************************************************************************

const CreateAppStoreFirstField = memo(() => {
  const value = useStore(s => s.account.profile.name.first);
  const setStore = useSetStore();

  const handleChange = useCallback(
    (first: string) =>
      setStore(s => ({
        account: {
          ...s.account,
          profile: { ...s.account.profile, name: { ...s.account.profile.name, first } }
        }
      })),
    [setStore]
  );

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

CreateAppStoreFirstField.displayName = 'CreateAppStoreFirstField';

//*****************************************************************************************
// Create App Store Last Field
//*****************************************************************************************

const CreateAppStoreLastField = memo(() => {
  const value = useStore(s => s.account.identity.family.details.last);
  const setStore = useSetStore();

  const handleChange = useCallback(
    (last: string) =>
      setStore(s => ({
        account: {
          ...s.account,
          identity: {
            ...s.account.identity,
            family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last } }
          }
        }
      })),
    [setStore]
  );

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

CreateAppStoreLastField.displayName = 'CreateAppStoreLastField';

//*****************************************************************************************
// Create App Store Checked Field
//*****************************************************************************************

const CreateAppStoreCheckedField = memo(() => {
  const checked = useStore(s => s.settings.options.consent.checked);
  const setStore = useSetStore();

  const handleChange = useCallback(
    (value: boolean) =>
      setStore(s => ({
        settings: {
          ...s.settings,
          options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked: value } }
        }
      })),
    [setStore]
  );

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
// Create App Store Recreate Button
//*****************************************************************************************

const CreateAppStoreRecreateButton = memo(() => {
  const setStore = useSetStore();

  const handleClick = useCallback(() => setStore(structuredClone(DEFAULT_STORE_DEMO_STATE)), [setStore]);

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
// Create App Store Values
//*****************************************************************************************

const CreateAppStoreValues = memo(() => {
  const values = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

CreateAppStoreValues.displayName = 'CreateAppStoreValues';

//*****************************************************************************************
// Store Demo Create App Store
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
