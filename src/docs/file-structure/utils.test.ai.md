# Utility Unit Tests — AI Rules

## Must

- Every `*.utils.ts` file must have a `*.utils.test.ts` sibling
- Every utility function must have its own `describe` block
- Every `describe` block must cover: happy path, empty inputs, boundary values
- Import `describe`, `expect`, `it` from `vitest`
- Use comment delimiters between `describe` blocks (matching source file)
- `describe` blocks must appear in the same order as functions in the source
- Each test must set up its own state — no shared mutable state
- Test names must describe behavior: `it('removes X when Y', ...)`

## Never

- NO shared mutable state between tests (`beforeEach` for data setup)
- NO mocking (utilities are pure — mock only for side-effect testing)
- NO testing implementation details (`it('calls splice')`)
- NO skipping edge cases (empty arrays, index 0, undefined fields)
- NO utility function without corresponding tests

## File Pairing

| Source | Test |
|--------|------|
| `<module>.utils.ts` | `<module>.utils.test.ts` |
| `utils/<name>.ts` | `utils/<name>.test.ts` |

## Template

```typescript
import { describe, expect, it } from 'vitest';
import { removeItem, findItemIndex } from './items.utils';

//*****************************************************************************************
// findItemIndex
//*****************************************************************************************
describe('findItemIndex', () => {
  it('returns the index of the matching item', () => {
    const items = [{ id: '1' }, { id: '2' }];
    expect(findItemIndex(items, { id: '2' })).toBe(1);
  });

  it('returns -1 when no item matches', () => {
    const items = [{ id: '1' }];
    expect(findItemIndex(items, { id: 'x' })).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    expect(findItemIndex([], { id: '1' })).toBe(-1);
  });
});

//*****************************************************************************************
// removeItem
//*****************************************************************************************
describe('removeItem', () => {
  it('removes the item at the given index', () => {
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const next = removeItem(items, 1);
    expect(next).toHaveLength(2);
    expect(next[1].id).toBe('3');
  });

  it('handles index 0', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const next = removeItem(items, 0);
    expect(next[0].id).toBe('2');
  });

  it('handles single-item array', () => {
    const items = [{ id: '1' }];
    const next = removeItem(items, 0);
    expect(next).toHaveLength(0);
  });
});
```

## Edge Cases to Always Cover

- Empty inputs (empty arrays, empty objects, empty strings)
- Boundary values (index 0, index at length, negative indices)
- Missing/undefined fields (partial objects, optional params)
- Single-item collections
