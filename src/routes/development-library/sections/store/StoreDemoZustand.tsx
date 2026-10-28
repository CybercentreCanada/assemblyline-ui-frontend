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

const useDemoStore = create<StoreDemoState>(() => structuredClone(DEFAULT_STORE_DEMO_STATE));

const FIRST_IMPLEMENTATION = `useDemoStore.setState(s => ({
  account: {
    ...s.account,
    profile: { ...s.account.profile, name: { ...s.account.profile.name, first: value } }
  }
}));`;

const LAST_IMPLEMENTATION = `useDemoStore.setState(s => ({
  account: {
    ...s.account,
    identity: {
      ...s.account.identity,
      family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last: value } }
    }
  }
}));`;

const CHECKED_IMPLEMENTATION = `useDemoStore.setState(s => ({
  settings: {
    ...s.settings,
    options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked: value } }
  }
}));`;

const RECREATE_IMPLEMENTATION = 'useDemoStore.setState(structuredClone(DEFAULT_STORE_DEMO_STATE));';

//*****************************************************************************************
// Zustand First Field
//*****************************************************************************************

const ZustandFirstField = memo(() => {
  const value = useDemoStore(s => s.account.profile.name.first);

  const handleChange = useCallback(
    (first: string) =>
      useDemoStore.setState(s => ({
        account: {
          ...s.account,
          profile: { ...s.account.profile, name: { ...s.account.profile.name, first } }
        }
      })),
    []
  );

  return (
    <StoreDemoTextField implementation={FIRST_IMPLEMENTATION} label="First" value={value} onChange={handleChange} />
  );
});

ZustandFirstField.displayName = 'ZustandFirstField';

//*****************************************************************************************
// Zustand Last Field
//*****************************************************************************************

const ZustandLastField = memo(() => {
  const value = useDemoStore(s => s.account.identity.family.details.last);

  const handleChange = useCallback(
    (last: string) =>
      useDemoStore.setState(s => ({
        account: {
          ...s.account,
          identity: {
            ...s.account.identity,
            family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last } }
          }
        }
      })),
    []
  );

  return <StoreDemoTextField implementation={LAST_IMPLEMENTATION} label="Last" value={value} onChange={handleChange} />;
});

ZustandLastField.displayName = 'ZustandLastField';

//*****************************************************************************************
// Zustand Checked Field
//*****************************************************************************************

const ZustandCheckedField = memo(() => {
  const checked = useDemoStore(s => s.settings.options.consent.checked);

  const handleChange = useCallback(
    (value: boolean) =>
      useDemoStore.setState(s => ({
        settings: {
          ...s.settings,
          options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked: value } }
        }
      })),
    []
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

ZustandCheckedField.displayName = 'ZustandCheckedField';

//*****************************************************************************************
// Zustand Recreate Button
//*****************************************************************************************

const ZustandRecreateButton = memo(() => {
  const handleClick = useCallback(() => useDemoStore.setState(structuredClone(DEFAULT_STORE_DEMO_STATE)), []);

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
