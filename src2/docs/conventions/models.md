# Models & Types

## Purpose

Everything in the app must be typed. TypeScript's compiler is the first line of defense — if something is wrong, it should fail at compile time, not at runtime. Avoid `any` at all costs; use `unknown` with type narrowing when the type is truly unknown.

Every hook, utility function, and component must clearly define what it accepts and what it returns. Explicit parameter types and return types ensure the compiler catches mismatches immediately when code changes, rather than silently passing broken data through the system.

Well-typed models also serve as living documentation — reading a type definition tells you exactly what shape the data has without needing to trace through runtime behavior.

## Where Types Live

- All shared types live in `*.models.ts` files
- Types are co-located with their module (e.g., `router.models.ts` in `core/router/`)
- Domain entity types live in `models/` (the top-level layer)
- Generic TypeScript utility types (mapped types, conditional types, etc.) live in `shared/`

### `models/` Structure

| Path | Purpose |
|------|---------|
| `models/base/` | Mirror of backend models from the assemblyline-base repository. Must match the backend exactly — same field names, descriptions, and sorting |
| `models/messages/` | Mirror of backend message models from assemblyline-base. Same parity rules apply |
| `models/ontology/` | Mirror of backend ontology models from assemblyline-base. Same parity rules apply |
| `models/api/` | Types for API request inputs and response outputs. Will eventually be auto-generated from OpenAPI specs to guarantee frontend/backend parity |

**Backend parity rule:** Models mirrored from assemblyline-base must be identical to the backend definitions — same field descriptions, same field ordering, same optionality. When the backend changes, these types must be updated to match.

## Declaration Rules

- Always use `type` over `interface` (consistency, union support, no declaration merging surprises)
- Export all types that are used outside their file
- Name types in `PascalCase`
- Suffix prop types with `Props` (e.g., `<Name>Props`)
- Suffix store types with `Store` (e.g., `<Name>Store`)
- Suffix config types with `Config` (e.g., `<Name>Config`)

## Structure

```typescript
/** Represents a record in the system. */
export type Record = {
  /** Whether this record is currently active. */
  active: boolean;
  /** Timestamp of creation. */
  createdAt: string;
  /** Unique identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Numeric score value. */
  score?: number;
};
```

**Rules:**
- Fields are always sorted alphabetically
- Each type has a JSDoc comment explaining its purpose
- Each field has a JSDoc comment explaining what it represents
- Optional fields use `?` — never `| undefined`
- Use `readonly` for fields that should never be mutated after creation
- Group related types in the same file

## Default Values

Every shared model type must have a corresponding `DEFAULT_<MODEL>` constant that provides default values. This is used whenever a new instance of that type needs to be created:

```typescript
/** Represents a record in the system. */
export type Record = {
  /** Whether this record is currently active. */
  active: boolean;
  /** Timestamp of creation. */
  createdAt: string;
  /** Unique identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Numeric score value. */
  score: number;
};

export const DEFAULT_RECORD: Record = {
  active: false,
  createdAt: '',
  id: '',
  label: '',
  score: 0,
};
```

**Rules:**
- Named `DEFAULT_<MODEL>` in `SCREAMING_SNAKE_CASE`
- Defined directly below its type in the same file
- Fields sorted alphabetically (same as the type)
- Provides sensible zero-values (empty strings, false, 0, empty arrays)

## Zod Schemas

Zod is used exclusively for parsing and validating localStorage config values. Since the backend API handles its own validation, API responses are always trusted to match their model definitions — no Zod parsing needed on API data.

```typescript
export const StoredConfigSchema = z.object({
  enabled: z.boolean(),
  label: z.string(),
  maxItems: z.number(),
});

export type StoredConfig = z.infer<typeof StoredConfigSchema>;
```

**When to use Zod:**
- Parsing localStorage/sessionStorage config values
- Ensuring manually edited storage values don't break the app

**When NOT to use Zod:**
- API responses (backend validates; trust the model)
- Internal type definitions (just use `type`)
- Props (validated by TypeScript at compile time)
- Store state (controlled internally)

## Enums & Constants

Never use TypeScript `enum`. Instead, declare a `const` array of values and derive the type from it:

```typescript
// ✅ Const array + derived type
export const STATUS = ['pending', 'active', 'completed', 'archived'] as const;
export type Status = (typeof STATUS)[number];

// ❌ Never use enum
enum Status { Pending, Active, Completed, Archived }
```

**Rules:**
- Array name in `SCREAMING_SNAKE_CASE`
- Type name in `PascalCase`, derived via `(typeof ARRAY)[number]`
- The array is the source of truth — use it for iteration, validation, dropdowns, etc.
- Array is defined directly above its derived type

For constant maps, use `as const` assertions:

```typescript
export const STATUS_LABELS = {
  active: 'Active',
  archived: 'Archived',
  completed: 'Done',
  pending: 'Waiting',
} as const;
```

## Generics

- Use descriptive generic names for public APIs (`Route`, `Store`, `Config`)
- Use single letters only for simple, obvious constraints (`T`, `K`, `V`)
- Constrain generics with `extends` to provide type safety
- Use `const` type parameter when you need literal type inference

## Typing React Hooks

Every hook usage must be explicitly typed. Never rely on implicit `any` or overly broad inference.

### useState

```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

### useRef

```typescript
// DOM ref
const containerRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

// Mutable value ref
const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
```

### useMemo

```typescript
const filtered = useMemo<Item[]>(() => items.filter(i => i.active), [items]);
const total = useMemo<number>(() => items.reduce((sum, i) => sum + i.value, 0), [items]);
```

### useCallback

```typescript
const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
  // ...
}, []);

const handleChange = useCallback((value: string): string => {
  // ...
}, []);
```

### useReducer

```typescript
type State = { count: number; error: string | null };
type Action = { type: 'increment' } | { type: 'set_error'; payload: string };

const [state, dispatch] = useReducer<State, Action>(
  (prev, action) => {
    switch (action.type) {
      case 'increment': return { ...prev, count: prev.count + 1 };
      case 'set_error': return { ...prev, error: action.payload };
    }
  },
  { count: 0, error: null }
);
```

### useContext

```typescript
type ThemeContextValue = { mode: 'light' | 'dark'; toggle: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

const theme = useContext<ThemeContextValue | null>(ThemeContext);
```

### useImperativeHandle

```typescript
type Handle = { focus: () => void; reset: () => void };

useImperativeHandle<Handle>(ref, () => ({
  focus: () => inputRef.current?.focus(),
  reset: () => inputRef.current?.value = '',
}), []);
```

### useDeferredValue

```typescript
const deferredQuery = useDeferredValue<string>(query);
const deferredItems = useDeferredValue<Item[]>(items);
```

### useSyncExternalStore

```typescript
const width = useSyncExternalStore<number>(
  (callback) => { window.addEventListener('resize', callback); return () => window.removeEventListener('resize', callback); },
  () => window.innerWidth
);
```
