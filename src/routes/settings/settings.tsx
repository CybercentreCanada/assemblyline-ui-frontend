import { TableOfContentProvider } from 'features/table-of-content';
import React from 'react';
import { FormProvider } from 'routes/settings/settings.form.ts';
import { SettingsRoute } from 'routes/settings/settings.route.tsx';

const SettingsPage: React.FC = () => (
  <TableOfContentProvider>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentProvider>
);

export default SettingsPage;
