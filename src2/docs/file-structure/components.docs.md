# Component Patterns

## Purpose

Historically, complex behavior was packed into single large components so everything lived in one file. The problem: whenever any piece of state changed in that big component, the entire tree re-rendered, causing significant performance issues.

The solution is to break UI into smaller, focused components each wrapped in `memo()`. This limits the scope of re-renders — only the component whose specific slice of state changed will re-render, not its siblings or parent. Smaller components with a focused purpose are always preferred over monolithic components that do everything.

**Guiding principles:**

- One component = one responsibility
- Wrap every exported component in `memo()` to cut off unnecessary re-render propagation
- Read state via selectors so each component subscribes only to what it needs
- Prefer many small files over one giant file
- Never prop drill — use stores for shared state instead of passing props through intermediate components
- Never use default exports — all exports are named
- No Redux or Redux-like libraries (no reducers, no actions, no dispatch) — use Zustand

## Structure

Every component follows this structure outside its definition:

```typescript
//*****************************************************************************************
// My Component
//*****************************************************************************************

/** Props for MyComponent. */
export type MyComponentProps = {
  /** Whether the dialog is currently visible. */
  open: boolean;
  /** Callback fired when the user requests to close. */
  onClose: () => void;
};

const MyComponent = memo(({ open, onClose }: MyComponentProps) => {
  // ...
  return null;
});

MyComponent.displayName = 'MyComponent';
```

**Rules:**

- Every component is preceded by a comment delimiter block
- Props are defined as a named `type` export directly above the component
- Each prop has a JSDoc comment explaining its purpose
- Component uses `memo()` with an arrow function
- Every component must set `ComponentName.displayName = 'ComponentName'` for React DevTools

## Internal Hook Ordering

Hooks inside a component must always follow this order:

```typescript
const MyComponent = memo(({ onClose }: MyComponentProps) => {
  // 1. Library hooks (react-i18next, react-router, MUI, etc.)
  const { t } = useTranslation();
  const theme = useTheme();

  // 2. App/core hooks (store, API, snackbar, etc.)
  const isOpen = useAppConfig(c => c.layout.notifications.open);
  const setConfig = useAppSetConfig();

  // 3. useState (rare — only for truly local ephemeral state)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // 4. useRef
  const containerRef = useRef<HTMLDivElement>(null);

  // 5. useMemo (derived/computed values)
  const filteredItems = useMemo(() => items.filter(i => i.active), [items]);

  // 6. useMediaQuery (if any)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 7. useCallback (event handlers)
  const handleClose = useCallback(() => { ... }, []);

  // 8. useEffect (last resort — avoid when possible)
  useEffect(() => { ... }, []);

  return null;
});
```

## Function Style

- **Default:** Use `const` arrow functions for hooks, handlers, utilities
- **Components (no generics):** Use `memo()` with an arrow function — avoids writing the component name twice
- **Components (with generics):** Use the `function` keyword — the only case where `function` is needed

### Standard component (arrow + memo)

```typescript
//*****************************************************************************************
// My Component
//*****************************************************************************************

/** Props for MyComponent. */
export type ComponentProps = {
  /** Description of propA. */
  propA?: boolean;
  /** Description of propB. */
  propB?: string;
};

export const Component = memo(
  ({ propA = false, propB = '', ...props }: ComponentProps) => {
    // ...
    return null;
  }
);

Component.displayName = 'Component';
```

### Generic component (function keyword + forwardRef + type cast)

```typescript
//*****************************************************************************************
// My Component
//*****************************************************************************************

/** Props for MyComponent. */
export type ComponentProps<T extends BaseType> = {
  /** Description of propA. */
  propA?: boolean;
  /** Description of propB. */
  propB?: T;
};

export function WrappedComponent<const T extends BaseType>(
  { children, ...props }: ComponentProps<T>,
  ref: ForwardedRef<HTMLElement>
) {
  const handleClick = useCallback(() => {
    // ...
  }, []);

  return (
    <div {...props} ref={ref} onClick={handleClick}>
      {children}
    </div>
  );
}

export const Component = memo(forwardRef(WrappedComponent)) as <const T extends BaseType>(
  props: ComponentProps<T> & { ref?: ForwardedRef<HTMLElement> }
) => JSX.Element | null;

WrappedComponent.displayName = 'WrappedComponent';
(Component as any).displayName = 'Component';
```

### When to use which

| Scenario | Style |
| -------- | ----- |
| Component without generic props | Arrow function inside `memo()` |
| Component with generic type params | `function` keyword + `memo(forwardRef(...))` with type cast |
| Hooks, handlers, utilities | Arrow function |

## Event Handlers

Every function inside a component must be wrapped in `useCallback`. Naming distinguishes local handlers from prop callbacks:

| Prefix | Meaning | Example |
| ------ | ------- | ------- |
| `handle*` | Handled in this component | `const handleOpen = useCallback(...)` |
| `on*` | Passed in as a prop | `onClose: () => void` |

```typescript
//*****************************************************************************************
// My Component
//*****************************************************************************************

/** Props for MyComponent. */
export type MyDialogProps = {
  /** Callback fired when the dialog requests to close. */
  onClose: () => void;
};

const MyDialog = memo(({ onClose }: MyDialogProps) => {
  const handleSave = useCallback(() => {
    // local logic...
    onClose();
  }, [onClose]);

  return (
    <Button onClick={handleSave}>Save</Button>
  );
});

MyDialog.displayName = 'MyDialog';
```

**Rules:**

- All component-internal functions use `useCallback`
- Local handlers: `handle<Action>` (e.g., `handleOpen`, `handleSave`, `handleDelete`)
- Prop callbacks: `on<Action>` (e.g., `onClose`, `onChange`, `onSubmit`)
- A `handle*` function may call an `on*` prop — this signals the component processed the event before delegating up

## State: Store Over Props

Limit prop drilling in favor of store-based solutions for maximum performance and focused re-renders:

| Solution | When to Use |
| -------- | ----------- |
| `useAppConfig` / `useAppSetConfig` | App-wide state (layout, auth, config) |
| `createAppStore` | Feature-scoped state shared across a component tree |
| TanStack Form stores | Form state with validation |

Components read state directly from stores via selectors. This ensures only the subscribing component re-renders when its specific slice changes.

```typescript
const MyComponent = memo(() => {
  // ✅ Direct store access — focused re-render
  const isOpen = useAppConfig(c => c.layout.notifications.open);
  const count = useAppConfig(c => c.layout.notifications.items.length);

  // ✅ Feature-scoped store
  const selectedId = useStore(s => s.selectedId);

  return null;
});

MyComponent.displayName = 'MyComponent';
```

## Conditional Rendering

Use ternaries as the primary approach, `&&` for simple presence checks. Never use early returns.

```typescript
// ✅ Ternary — preferred for if/else rendering
return (
  <div>
    {isLoading ? <Spinner /> : <Content items={items} />}
  </div>
);

// ✅ && operator — for simple presence checks (render or nothing)
return (
  <div>
    {error && <ErrorMessage error={error} />}
    {items.length > 0 && <ItemList items={items} />}
  </div>
);

// ✅ Nested ternaries for multiple states (keep readable)
return (
  <div>
    {isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : <Content items={items} />}
  </div>
);

// ❌ Never early return for conditional rendering
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage />;
return <Content />;
```

**Rules:**
- Ternary for either/or rendering (show A or B)
- `&&` for show-or-nothing (show A or nothing)
- Never early return — the component always returns a single JSX expression
- For complex multi-state conditions, extract into a `useMemo` variable

## Hook & React API Usage

### Hooks

| Hook | Guidance |
|------|----------|
| `useState` | Rarely needed — most state belongs in a store. Use only for truly local, ephemeral UI state (e.g., tooltip anchor, local animation flag) |
| `useEffect` | Avoid — waits for a render cycle before executing. Prefer event handlers, mutation callbacks, or store subscriptions |
| `useRef` | Fine to use whenever needed (DOM refs, mutable values that don't trigger re-renders) |
| `useMemo` | Fine to use for expensive derived computations |
| `useCallback` | Required for all component-internal handlers |
| `useContext` | Avoid for shared state (use Zustand). Acceptable for dependency injection of non-reactive values (e.g., store instance from `createAppStore`) |
| `useReducer` | Avoid — use a store instead. Only acceptable for complex local state machines that are truly component-private |
| `useImperativeHandle` | Use with `forwardRef` when a parent needs to call imperative methods on a child |
| `useLayoutEffect` | Use when you need synchronous DOM measurements before paint. Prefer over `useEffect` for layout calculations |
| `useDeferredValue` | Use for deferring expensive re-renders of non-urgent UI (e.g., filtering a large list while typing) |
| `useTransition` | Use to mark state updates as non-blocking transitions (e.g., tab switching, heavy computations) |
| `useId` | Use for generating unique IDs for accessibility attributes (`aria-labelledby`, `htmlFor`) — never for keys |

### Components

| Component | Guidance |
|-----------|----------|
| `Fragment` (`<>...</>`) | Use freely to group elements without adding DOM nodes |
| `Suspense` | Use to wrap async boundaries. Place at meaningful UI boundaries |
| `StrictMode` | Enabled at app root — do not remove |
| `lazy` | Use for route-level code splitting only. Do not lazy-load small components |
