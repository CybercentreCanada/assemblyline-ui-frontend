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

## TypeScript Generics — Partial Inference Not Supported

TypeScript does not support partial type argument inference. When you explicitly specify any type parameter, remaining parameters use their **default**, not inference from arguments.

- Never design a hook/function that requires the user to specify one generic while expecting another to be inferred
- Prefer runtime arguments that drive full inference over explicit type parameters
- If a type param exists only for narrowing (e.g., route path), provide it as a cheap runtime arg or use a two-step pattern
- Acceptable workarounds: runtime discriminant argument, two-step hook (returns typed object), curried module-level factory

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
