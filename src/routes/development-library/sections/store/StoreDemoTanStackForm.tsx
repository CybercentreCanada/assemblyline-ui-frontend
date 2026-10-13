import { useForm } from '@tanstack/react-form';
import { memo, useCallback } from 'react';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoSection,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';

const FIRST_IMPLEMENTATION = '<form.Field name="account.profile.name.first">\nfield.handleChange(value);';
const LAST_IMPLEMENTATION = '<form.Field name="account.identity.family.details.last">\nfield.handleChange(value);';
const CHECKED_IMPLEMENTATION = '<form.Field name="settings.options.consent.checked">\nfield.handleChange(value);';
const RECREATE_IMPLEMENTATION = 'form.reset(structuredClone(DEFAULT_STORE_DEMO_STATE));';

//*****************************************************************************************
// Store Demo TanStack Form
//*****************************************************************************************

export const StoreDemoTanStackForm = memo(() => {
  const form = useForm({ defaultValues: structuredClone(DEFAULT_STORE_DEMO_STATE) });

  const handleRecreate = useCallback(() => form.reset(structuredClone(DEFAULT_STORE_DEMO_STATE)), [form]);

  return (
    <StoreDemoSection
      primary="@tanstack/react-form"
      secondary="Form created with `useForm` directly in the component, without a context or factory. Each field is a `form.Field`."
      implementationLabel="onChange"
      values={
        <form.Subscribe selector={state => state.values}>
          {values => <StoreDemoValues values={values} />}
        </form.Subscribe>
      }
    >
      <form.Field name="account.profile.name.first">
        {field => (
          <StoreDemoTextField
            implementation={FIRST_IMPLEMENTATION}
            label="First"
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>
      <form.Field name="account.identity.family.details.last">
        {field => (
          <StoreDemoTextField
            implementation={LAST_IMPLEMENTATION}
            label="Last"
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>
      <form.Field name="settings.options.consent.checked">
        {field => (
          <StoreDemoCheckbox
            checked={field.state.value}
            implementation={CHECKED_IMPLEMENTATION}
            label="Checked"
            onChange={field.handleChange}
          />
        )}
      </form.Field>
      <StoreDemoRecreateButton
        id="store-demo-tanstack-form-recreate"
        implementation={RECREATE_IMPLEMENTATION}
        onClick={handleRecreate}
      />
    </StoreDemoSection>
  );
});

StoreDemoTanStackForm.displayName = 'StoreDemoTanStackForm';
