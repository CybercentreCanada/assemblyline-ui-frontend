---
name: react-feature-implementation
description: 'Implement or extend a feature in this React and TypeScript application. Use for UI, state, API, routing, accessibility, tests, and localization changes.'
---

# React Feature Implementation

Use this workflow when implementing or extending product features in this repository.

## Workflow

1. Inspect the target module, neighboring implementations, tests, and relevant package scripts before editing.
2. Read [architecture](../../../.github/instructions/architecture.instructions.md), [file structure](../../../.github/instructions/file-structure.instructions.md), and [import conventions](../../../.github/instructions/conventions/imports.instructions.md), then read applicable topic guidance:
   - Components and UI: [components](../../../.github/instructions/file-structure/components.instructions.md), [React](../../../.github/instructions/conventions/react.instructions.md), [styling](../../../.github/instructions/conventions/styling.instructions.md), [accessibility](../../../.github/instructions/conventions/accessibility.instructions.md), and [performance](../../../.github/instructions/conventions/performance.instructions.md).
   - Hooks and state: [hooks](../../../.github/instructions/file-structure/hooks.instructions.md), [models](../../../.github/instructions/file-structure/models.instructions.md), [React](../../../.github/instructions/conventions/react.instructions.md), and [performance](../../../.github/instructions/conventions/performance.instructions.md).
   - Utilities: [utility conventions](../../../.github/instructions/file-structure/utils.instructions.md).
   - Localization: [i18n](../../../.github/instructions/file-structure/i18n.instructions.md).
   - Unit tests: [utility test conventions](../../../.github/instructions/file-structure/utils.test.instructions.md) and nearby test examples.
   - Playwright coverage: [specs](../../../.github/instructions/file-structure/spec.instructions.md) and [page objects](../../../.github/instructions/file-structure/pom.instructions.md).
   - Documentation: [module documentation](../../../.github/instructions/file-structure/docs.instructions.md).
3. State the local behavior hypothesis and the smallest useful validation before changing code.
4. Implement the smallest change consistent with existing patterns and public contracts.
5. Run a focused test or lint/type check for the touched slice. Run `pnpm typecheck` when TypeScript types or contracts change.
6. Summarize behavior changed and validation performed; report any tests that could not be run.

## Constraints

- Prefer existing project helpers, modules, and UI patterns over new abstractions.
- Preserve unrelated user changes; do not stage or commit unless explicitly asked.
- Do not claim tests passed unless they were run.
