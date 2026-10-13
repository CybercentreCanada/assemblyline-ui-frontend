---
description: 'Use when creating or modifying reusable React hooks or hook modules.'
applyTo: 'src/**/*.hooks.ts, src/**/*.hooks.tsx, src/**/hooks/**/*.ts, src/**/hooks/**/*.tsx'
---

# Hooks — AI Rules

## Valid Reasons to Create a Hook

- **Utility-style logic** — reusable `useMemo`/`useCallback` computation with a named API
- **Browser/frontend control** — managing a browser API (`localStorage`, `IntersectionObserver`, timers)

## Must

- Prefix with `use`
- Use `const` arrow function with JSDoc (`@name`, `@description`, `@returns`)
- Explicitly type the return value
- Live in `<module>.hooks.tsx`
- Only export hooks used outside the module
- Group hooks with comment delimiters (same as utils)
- If logic is complex and framework-free, extract to a utility function — hook just calls it

## Never

- NO single-use hooks — keep logic inline in the component
- NO wrapping a single `useAPIMutation` — use it directly
- NO complex multi-step orchestration — hooks can't be unit tested

## Template

```typescript
/**
 * @name useNotificationCount
 * @description Returns unread notification count, recomputed when notifications change.
 * @param notifications - Notifications to count
 * @returns Current unread count
 */
export const useNotificationCount = (notifications: NotificationItem[]): number =>
  useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
```

## Forbidden Examples

```typescript
// ❌ Single-use wrapper
const useMyComponentLogic = () => { ... };

// ❌ Wrapper around single mutation
export const useSaveNotification = () => useAPIMutation(() => ({ ... }));
```
