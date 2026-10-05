import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import { FormProvider } from 'routes/development-customize/development-customize.form.tsx';
import { CustomizeRoute } from 'routes/development-customize/development-customize.route.tsx';
import React from 'react';
import { Navigate } from 'react-router';

const WrappedCustomizePage = () => {
  const { user: currentUser, configuration } = useALContext();

  if (!currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type))
    return <Navigate to="/forbidden" replace />;
  else
    return (
      <FormProvider>
        <CustomizeRoute />
      </FormProvider>
    );
};

export const CustomizePage = React.memo(WrappedCustomizePage);
export default CustomizePage;
