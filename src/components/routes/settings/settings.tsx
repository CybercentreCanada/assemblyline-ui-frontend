import TableOfContentProvider from 'components/core/TableOfContent/TableOfContent';
import { FormProvider } from './settings.form';
import { SettingsRoute } from './settings.route';

const Settings = () => (
  <TableOfContentProvider>
    <FormProvider>
      <SettingsRoute />
    </FormProvider>
  </TableOfContentProvider>
);

export default Settings;
