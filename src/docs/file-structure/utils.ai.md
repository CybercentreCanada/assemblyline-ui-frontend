# Utility Functions — AI Rules

## Purpose

Utility functions extract complex logic from hooks/components to make it unit-testable in isolation. If it doesn't need tests, it doesn't need to be a utility.

## Must

- Always use `const` arrow function (never `function` keyword)
- Always include JSDoc with `@name`, `@description`, `@param`, `@returns`
- Always explicitly type the return value
- Always mutate input directly and return it (caller decides when to create new references)
- Each function must do one thing
- Every utility file must have a corresponding `*.utils.test.ts`
- Group related utilities under comment delimiters

## Never

- NO default exports
- NO classes — standalone functions only
- NO copying input to avoid mutation (no `[...items]`, no `{ ...obj }`)
- NO multi-purpose functions
- NO side effects (pure functions — same input → same output)
- NO `function` keyword

## Placement

| Scope | Location |
|-------|----------|
| Module-specific | `<module>.utils.ts` or `utils/` folder |
| Tests | `<module>.utils.test.ts` or `utils/<name>.test.ts` |

## Declaration Template

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

## Mutation Pattern

```typescript
// ✅ Mutates and returns same reference
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

## File Organization

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
```

## Ordering Within a Group

1. Finders / getters (`find*`, `get*`)
2. Removers (`remove*`, `filter*`)
3. Updaters (`update*`, `set*`)
4. Adders (`add*`, `insert*`, `upsert*`)
5. Composite / orchestration (`sanitize*`, `parse*`, `format*`, `mark*`, `write*`)

## Naming Conventions

| Prefix | Purpose |
|--------|---------|
| `find*` | Locate and return an item |
| `get*` | Compute/derive a value |
| `remove*` | Remove from a collection |
| `filter*` | Remove items matching a condition |
| `update*` | Patch fields on existing item |
| `set*` | Replace/overwrite a value |
| `add*` | Create and insert new item |
| `insert*` | Add at specific position |
| `upsert*` | Update if exists, create if not |
| `sanitize*` | Normalize/clean up a structure |
| `parse*` | Transform external input |
| `format*` | Transform for display |
| `mark*` | Tag items with metadata |
| `write*` | Persist to external storage |
