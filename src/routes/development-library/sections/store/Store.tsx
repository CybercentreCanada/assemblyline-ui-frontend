import React from 'react';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { StoreDemoCreateAppStore } from 'routes/development-library/sections/store/StoreDemoCreateAppStore';
import { StoreDemoCreateFormContext } from 'routes/development-library/sections/store/StoreDemoCreateFormContext';
import { StoreDemoCreateStoreContext } from 'routes/development-library/sections/store/StoreDemoCreateStoreContext';
import { StoreDemoSyncExternalStore } from 'routes/development-library/sections/store/StoreDemoSyncExternalStore';
import { StoreDemoTanStackForm } from 'routes/development-library/sections/store/StoreDemoTanStackForm';
import { StoreDemoZustand } from 'routes/development-library/sections/store/StoreDemoZustand';

export type StoreLibraryState = {
  store: {
    name: string;
    values: {
      sectionOpen: boolean;
    };
  };
};

export const STORE_LIBRARY_STATE: StoreLibraryState = {
  store: {
    name: 'Store',
    values: {
      sectionOpen: true
    }
  }
} as const;

export const StoreSection = React.memo(() => (
  <DemoContainer>
    <StoreDemoZustand />
    <StoreDemoCreateAppStore />
    <StoreDemoTanStackForm />
    <StoreDemoCreateFormContext />
    <StoreDemoSyncExternalStore />
    <StoreDemoCreateStoreContext />
  </DemoContainer>
));
