# React Usage Guide

## Purpose

This file documents when and how to use React's built-in hooks and components within this project. Some hooks are restricted or forbidden due to architectural decisions (Zustand for state, no code splitting, performance-first).

## Hooks

| Hook | Guidance |
|------|----------|
| `useState` | Rarely needed — most state belongs in a store. Use only for truly local, ephemeral UI state (e.g., tooltip anchor, local animation flag) |
| `useRef` | Use freely — DOM refs, mutable values that don't trigger re-renders |
| `useMemo` | Use for derived/computed data. Required when filtering, sorting, or transforming arrays/objects |
| `useCallback` | Required for all functions passed as props or used as event handlers |
| `useDeferredValue` | Use for deferring expensive re-renders of non-urgent UI (e.g., filtering a large list while typing) |
| `useTransition` | Use to mark state updates as non-blocking transitions (e.g., tab switching, heavy computations that shouldn't block input) |
| `useId` | Use for generating unique IDs for accessibility attributes (`aria-labelledby`, `htmlFor`) — never for keys |
| `useImperativeHandle` | Use with `forwardRef` when a parent needs to call imperative methods on a child (e.g., `.focus()`, `.reset()`) |
| `useLayoutEffect` | Use when you need synchronous DOM measurements before paint (e.g., measuring element size for positioning) |
| `useDebugValue` | Optional — use in custom hooks to label them in React DevTools during development |
| `useSyncExternalStore` | Rarely needed — already used internally by Zustand. Use only if subscribing to a non-React external store |
| `use` | Use for reading promises and context in render (React 19+). Acceptable for streaming data with Suspense |

## Restricted Hooks

| Hook | Restriction |
|------|-------------|
| `useEffect` | Avoid — causes extra render cycle. Use only for true side effects (subscriptions, timers, DOM mutations). Never for derived state |
| `useContext` | Never for shared state (use Zustand). Acceptable only for dependency injection of non-reactive values (e.g., store instance) |
| `useReducer` | Avoid — use a store instead. Only acceptable for complex local state machines that are truly component-private |

## Forbidden Hooks

| Hook | Reason |
|------|--------|
| `useInsertionEffect` | Reserved for CSS-in-JS library authors — not application code |

## Components

| Component | Guidance |
|-----------|----------|
| `Fragment` (`<>...</>`) | Use freely to group elements without adding DOM nodes |
| `Suspense` | Use to wrap async boundaries (`use()` promises). Place at meaningful UI boundaries |
| `StrictMode` | Enabled at app root — do not remove |
| `memo` | Required on every exported component |
| `forwardRef` | Use when exposing DOM refs or imperative handles to parent components |
| `Activity` | Use for offscreen rendering / pre-rendering of hidden UI that needs to preserve state (e.g., tabs, panels) |

## Forbidden Components

| Component | Reason |
|-----------|--------|
| `lazy` | No code splitting — everything bundled upfront |
| `Profiler` | Development only — never commit to codebase |
