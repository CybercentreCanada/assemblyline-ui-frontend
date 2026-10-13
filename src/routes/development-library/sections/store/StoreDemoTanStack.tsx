import { createFormContext } from 'features/form/form.factories';
import { memo, useCallback } from 'react';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';

const { FormProvider, useForm } = createFormContext<StoreDemoState>({
  defaultValues: structuredClone(DEFAULT_STORE_DEMO_STATE)
});

//*****************************************************************************************
// TanStack First Field
//*****************************************************************************************

const TanStackFirstField = memo(() => {
  const form = useForm();

  return (
    <form.Field name="first">
      {field => <StoreDemoTextField label="First" value={field.state.value} onChange={field.handleChange} />}
    </form.Field>
  );
});

TanStackFirstField.displayName = 'TanStackFirstField';

//*****************************************************************************************
// TanStack Last Field
//*****************************************************************************************

const TanStackLastField = memo(() => {
  const form = useForm();

  return (
    <form.Field name="last">
      {field => <StoreDemoTextField label="Last" value={field.state.value} onChange={field.handleChange} />}
    </form.Field>
  );
});

TanStackLastField.displayName = 'TanStackLastField';

//*****************************************************************************************
// TanStack Checked Field
//*****************************************************************************************

const TanStackCheckedField = memo(() => {
  const form = useForm();

  return (
    <form.Field name="checked">
      {field => <StoreDemoCheckbox label="Checked" checked={field.state.value} onChange={field.handleChange} />}
    </form.Field>
  );
});

TanStackCheckedField.displayName = 'TanStackCheckedField';

//*****************************************************************************************
// TanStack Recreate Button
//*****************************************************************************************

const TanStackRecreateButton = memo(() => {
  const form = useForm();

  const handleClick = useCallback(() => form.reset({ ...DEFAULT_STORE_DEMO_STATE }), [form]);

  return <StoreDemoRecreateButton id="store-demo-tanstack-recreate" onClick={handleClick} />;
});

TanStackRecreateButton.displayName = 'TanStackRecreateButton';

//*****************************************************************************************
// TanStack Values
//*****************************************************************************************

const TanStackValues = memo(() => {
  const form = useForm();

  return (
    <form.Subscribe selector={state => state.values}>{values => <StoreDemoValues values={values} />}</form.Subscribe>
  );
});

TanStackValues.displayName = 'TanStackValues';

//*****************************************************************************************
// Store Demo TanStack
//*****************************************************************************************

export const StoreDemoTanStack = memo(() => (
  <FormProvider>
    <DemoSection
      primary="TanStack Form"
      secondary="Form created with `createFormContext`. Each field is a `form.Field` bound to its own value."
      left={
        <>
          <TanStackFirstField />
          <TanStackLastField />
          <TanStackCheckedField />
          <TanStackRecreateButton />
        </>
      }
      right={<TanStackValues />}
    />
  </FormProvider>
));

StoreDemoTanStack.displayName = 'StoreDemoTanStack';
