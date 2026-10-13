import React from 'react';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { StoreDemoCustom } from 'routes/development-library/sections/store/StoreDemoCustom';
import { StoreDemoTanStack } from 'routes/development-library/sections/store/StoreDemoTanStack';
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
    <StoreDemoTanStack />
    <StoreDemoCustom />
  </DemoContainer>
));
