import TableOfContentProvider from 'components/core/TableOfContent/TableOfContent';
import { FormProvider } from 'components/routes/settings/settings.form';
import { SettingsRoute } from 'components/routes/settings/settings.route';
import React from 'react';

const SettingsPage: React.FC = () => (
  <TableOfContentProvider>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentProvider>
);

export default SettingsPage;
