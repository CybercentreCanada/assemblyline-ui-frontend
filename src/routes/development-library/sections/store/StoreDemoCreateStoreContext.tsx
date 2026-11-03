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
// Create Store Context First Field
//*****************************************************************************************

const CreateStoreContextFirstField = memo(() => {
  const [value, setStore] = useStore(s => s.account.profile.name.first);

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

CreateStoreContextFirstField.displayName = 'CreateStoreContextFirstField';

//*****************************************************************************************
// Create Store Context Last Field
//*****************************************************************************************

const CreateStoreContextLastField = memo(() => {
  const [value, setStore] = useStore(s => s.account.identity.family.details.last);

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

CreateStoreContextLastField.displayName = 'CreateStoreContextLastField';

//*****************************************************************************************
// Create Store Context Checked Field
//*****************************************************************************************

const CreateStoreContextCheckedField = memo(() => {
  const [checked, setStore] = useStore(s => s.settings.options.consent.checked);

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

CreateStoreContextCheckedField.displayName = 'CreateStoreContextCheckedField';

//*****************************************************************************************
// Create Store Context Recreate Button
//*****************************************************************************************

const CreateStoreContextRecreateButton = memo(() => {
  const [, setStore] = useStore(() => null);

  const handleClick = useCallback(() => setStore(structuredClone(DEFAULT_STORE_DEMO_STATE)), [setStore]);

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
// Create Store Context Values
//*****************************************************************************************

const CreateStoreContextValues = memo(() => {
  const [values] = useStore(s => s);

  return <StoreDemoValues values={values} />;
});

CreateStoreContextValues.displayName = 'CreateStoreContextValues';

//*****************************************************************************************
// Store Demo Create Store Context
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
