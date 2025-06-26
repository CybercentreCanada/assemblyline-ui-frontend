import useALContext from 'components/hooks/useALContext';
import { FormProvider } from 'components/routes/development/customize/customize.form';
import { CustomizeRoute } from 'components/routes/development/customize/customize.route';
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
