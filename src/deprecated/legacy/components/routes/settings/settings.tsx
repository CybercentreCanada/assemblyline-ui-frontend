import TableOfContentProvider from 'features/table-of-content/table-of-content.providers';
import { FormProvider } from 'routes/settings/settings.form.ts';
import { SettingsRoute } from 'routes/settings/settings.route.tsx';
import React from 'react';

const SettingsPage: React.FC = () => (
  <TableOfContentProvider>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentProvider>
);

export default SettingsPage;
