# features/form

Form context and utilities for managing complex form state. Provides a factory for creating typed form contexts and utility types for form field handling.

## Responsibilities

- `createFormContext` — factory for creating typed form context providers
- Form field type utilities for dynamic field generation
- Validation logic integration
- Form state management across component trees

## Key Files

- `createFormContext.tsx` — Form context factory with typed provider and hooks
- `form.models.ts` — Form field type definitions and utility types
- `form.utils.ts` — Form value manipulation and validation utilities
- `form.utils.test.ts` — Unit tests for form utilities
