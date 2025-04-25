import { FormProvider } from 'components/routes/development/customize/customize.form';
import { CustomizeRoute } from 'components/routes/development/customize/customize.route';
import React from 'react';

const WrappedCustomizePage = () => (
  <FormProvider>
    <CustomizeRoute />
  </FormProvider>
);

export const CustomizePage = React.memo(WrappedCustomizePage);
export default CustomizePage;
