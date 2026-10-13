import { createFormContext } from 'features/form/form.factories';
import { memo, useCallback } from 'react';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoSection,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';

const { FormProvider, useForm } = createFormContext<StoreDemoState>({
  defaultValues: structuredClone(DEFAULT_STORE_DEMO_STATE)
});

const FIRST_IMPLEMENTATION = '<form.Field name="account.profile.name.first">\nfield.handleChange(value);';
const LAST_IMPLEMENTATION = '<form.Field name="account.identity.family.details.last">\nfield.handleChange(value);';
const CHECKED_IMPLEMENTATION = '<form.Field name="settings.options.consent.checked">\nfield.handleChange(value);';
const RECREATE_IMPLEMENTATION = 'form.reset(structuredClone(DEFAULT_STORE_DEMO_STATE));';

//*****************************************************************************************
// Create Form Context First Field
//*****************************************************************************************

const CreateFormContextFirstField = memo(() => {
  const form = useForm();

  return (
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
  );
});

CreateFormContextFirstField.displayName = 'CreateFormContextFirstField';

//*****************************************************************************************
// Create Form Context Last Field
//*****************************************************************************************

const CreateFormContextLastField = memo(() => {
  const form = useForm();

  return (
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
  );
});

CreateFormContextLastField.displayName = 'CreateFormContextLastField';

//*****************************************************************************************
// Create Form Context Checked Field
//*****************************************************************************************

const CreateFormContextCheckedField = memo(() => {
  const form = useForm();

  return (
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
  );
});

CreateFormContextCheckedField.displayName = 'CreateFormContextCheckedField';

//*****************************************************************************************
// Create Form Context Recreate Button
//*****************************************************************************************

const CreateFormContextRecreateButton = memo(() => {
  const form = useForm();

  const handleClick = useCallback(() => form.reset(structuredClone(DEFAULT_STORE_DEMO_STATE)), [form]);

  return (
    <StoreDemoRecreateButton
      id="store-demo-create-form-context-recreate"
      implementation={RECREATE_IMPLEMENTATION}
      onClick={handleClick}
    />
  );
});

CreateFormContextRecreateButton.displayName = 'CreateFormContextRecreateButton';

//*****************************************************************************************
// Create Form Context Values
//*****************************************************************************************

const CreateFormContextValues = memo(() => {
  const form = useForm();

  return (
    <form.Subscribe selector={state => state.values}>{values => <StoreDemoValues values={values} />}</form.Subscribe>
  );
});

CreateFormContextValues.displayName = 'CreateFormContextValues';

//*****************************************************************************************
// Store Demo Create Form Context
//*****************************************************************************************

export const StoreDemoCreateFormContext = memo(() => (
  <FormProvider>
    <StoreDemoSection
      primary="createFormContext"
      secondary="Form created with `createFormContext`. Each field is a `form.Field` bound to its own value."
      implementationLabel="onChange"
      values={<CreateFormContextValues />}
    >
      <CreateFormContextFirstField />
      <CreateFormContextLastField />
      <CreateFormContextCheckedField />
      <CreateFormContextRecreateButton />
    </StoreDemoSection>
  </FormProvider>
));

StoreDemoCreateFormContext.displayName = 'StoreDemoCreateFormContext';
