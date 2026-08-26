# Features/State-Params

## 1. Purpose

Type-safe route state parsing and serialization with default-value reconciliation. State params let a route declare the shape of `location.state`, then consistently merge incoming navigation state with route defaults so consumers always receive a complete typed object.

## 2. Features

- **Blueprint-based codec** — State shape is declared once and compiled into a reusable codec
- **Default reconciliation** — Missing state fields are filled from route defaults
- **Nested object support** — Deep objects and arrays are merged safely
- **Partial input support** — Navigation can provide only the fields it wants to override
- **Type inference** — Route `state` values are inferred directly from the declared default object

## 3. Concepts

### Blueprint

A `StateParamBlueprint<T>` defines a state shape and how it is parsed/serialized:

- `type` — The default typed object used for inference
- `parse(value) -> T` — Merges raw `location.state` into the default object
- `stringify(value) -> Location['state']` — Merges a partial override into the default object before storing it

### Codec

`createStateParamCodec(...)` compiles a blueprint into:

- `blueprint` — The original blueprint definition
- `type` — A cloned default typed object for inference
- `parse(location)` — Reads and reconciles `location.state`
- `stringify(value)` — Produces a complete state object from a partial input

### Merge Behavior

The state codec preserves defaults unless an incoming value explicitly overrides them:

- Primitive fields are replaced when present
- Nested objects are merged recursively
- Arrays are replaced only when the incoming value is an array
- Invalid shapes fall back to defaults

## 4. Configuration

### Creating a Blueprint

```ts
import { createStateParamCodec } from 'features/state-params';

const stateCodec = createStateParamCodec(blueprint =>
  blueprint({
    test: 'asd',
    view: 'summary',
    filters: {
      severity: 'all',
      includeSuppressed: false
    }
  })
);
```

### Route Usage

```ts
export const AppRoute = createAppRoute({
  component: DetailPage,
  route: '/items/:id',
  path: s => ({
    id: s.string()
  }),
  search: s => ({
    name: s.string(null)
  }),
  state: s =>
    s({
      test: 'asd',
      view: 'summary',
      filters: {
        severity: 'all',
        includeSuppressed: false
      }
    })
});
```

This makes route values infer:

```ts
{
  state?: {
    test?: string;
    view?: string;
    filters?: {
      severity?: string;
      includeSuppressed?: boolean;
    };
  }
}
```

while parsed route params expose the full resolved state object.

## 5. Usage

### Parsing from a Location

```ts
const location = {
  key: 'default',
  pathname: '/items/abc',
  search: '',
  hash: '',
  state: { view: 'details' }
};

stateCodec.parse(location);
// {
//   test: 'asd',
//   view: 'details',
//   filters: { severity: 'all', includeSuppressed: false }
// }
```

### Stringifying a Partial Override

```ts
stateCodec.stringify({
  filters: { severity: 'high' }
});
// {
//   test: 'asd',
//   view: 'summary',
//   filters: { severity: 'high', includeSuppressed: false }
// }
```

## 6. Codebase (Internals)

### Key Files

| File                         | Role                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| `state-params.models.ts`     | State param primitives, shapes, blueprint, and codec inference types |
| `state-params.codec.ts`      | Merge helpers, blueprint factory, and codec factory                  |
| `state-params.codec.test.ts` | Unit tests for merge, blueprint, and codec behavior                  |
| `index.ts`                   | Public exports                                                       |

### Related Modules

- `core/routes/routes.factories.tsx` — Builds route-level state codecs from route definitions
- `core/routes/routes.utils.tsx` — Parses and serializes route state during navigation
- `core/router/` — Carries the serialized route state through navigation and history
