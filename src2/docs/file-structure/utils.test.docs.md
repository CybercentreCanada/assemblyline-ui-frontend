# Utility Unit Tests

## Purpose

Every utility file (`*.utils.ts`) must have a corresponding test file (`*.utils.test.ts`). Utility functions exist specifically to make complex logic unit-testable in isolation — without a test file, the utility has no reason to exist outside the hook or component it was extracted from.

The relationship is strict: if you create a `*.utils.ts` file, you must create its `*.utils.test.ts` sibling. If you add a function to a utility file, you must add tests for it.

## File Pairing

| Source | Test |
|--------|------|
| `notifications.utils.ts` | `notifications.utils.test.ts` |
| `utils/sanitize.ts` | `utils/sanitize.test.ts` |

Tests live beside their source — same folder, same name with `.test` suffix.

## Structure

Test files mirror the structure of their source file:

- One `describe` block per utility function
- Comment delimiters between `describe` blocks (matching the source file)
- `describe` blocks appear in the same order as functions in the source

```typescript
import { describe, expect, it } from 'vitest';
import { sanitizeEntries, addEntry } from './entries.utils';

//*****************************************************************************************
// sanitizeEntries
//*****************************************************************************************
describe('sanitizeEntries', () => {
  it('removes entries that are not referenced by any group', () => {
    const entries = { active: { ... }, orphan: { ... } };
    const groups = [{ entries: ['active'] }];

    const next = sanitizeEntries(entries, groups);

    expect(next.orphan).toBeUndefined();
    expect(next.active).toBeDefined();
  });

  it('keeps entries referenced by active groups', () => {
    const entries = { a: { ... }, b: { ... } };
    const groups = [{ entries: ['a', 'b'] }];

    const next = sanitizeEntries(entries, groups);

    expect(Object.keys(next)).toHaveLength(2);
  });

  it('returns empty object when entries is empty', () => {
    const next = sanitizeEntries({}, []);

    expect(next).toEqual({});
  });
});

//*****************************************************************************************
// addEntry
//*****************************************************************************************
describe('addEntry', () => {
  it('inserts the entry at the specified index', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const entry = { id: '3' };

    const next = addEntry(items, entry, 1);

    expect(next[1]).toEqual(entry);
    expect(next).toHaveLength(3);
  });

  it('clamps out-of-range index to first position', () => {
    const items = [{ id: '1' }];
    const entry = { id: '2' };

    const next = addEntry(items, entry, -5);

    expect(next[0]).toEqual(entry);
  });

  it('appends when index exceeds array length', () => {
    const items = [{ id: '1' }];
    const entry = { id: '2' };

    const next = addEntry(items, entry, 100);

    expect(next[next.length - 1]).toEqual(entry);
  });
});
```

## Test Writing Rules

- Import `describe`, `expect`, `it` from `vitest`
- Use comment delimiters between `describe` blocks (same style as source file)
- Name tests as behavior descriptions: `it('removes X when Y', ...)`
- Each test sets up its own state — no shared mutable state between tests
- No `beforeEach` / `afterEach` for simple data setup — inline it per test
- No mocking unless testing side effects (utilities should be pure)

## Edge Cases to Cover

Every utility function's test suite should cover:

- **Happy path** — normal expected input
- **Empty inputs** — empty arrays, empty objects, empty strings
- **Boundary values** — index 0, index at length, negative indices
- **Missing/undefined fields** — partial objects, optional parameters
- **Single-item collections** — arrays with one element

The goal is confidence that the utility handles all realistic inputs correctly, so hooks and components can call it without defensive checks.

## Test Naming Convention

Tests use descriptive behavior labels — not implementation details:

```typescript
// ✅ Describes behavior
it('removes the entry at the given index', () => { ... });
it('returns -1 when no item matches', () => { ... });
it('preserves other items when removing from the middle', () => { ... });

// ❌ Describes implementation
it('calls splice', () => { ... });
it('uses findIndex internally', () => { ... });
```

