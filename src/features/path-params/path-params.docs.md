# Features/Path-Params

## 1. Purpose

Type-safe URL path parameter extraction and encoding. Provides compile-time type checking for route parameters so that if a route path like `/alerts/:id` changes its param name or type, every consumer breaks at build time rather than silently reading `undefined` at runtime.

## 2. Features

- **Blueprint-based codecs** — Each path param is defined with a typed blueprint that handles parse + stringify
- **Compile-time param key extraction** — TypeScript infers param keys directly from the path string literal (e.g., `/alerts/:id/:tab` → `{ id, tab }`)
- **Safe URL encoding** — `encodeURIComponent`/`decodeURIComponent` applied automatically during stringify/parse
- **Primitive type support** — `string`, `number`, `boolean` with configurable default values
- **Graceful fallback** — Invalid or missing URL segments resolve to the blueprint's default value instead of crashing

## 3. Concepts

### Blueprint

A `PathParamBlueprint<T>` defines how a single path param segment is handled:

- `type` — The TypeScript type marker (used for inference only)
- `parse(value: string | undefined) → T` — Converts a raw URL segment into the typed value
- `stringify(value: T) → string` — Converts a typed value back to a URL-safe string

### Blueprint Map

`PathParamBlueprintMap<Path>` is a record keyed by the param names extracted from the path string. For `/alerts/:id/:sha256`, the map must have keys `id` and `sha256`, each holding a blueprint.

### Codec

`PathParamCodec<Blueprints>` is the compiled output of `createPathParamsCodec`. It contains:

- `blueprints` — The original blueprint definitions
- `type` — A typed object used for inference (never read at runtime)
- `parse(location) → values` — Splits `location.pathname` by the base path and applies each blueprint's parser
- `stringify(params) → pathname` — Replaces `:param` segments with encoded values from the typed object

### Path Key Extraction

The `PathParamKeyForPath<Path>` utility type recursively extracts `:param` segments from a string literal path. This is what makes the system fully type-safe — no manual key declarations needed.

## 4. Configuration

### Available Blueprint Types

| Blueprint | Default | Parse logic |
| --------- | ------- | ----------- |
| `string(defaultValue?)` | `''` | Returns raw segment or default |
| `number(defaultValue?)` | `0` | `Number(value)`, falls back if `NaN` |
| `boolean(defaultValue?)` | `false` | `'true'`/`'1'` → true, `'false'`/`'0'` → false |

### Creating a Codec

```typescript
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/alerts/:id')(blueprints => ({
  id: blueprints.string()
}));

// codec.parse(location) → { id: string }
// codec.stringify({ id: '123' }) → '/alerts/123'
```

### Multi-Param Route

```typescript
const codec = createPathParamsCodec('/files/:sha256/:section')(blueprints => ({
  sha256: blueprints.string(),
  section: blueprints.number(0)
}));

// codec.parse(location) → { sha256: string, section: number }
// codec.stringify({ sha256: 'abc', section: 2 }) → '/files/abc/2'
```

## 5. Usage

Path param codecs are not used directly by page components. They are consumed internally by `createAppRoute` (in `core/routes`) which wires the codec into the route's store. Page components access params via `useAppPathParams`:

```typescript
// In a page component:
const id = useAppPathParams('/alerts/:id', params => params.id);
```

The codec handles the parsing step invisibly — when the router detects a location change, it calls `codec.parse(location)` and writes the result to the route store.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| ---- | ---- |
| `path-params.models.ts` | Type definitions: `RoutePath`, `PathParamBlueprint`, `PathParamBlueprintMap`, `PathParamCodec`, `PathParamKeyForPath` |
| `path-params.codec.ts` | `PATH_PARAM_BLUEPRINTS_MAP` (blueprint factories), `createPathParamsCodec` (codec factory) |
| `path-params.codec.test.ts` | Unit tests for codec parse/stringify |
| `index.ts` | Public exports |

### Type Utilities

| Type | Purpose |
| ---- | ------- |
| `RoutePath` | Alias for `string` — the raw path pattern |
| `PathParamKeyForPath<Path>` | Extracts `:param` keys from a path literal |
| `PathParamBlueprint<T>` | Single param definition (type + parse + stringify) |
| `PathParamBlueprintMap<Path>` | Record of all params for a given path |
| `PathParamBlueprintValues<Blueprints>` | Resolved value types for all params |
| `PathParamCodec<Blueprints>` | The full codec (blueprints + type + parse + stringify) |

### Related Modules

- `core/routes/` — Consumes codecs via `createAppRoute` to build typed route definitions
- `features/search-params/` — Parallel system for query string params (blueprint-based, same philosophy)
