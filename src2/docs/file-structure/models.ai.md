# Models & Types — AI Rules

## Must

- Use `type` keyword only — never `interface`
- Use `import type { X }` — never `import { type X }`
- Every field must have a JSDoc comment
- Every type must have a JSDoc comment explaining its purpose
- Fields must be sorted alphabetically
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

| Suffix | Usage |
|--------|-------|
| `Props` | Component prop types |
| `Store` | Zustand store types |
| `Config` | Configuration types |
| `SCREAMING_SNAKE_CASE` | Default constants, const arrays |
| `PascalCase` | All type names |

## Placement

| Path | Purpose |
|------|---------|
| `<module>.models.ts` | Module-specific types |
| `models/base/` | Backend mirror (assemblyline-base) |
| `models/messages/` | Backend message models |
| `models/ontology/` | Backend ontology models |
| `models/api/` | API request/response types |
| `shared/` | Generic TypeScript utility types |

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
};
```

## Default Value Template

```typescript
export const DEFAULT_RECORD: Record = {
  active: false,
  createdAt: '',
  id: '',
  label: '',
  score: 0,
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
  pending: 'Waiting',
} as const;
```

## Zod (localStorage only)

```typescript
export const StoredConfigSchema = z.object({
  enabled: z.boolean(),
  label: z.string(),
  maxItems: z.number(),
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
