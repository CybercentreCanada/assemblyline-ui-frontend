# Hook Patterns

## When to Create a Hook

Custom hooks exist for three purposes:

1. **Named store access** — Wrapping a store selector or setter with a semantic name (e.g., `useAppConfig`, `useAppSetConfig`, `usePanel`)
2. **Utility-style logic** — Encapsulating a `useMemo`/`useCallback`-style computation that benefits from a reusable name (e.g., `useFormattedDate`, `useSortedItems`)
3. **Browser/frontend control** — Managing a browser API or frontend concern (e.g., `useLocalStorage`, `useTimeout`, `useMediaQuery`, `useIntersectionObserver`)

**Keep hooks simple.** Hooks cannot be unit tested directly — they are tested indirectly through component E2E tests or verified manually. Complex orchestration inside a hook is hard to validate and debug.

Do NOT create hooks for:
- Single-use state access (use `useAppConfig` directly)
- Simple mutations (use `useAPIMutation` directly)
- Wrapping a single hook call with no added logic
- Complex multi-step flows that are hard to test indirectly

## Hook File Organization

- Feature hooks live in `<feature>.hooks.tsx`
- Only export hooks that are used outside the module
- Keep internal/private hooks unexported (they still live in the same file)

## Hook & Component Usage Guide

### Hooks

| Hook | Guidance |
|------|----------|
| `useState` | Rarely needed — most state belongs in a store. Use only for truly local, ephemeral UI state (e.g., tooltip anchor, local animation flag) |
| `useEffect` | Avoid — waits for a render cycle before executing, slowing perceived performance. Prefer event handlers, mutation callbacks, or store subscriptions |
| `useRef` | Fine to use whenever needed (DOM refs, mutable values that don't trigger re-renders) |
| `useMemo` | Fine to use for expensive derived computations |
| `useCallback` | Required for all component-internal handlers |
| `useContext` | Avoid for shared state (use Zustand). Acceptable for dependency injection of non-reactive values (e.g., store instance from `createAppStore`) |
| `useReducer` | Avoid — use a store instead. Only acceptable for complex local state machines that are truly component-private |
| `useImperativeHandle` | Use with `forwardRef` when a parent needs to call imperative methods on a child (e.g., `.focus()`, `.reset()`) |
| `useLayoutEffect` | Use when you need synchronous DOM measurements before paint (e.g., measuring element size for positioning). Prefer over `useEffect` for layout calculations |
| `useDebugValue` | Optional — use in custom hooks to label them in React DevTools during development |
| `useDeferredValue` | Use for deferring expensive re-renders of non-urgent UI (e.g., filtering a large list while typing) |
| `useTransition` | Use to mark state updates as non-blocking transitions (e.g., tab switching, heavy computations that shouldn't block input) |
| `useId` | Use for generating unique IDs for accessibility attributes (`aria-labelledby`, `htmlFor`) — never for keys |
| `useSyncExternalStore` | Rarely needed directly — already used internally by Zustand. Use if subscribing to a non-React external store |
| `useInsertionEffect` | Do not use — reserved for CSS-in-JS library authors |
| `use` | Use for reading promises and context in render (React 19+). Acceptable for streaming data with Suspense |

### Components

| Component | Guidance |
|-----------|----------|
| `Fragment` (`<>...</>`) | Use freely to group elements without adding DOM nodes |
| `Suspense` | Use to wrap async boundaries (lazy-loaded components, `use()` promises). Place at meaningful UI boundaries, not around every component |
| `StrictMode` | Enabled at app root — do not remove. Helps catch side-effect issues in development |
| `Profiler` | Use during development for performance profiling. Remove before committing |
| `Activity` | Use for offscreen rendering / pre-rendering of hidden UI that needs to preserve state (e.g., tabs, panels) |
| `lazy` | Use for route-level code splitting. Do not lazy-load small components |
