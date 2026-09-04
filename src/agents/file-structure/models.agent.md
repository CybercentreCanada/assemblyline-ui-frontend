# Models & Types — AI Rules

## Must

- Use `type` keyword only — never `interface`
- Use `import type { X }` — never `import { type X }`
- Every field must have a JSDoc comment
- Every type must have a JSDoc comment explaining its purpose
- Fields must be sorted alphabetically, with function-typed fields grouped at the bottom (also sorted alphabetically among themselves)
- Every shared model type must have a `DEFAULT_<MODEL>` constant
- Optional fields must use `?` — never `| undefined`
- Types must live in `*.models.ts` files — not in component files
- Export all types used outside their file
- Explicitly type all hook usages (`useState<T>`, `useRef<T>`, `useMemo<T>`, etc.)

## Never

- NO `interface` — use `type`
- NO `any` — use `unknown` with narrowing
- NO `React.FC` or `React.FunctionComponent`
- NO TypeScript `enum` — use `const` arrays
- NO inline type imports (`import { type X }`)
- NO Zod for API responses — only for localStorage config validation
- NO types defined in component files

## Naming Conventions

| Suffix                 | Usage                                           |
| ---------------------- | ----------------------------------------------- |
| `Props`                | Input parameters of a component or function     |
| `ReturnType`           | Return type of a function (opposite of `Props`) |
| `Store`                | Zustand store types                             |
| `Config`               | Configuration types                             |
| `SCREAMING_SNAKE_CASE` | Default constants, const arrays                 |
| `PascalCase`           | All type names                                  |

## Value-or-Updater Pattern

When a parameter accepts either a direct value or a function that derives the next value from the previous one, use React's `SetStateAction<T>` from `react`:

```typescript
import type { SetStateAction } from 'react';

// T | ((prev: T) => T)
type NavigateTo = SetStateAction<To>;
```

- Prefer `SetStateAction<T>` over manually writing `T | ((prev: T) => T)`
- Use it anywhere a setter accepts a value or updater callback (route navigation, store setters, etc.)

## Collection & Generic Type Naming

When modelling a collection of items and their derived types, use these suffixes consistently:

| Prefix/Suffix             | Meaning                                                           | Example                                         |
| ------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `Base` (prefix)           | Generic template shape from a factory (before narrowing)          | `BaseItem`, `BaseItems`                         |
| `s` (plural)              | Array/tuple of all items                                          | `Items`, `Widgets`                              |
| (singular)                | Union of items from the array (`Array[number]`)                   | `Item`, `Widget`                                |
| `Infer<Thing>From<Model>` | Infer a type from another type via a generic                      | `InferItemFromId<I>`, `InferValueFromConfig<C>` |
| `Map`                     | A keyed object/record whose values are instances of the item type | `WidgetMap`, `ConfigMap<C>`                     |
| `Values`                  | Inferred runtime values derived from the map's blueprint types    | `WidgetValues<M>`, `ConfigValues<M>`            |

### Rules

- **`Map`** = a `Record<Key, Item>` where each value is the _definition/blueprint/runtime_ of a param
- **`Values`** = a `{ [K]: InferValue<Map[K]> }` where each value is the _resolved runtime value_
- **`Infer...From<Model>`** = infers/extracts a type from another type using the specified model as the generic input
- **`Base`** = the generic template shape produced by a factory, before it is narrowed to specific instances
- Always name with `Infer` prefix and `From` before the model: `InferThingFromModel<Key>` (e.g., `InferItemFromId<I>`, `InferValueFromConfig<C>`)

## `typeof` Constants — Inline, Don't Alias

When the resolved type of a constant is needed, use `typeof CONSTANT` inline rather than creating a named type alias:

```typescript
// ✅ Inline typeof at usage sites
export type InferValueFromBlueprint<B extends (typeof BLUEPRINTS)[string]> = ...;
const map: typeof SEARCH_PARAM_RUNTIME_MAP = ...;

// ❌ Don't create a type alias that shadows the constant name
export type SearchParamRuntimeMap = typeof SEARCH_PARAM_RUNTIME_MAP;
```

- A named `typeof` alias adds a name that's confusingly similar to the constant itself
- Inline `typeof` makes the relationship explicit — readers see exactly what it derives from
- Exception: if the same `typeof` expression is used in 5+ files, a named alias is acceptable

## Base (Generic Template) vs Specific Implementation

When a factory produces a generic shape and the app narrows it to specific instances:

| Prefix | Meaning                                                             | Example                 |
| ------ | ------------------------------------------------------------------- | ----------------------- |
| `Base` | Generic template shape — the factory's return type before narrowing | `BaseItem`, `BaseItems` |
| (none) | Specific registered instances — the app's actual implementations    | `Item`, `Items`         |

### Rules

- **`Base`** types are used in utility functions, library constraints, and factory return types
- **Unprefixed** types are used in app-level code, hooks, and components that consume real instances
- The `Base` type is always wider — the unprefixed type is always a subset
- Derive unprefixed from the const array: `type Item = (typeof ITEMS)[number]`
- Derive `Base` from the factory return type: `type BaseItem = ReturnType<typeof createItem>`

### Example

```typescript
// Array (plural) — the full collection
export const ITEMS = [itemA, itemB, itemC] as const;

// Union (singular) — one item OR another
export type Item = (typeof ITEMS)[number];

// Map — keyed object containing definitions
export type ItemMap = Record<string, Item>;

// Values — inferred runtime values from the map
export type ItemValues<M extends ItemMap> = {
  [K in keyof M]: InferValue<M[K]>;
};

// Infer...From — infer a type from another type via a generic
export type InferValueFromItem<I extends Item> = InferValue<I>;
```

## Placement

| Path                 | Purpose                            |
| -------------------- | ---------------------------------- |
| `<module>.models.ts` | Module-specific types              |
| `models/base/`       | Backend mirror (assemblyline-base) |
| `models/messages/`   | Backend message models             |
| `models/ontology/`   | Backend ontology models            |
| `models/api/`        | API request/response types         |
| `shared/`            | Generic TypeScript utility types   |

## Type Template

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

## Default Value Template

```typescript
export const DEFAULT_RECORD: Record = {
  active: false,
  createdAt: '',
  id: '',
  label: '',
  score: 0
};
```

- Defined directly below its type
- Fields sorted alphabetically (matching the type)
- Sensible zero-values: empty strings, `false`, `0`, `[]`

## Enum Pattern (const array + derived type)

```typescript
export const STATUS = ['pending', 'active', 'completed', 'archived'] as const;
export type Status = (typeof STATUS)[number];
```

- Array in `SCREAMING_SNAKE_CASE`, defined above its derived type
- Type in `PascalCase`, derived via `(typeof ARRAY)[number]`

## Constant Maps

```typescript
export const STATUS_LABELS = {
  active: 'Active',
  archived: 'Archived',
  completed: 'Done',
  pending: 'Waiting'
} as const;
```

## Zod (localStorage only)

```typescript
export const StoredConfigSchema = z.object({
  enabled: z.boolean(),
  label: z.string(),
  maxItems: z.number()
});

export type StoredConfig = z.infer<typeof StoredConfigSchema>;
```

- Only for localStorage/sessionStorage parsing
- Never for API responses, props, or store state

## Hook Typing

```typescript
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
const containerRef = useRef<HTMLDivElement>(null);
const filtered = useMemo<Item[]>(() => items.filter(i => i.active), [items]);
const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => { ... }, []);
```
