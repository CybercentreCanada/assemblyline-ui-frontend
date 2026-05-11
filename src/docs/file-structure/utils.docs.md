# Utility Functions

## Purpose

Utility functions exist to make complex operations unit-testable. If a complex operation lives inside a hook or component, it cannot be tested in isolation. By extracting that logic into a pure utility function, the hook simply calls the utility, and the utility gets a dedicated test suite via Vitest.

**The pattern:**

1. Identify a complex operation inside a hook or component
2. Extract it into a `*.utils.ts` file as a standalone function
3. Write a corresponding `*.utils.test.ts` covering edge cases
4. The hook/component calls the utility — logic stays testable, hook stays thin

Utility functions are closely tied to unit testing. Every utility function should have tests; if it doesn't need tests, it probably doesn't need to be a utility.

## Where Utils Live

- Module-specific utilities: `<module>.utils.ts` (file-based) or `utils/` folder (folder-based)
- Tests mirror their source: `<module>.utils.test.ts` or `utils/<name>.test.ts`

## Declaration Style

All utility functions use `const` arrow functions with JSDoc:

```typescript
/**
 * @name findItemIndex
 * @description Finds the first item index matching the provided partial criteria.
 * @param items - Collection to search
 * @param partial - Partial item matcher
 * @returns Matching item index, or -1 when not found
 */
export const findItemIndex = (
  items: Item[],
  partial: Partial<Item>
): number => {
  // ...
};
```

**Rules:**

- Always use `const` arrow functions (not the `function` keyword)
- Always include a JSDoc block with `@name`, `@description`, `@param`, and `@returns`
- Always explicitly type the return value
- Export only functions that are used outside the file
- Keep functions pure when possible (no side effects, same input → same output)
- Each function does one thing — no multi-purpose utilities

## File Organization

Group related utilities under comment delimiters, same as components:

```typescript
//*****************************************************************************************
// Items
//*****************************************************************************************

export const findItemIndex = (...) => { ... };
export const removeItem = (...) => { ... };
export const updateItem = (...) => { ... };

//*****************************************************************************************
// Categories
//*****************************************************************************************

export const findCategoryIndex = (...) => { ... };
export const removeCategory = (...) => { ... };
```

**Ordering within a group:**

1. Finders / getters (`find*`, `get*`)
2. Removers (`remove*`, `filter*`)
3. Updaters (`update*`, `set*`)
4. Adders (`add*`, `insert*`, `upsert*`)
5. Composite / orchestration (`sanitize*`, `parse*`)

## Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|

| `find*` | Locate and return an item | `findItemIndex`, `findEntry` |
| `get*` | Compute/derive a value | `getBackgroundColor`, `getLabel` |
| `remove*` | Remove an item from a collection | `removeItem`, `removeEntry` |
| `filter*` | Remove items matching a condition | `filterOrphaned` |
| `update*` | Patch fields on an existing item | `updateItem`, `updateEntry` |
| `set*` | Replace/overwrite a value | `setItem`, `setEntry` |
| `add*` | Create and insert a new item | `addItem`, `addEntry` |
| `insert*` | Add at a specific position | `insertBefore`, `insertAfter` |
| `upsert*` | Update if exists, create if not | `upsertItem`, `upsertEntry` |
| `sanitize*` | Normalize/clean up a structure | `sanitizeEntries`, `sanitizeItems` |
| `parse*` | Transform external input | `parseSearchParams` |
| `format*` | Transform for display | `formatDate` |
| `mark*` | Tag items with metadata | `markItemsAsNew` |
| `write*` | Persist to external storage | `writeLastOpenedAt` |

## Mutation

Utility functions mutate the input directly and return it. This avoids unnecessary object copies that would trigger extra re-renders in React when references change unexpectedly:

```typescript
// ✅ Mutates and returns the same reference
export const removeItem = (items: Item[], index: number): Item[] => {
  items.splice(index, 1);
  return items;
};

// ❌ Creates a copy — causes new reference, triggers unnecessary re-renders
export const removeItem = (items: Item[], index: number): Item[] => {
  const next = [...items];
  next.splice(index, 1);
  return next;
};
```

The caller (hook or store setter) is responsible for deciding when to create a new reference for React's change detection. The utility itself should not make that decision.
