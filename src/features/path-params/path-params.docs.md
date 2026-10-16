# Features/Path-Params

## 1. Purpose

Type-safe URL path parameter extraction and serialization. The module derives parameter keys from route path literals and creates codecs that parse `Location.pathname` values into typed objects and serialize typed values back into paths.

## 2. Features

- **Typed parameter keys** - Derives `:param` keys from a path literal at compile time
- **Blueprint-based parsing** - Supports string, number, boolean, and enum parameter values
- **URL encoding** - Decodes path values during parsing and encodes them during serialization
- **Default values** - Resolves missing or invalid values to the configured blueprint default
- **Route integration** - Provides the codec consumed by `createAppRoute`

## 3. Concepts

### Route Path

`RoutePath` represents a route pattern that may contain `:param` segments, such as `/alerts/:id`.

### Blueprint

`InferPathParamBlueprintFromValue<Value>` defines how one path parameter is handled:

- `type` is a representative value used for type inference.
- `parse(value)` converts a raw path segment into the typed value.
- `stringify(value)` converts the typed value into a path segment.

### Blueprint Map

`InferPathParamBlueprintMapFromPath<Path>` maps every parameter key extracted from `Path` to a blueprint. A path without parameters resolves to `never`.

### Codec

`InferPathParamCodecFromPath<Path>` describes the codec returned by `createPathParamsCodec`. The runtime codec contains:

- `blueprints` - The configured parameter blueprints
- `type` - A typed object used for inference
- `parse(location)` - Reads and converts values from `location.pathname`
- `stringify(params)` - Replaces `:param` segments with encoded values

## 4. Configuration

### Available Blueprint Types

| Blueprint | Default | Behavior |
| --- | --- | --- |
| `string(defaultValue?)` | `''` | Returns the raw segment or the default when it is missing |
| `number(defaultValue?)` | `0` | Converts the segment with `Number`, using the default for invalid numbers |
| `boolean(defaultValue?)` | `false` | Converts `true`/`1` to `true` and `false`/`0` to `false` |
| `enum(values, defaultValue?)` | `values[0]` | Returns a matching value or the default |

### Creating A Codec

```typescript
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/alerts/:id')(blueprints => ({
  id: blueprints.string()
}));
```

The path literal determines the required blueprint keys. Each key must have a matching blueprint in the callback result.

## 5. Usage

Codecs accept a React Router `Location` and return an object containing the parsed parameters:

```typescript
import type { Location } from 'react-router';

const location: Location = {
  hash: '',
  key: 'default',
  pathname: '/alerts/123',
  search: '',
  state: null
};

const values = codec.parse(location);
// values: { id: string }

const pathname = codec.stringify({ id: '456' });
// pathname: '/alerts/456'
```

In the application, `createAppRoute` creates and owns the codec from its `path` and `params` options. Route components read the parsed values through `useAppPathParams`:

```typescript
import { useAppPathParams } from 'core/router';
import { PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';

const alertParams = (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => ({
  id: blueprints.string()
});

// Passed to createAppRoute({ path: '/alerts/:id', params: alertParams, ... })

const AlertPage = () => {
  const { id } = useAppPathParams<'/alerts/:id'>();
  return <div>{id}</div>;
};
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `path-params.models.ts` | Public path, blueprint, inferred-value, and codec types |
| `path-params.utils.ts` | Blueprint factories and codec creation |
| `path-params.utils.test.ts` | Unit tests for parsing and serialization |
| `index.ts` | Explicit public exports |

### Type Utilities

| Type | Purpose |
| --- | --- |
| `RoutePath` | Route path pattern type |
| `PathParamValue` | Allowed string, number, and boolean values |
| `InferPathParamKeyFromPath<Path>` | Extracts parameter keys from a path literal |
| `InferPathParamBlueprintFromValue<Value>` | Defines one parameter blueprint |
| `InferPathParamBlueprintMapFromPath<Path>` | Maps extracted keys to blueprints |
| `InferPathParamValuesFromBlueprintMap<Blueprints>` | Resolves blueprint values into an object type |
| `InferPathParamCodecFromPath<Path>` | Describes the inferred codec type for a path |

### Data Flow And Boundaries

The input boundary is a route `Location` and its pathname. The codec locates each `:param` segment, decodes the corresponding value, and passes it through the configured blueprint parser. Serialization reverses the process and encodes each blueprint value into the path. Missing or invalid values are handled by the blueprint defaults.

## 7. Related Modules

- `core/routes/` - Creates path codecs for application routes and exposes parsed values through route hooks
- `features/search-params/` - Provides the parallel typed codec system for query parameters
- `features/hash-params/` - Provides typed codecs for a single URL hash value
