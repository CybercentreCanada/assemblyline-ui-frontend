import React from 'react';
import { FormProvider } from './customize.form';
import { CustomizeRoute } from './customize.route';

const WrappedCustomizePage = () => (
  <FormProvider>
    <CustomizeRoute />
  </FormProvider>
);

export const CustomizePage = React.memo(WrappedCustomizePage);
export default CustomizePage;
