# features/prop-provider

Store-based prop distribution pattern that allows dynamic prop updates without re-rendering parent components. Uses an external store to manage and distribute props to children.

## Responsibilities

- Prop injection to child components via an external store
- Dynamic prop updates that bypass parent re-renders
- Store-based prop management utilities

## Key Files

- `PropProvider.tsx` — Prop provider component with store integration
- `props.utils.ts` — Prop merging and resolution utilities
- `props.utils.test.ts` — Unit tests for prop utilities
