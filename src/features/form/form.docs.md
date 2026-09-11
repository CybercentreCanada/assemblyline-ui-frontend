# features/form

Typed form context utilities built on TanStack React Form. Creates form providers and hooks for managing form state across component trees.

## Responsibilities

- `createFormContext` — factory for creating typed form providers and hooks
- Nested form type utilities for typed field paths and values
- Form value helpers for reading, updating, and constructing nested data
- Validation integration through TanStack React Form options

## Key Files

- `form.factories.tsx` — Form context factory with the provider and form hook
- `form.models.ts` — Nested form type definitions and utility types
- `form.utils.ts` — Nested form value and path utilities
- `form.utils.test.ts` — Unit tests for form utilities
- `index.ts` — Public module exports

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

// Wrap form components with the provider
<FormProvider>
  <AlertFormFields />
</FormProvider>

// Access the typed form instance in a child component
const form = useForm();
```
