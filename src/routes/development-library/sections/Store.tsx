import { Typography } from '@mui/material';
import React from 'react';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { DemoSection } from 'routes/development-library/components/DemoSection';

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

const ZustandSection = React.memo(() => (
  <DemoSection
    primary="Zustand"
    secondary="Test and debug the different Zustand implementations and selector strategies."
    left={<Typography color="textSecondary">Implementation</Typography>}
    right={<Typography color="textSecondary">Debug output</Typography>}
  />
));

const TanStackFormSection = React.memo(() => (
  <DemoSection
    primary="TanStack Form"
    secondary="Test and debug the form store from `createFormContext`."
    left={<Typography color="textSecondary">Implementation</Typography>}
    right={<Typography color="textSecondary">Debug output</Typography>}
  />
));

const CustomStoreSection = React.memo(() => (
  <DemoSection
    primary="Custom Store"
    secondary="Test and debug the custom `createStoreContext` implementation."
    left={<Typography color="textSecondary">Implementation</Typography>}
    right={<Typography color="textSecondary">Debug output</Typography>}
  />
));

const ComparisonSection = React.memo(() => (
  <DemoSection
    primary="Comparison"
    secondary="Compare render counts and update behaviour across the implementations."
    left={<Typography color="textSecondary">Metrics</Typography>}
    right={<Typography color="textSecondary">Notes</Typography>}
  />
));

export const StoreSection = React.memo(() => (
  <DemoContainer>
    <ZustandSection />
    <TanStackFormSection />
    <CustomStoreSection />
    <ComparisonSection />
  </DemoContainer>
));
