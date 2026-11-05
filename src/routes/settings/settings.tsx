import { TableOfContentLayout } from 'features/table-of-content';
import React from 'react';
import { FormProvider } from 'routes/settings/settings.form';
import { SettingsRoute } from 'routes/settings/settings.route';

const SettingsPage: React.FC = () => (
  <TableOfContentLayout>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentLayout>
);

export default SettingsPage;
