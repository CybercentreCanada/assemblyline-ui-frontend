# features/form

Form context factory built on TanStack React Form. Creates typed form contexts with providers and hooks for managing complex form state across component trees.

## Responsibilities

- `createFormContext` — factory for creating typed form context providers (wraps `@tanstack/react-form`)
- Form field type utilities for dynamic field generation
- Validation logic integration (sync + async validators via TanStack Form)
- Form state management across component trees

## Key Files

- `createFormContext.tsx` — Form context factory with typed provider and hooks
- `form.models.ts` — Form field type definitions and utility types
- `form.utils.ts` — Form value manipulation and validation utilities
- `form.utils.test.ts` — Unit tests for form utilities

## Usage

```typescript
import { createFormContext } from 'features/form';

type AlertForm = { name: string; severity: number; tags: string[] };

const { FormProvider, useForm } = createFormContext<AlertForm>({
  defaultValues: { name: '', severity: 1, tags: [] },
  onSubmit: async ({ value }) => {
    await saveAlert(value);
  }
});

// Wrap form components
<FormProvider>
  <AlertFormFields />
</FormProvider>

// Access form instance in children
const form = useForm();
```
