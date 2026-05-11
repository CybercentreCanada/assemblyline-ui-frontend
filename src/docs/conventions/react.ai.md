# React Usage — AI Rules

## Hooks — Use Freely

- `useRef` — DOM refs, mutable values
- `useMemo` — derived/computed data, filtered/sorted arrays
- `useCallback` — required for all functions passed as props
- `useDeferredValue` — defer non-urgent re-renders (search filtering)
- `useTransition` — non-blocking state updates
- `useId` — unique IDs for aria attributes (never for keys)
- `useImperativeHandle` — imperative methods on forwarded refs
- `useLayoutEffect` — synchronous DOM measurements before paint

## Hooks — Restricted

- `useState` — only for local ephemeral UI state (tooltip anchor, animation flag)
- `useEffect` — only for true side effects (subscriptions, timers). Never for derived state
- `useContext` — never for shared state. Only for dependency injection of non-reactive values
- `useReducer` — avoid. Only for complex local state machines

## Hooks — Forbidden

- `useInsertionEffect` — reserved for CSS-in-JS libraries

## Components — Use

- `memo()` — required on every exported component
- `Fragment` (`<>...</>`) — group elements without DOM nodes
- `Suspense` — wrap async boundaries (`use()` promises)
- `forwardRef` — expose DOM refs or imperative handles
- `StrictMode` — enabled at root, never remove
- `Activity` — offscreen rendering for hidden UI preserving state

## Components — Forbidden

- `lazy` — no code splitting, everything bundled upfront
- `Profiler` — development only, never commit
