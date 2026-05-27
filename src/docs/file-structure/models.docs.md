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
| ---- | ------- |
| `models/base/` | Mirror of backend models from the assemblyline-base repository. Must match the backend exactly — same field names, descriptions, and sorting |
| `models/messages/` | Mirror of backend message models from assemblyline-base. Same parity rules apply |
| `models/ontology/` | Mirror of backend ontology models from assemblyline-base. Same parity rules apply |
| `models/api/` | Types for API request inputs and response outputs. Will eventually be auto-generated from OpenAPI specs to guarantee frontend/backend parity |

**Backend parity rule:** Models mirrored from assemblyline-base must be identical to the backend definitions — same field descriptions, same field ordering, same optionality. When the backend changes, these types must be updated to match.

## Declaration Rules

- Always use `type` over `interface` (consistency, union support, no declaration merging surprises)
- Export all types that are used outside their file
- Name types in `PascalCase`
- Suffix prop types with `Props` — input parameters of a component or function (e.g., `<Name>Props`)
- Suffix return types with `ReturnType` — output of a function, opposite of `Props` (e.g., `<Name>ReturnType`)
- Suffix store types with `Store` (e.g., `<Name>Store`)
- Suffix config types with `Config` (e.g., `<Name>Config`)

### Value-or-Updater Pattern (SetStateAction)

When a parameter accepts either a direct value **or** a function that derives the next value from the previous one, use React's `SetStateAction<T>`:

```typescript
import type { SetStateAction } from 'react';

// Equivalent to: To | ((prev: To) => To)
type NavigateTo = SetStateAction<To>;
```

This pattern is common in route navigation, store setters, and any API where the caller can either provide a new value directly or compute it from the current value. Always prefer `SetStateAction<T>` over manually writing the union.

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
  /** Callback invoked when the record is deleted. */
  onDelete?: () => void;
  /** Callback invoked when the record is saved. */
  onSave?: (data: unknown) => void;
};
```

**Rules:**

- Fields are always sorted alphabetically, with function-typed fields grouped at the bottom (also sorted alphabetically among themselves)
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

## Collection & Generic Type Naming

When modelling a collection of items and their derived types, use these suffixes consistently:

| Prefix/Suffix       | Meaning                                                          | Example                                       |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `Base` (prefix)     | Generic template shape from a factory (before narrowing)         | `BaseItem`, `BaseItems`                       |
| `s` (plural)        | Array/tuple of all items                                         | `Items`, `Widgets`                            |
| (singular)          | Union of items from the array (`Array[number]`)                  | `Item`, `Widget`                              |
| `Infer<Thing>From<Model>` | Infer a type from another type via a generic | `InferItemFromId<I>`, `InferValueFromConfig<C>` |
| `Map`               | Keyed record of definitions, blueprints, or runtimes             | `WidgetMap`, `ConfigMap<C>`                   |
| `Values`            | Inferred runtime values derived from the map's types             | `WidgetValues<M>`, `ConfigValues<M>`          |

### Distinction Between Map and Values

- **`Map`** holds the *definitions/configuration* — the objects that describe structure or behavior. It's always a `Record<Key, Definition>`.
- **`Values`** holds the *resolved output* — the actual runtime values inferred by applying each definition's type system. It's always `{ [K in keyof Map]: InferValue<Map[K]> }`.

```typescript
// Map — contains DEFINITIONS (the configuration objects)
export type ConfigMap = Record<string, Config>;

// Values — contains RESOLVED runtime values (string, number, boolean, etc.)
export type ConfigValues<M extends ConfigMap> = {
  [K in keyof M]: InferValue<M[K]>;
};
```

### Inferring a Type From Another (Infer...From)

When a generic type definition infers/extracts a type from another type, use the `Infer<Thing>From<Model>` pattern:

- `Infer` prefix signals that the type is derived/computed from the generic input
- `From` separates the output type from the input model
- The model name tells you *what type* is being used as the source
- Implemented via `Extract<Union, { field: Key }>`, conditional types, or template literal inference

```typescript
// Infer an Item from an Id
export type InferItemFromId<I extends Id> = Extract<Item, { id: I }>;

// Infer a Value from a Config
export type InferValueFromConfig<C extends Config> = /* conditional type */;

// Infer Keys from a Path string
export type InferKeysFromPath<P extends Path> = /* infers keys from path string */;
```

### `typeof` Constants — Inline, Don't Alias

When you need the TypeScript type of a runtime constant, prefer inlining `typeof CONSTANT` at usage sites rather than creating a named type alias:

```typescript
// ✅ Inline typeof — the relationship is explicit
export type InferValueFromBlueprint<B extends (typeof BLUEPRINTS)[string]> = ...;
const map: typeof SEARCH_PARAM_RUNTIME_MAP = ...;

// ❌ Named alias shadows the constant name — confusing
export type SearchParamRuntimeMap = typeof SEARCH_PARAM_RUNTIME_MAP;
```

**Why:**

- A `PascalCase` type alias like `SearchParamRuntimeMap` looks nearly identical to the `SCREAMING_SNAKE` constant `SEARCH_PARAM_RUNTIME_MAP` — readers can't tell at a glance which is the type and which is the value.
- Inline `typeof` makes the derivation visible — you always know the type comes from a runtime constant.
- One fewer export to maintain and import.

**Exception:** If the same `typeof CONSTANT` expression appears in 5+ files, a named alias is acceptable to reduce repetition.

### Base (Generic Template) vs Specific Implementation

When a factory function produces a generic shape and the app later narrows it to specific instances, use the `Base` **prefix** to distinguish the two levels:

| Prefix | Meaning | When to use |
| ------ | ------- | ----------- |
| `Base` | Generic template shape — the factory's return type before narrowing | Utility functions, library constraints, factory signatures |
| (none) | Specific registered instances — the app's actual implementations | App-level code, hooks, components consuming real instances |

The `Base` type is always **wider** — it accepts any output of the factory. The unprefixed type is always a **narrower subset** — it only includes the items actually registered in your app.

```typescript
// Base — the generic template shape (any item the factory can produce)
export type BaseItem = ReturnType<typeof createItem>;
export type BaseItems = readonly BaseItem[];

// Specific — the actual items registered in the app
export const ITEMS = [itemA, itemB, itemC] as const;
export type Items = typeof ITEMS;
export type Item = Items[number];
```

**Usage pattern:**

```typescript
// Utilities accept the Base type — they work with any item
export const findItem = (items: BaseItems, id: string): BaseItem | null => ...

// App code uses the specific type — it knows exactly which items exist
export const useCurrentItem = (): Item => ...
```

**Rules:**

- Derive `Base` from the factory: `type BaseItem = ReturnType<typeof createItem>`
- Derive the specific type from the const array: `type Item = (typeof ITEMS)[number]`
- Use `Base` in reusable utilities that don't need to know which specific instances exist
- Use the unprefixed type in app-level code that depends on the concrete set of instances

### Full Example

```typescript
// Array (plural) — the full collection
export const ITEMS = [itemA, itemB, itemC] as const;

// Union (singular) — one item OR another
export type Item = (typeof ITEMS)[number];

// Map — keyed record of definitions
export type ItemMap = Record<string, Item>;

// Values — inferred runtime output
export type ItemValues<M extends ItemMap> = {
  [K in keyof M]: InferValue<M[K]>;
};

// Infer...From — infer a type from another type via a generic
export type InferValueFromItem<I extends Item> = InferValue<I>;
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
