import PageCenter from 'commons/components/pages/PageCenter';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import React from 'react';
import { FormProvider } from './contexts/form';
import { InputsSection } from './sections/Inputs';

const LibraryContent = () => {
  return (
    <PageCenter width="100%" height="100%" textAlign="left" margin={4}>
      <PageHeader primary="Library" secondary="Visual Components" />
      <InputsSection />
    </PageCenter>
  );
};

const WrappedLibraryPage = () => (
  <FormProvider>
    <LibraryContent />
  </FormProvider>
);

export const LibraryPage = React.memo(WrappedLibraryPage);
export default LibraryPage;
