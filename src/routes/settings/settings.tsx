import { TableOfContentLayout } from 'features/table-of-content';
import React from 'react';
import { FormProvider } from 'routes/settings/settings.form.ts';
import { SettingsRoute } from 'routes/settings/settings.route.tsx';

const SettingsPage: React.FC = () => (
  <TableOfContentLayout>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentLayout>
);

export default SettingsPage;
