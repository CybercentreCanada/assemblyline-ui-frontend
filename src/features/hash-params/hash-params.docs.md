# Features/Hash-Params

## 1. Purpose

Typed parsing and serialization for a single value in a URL hash fragment. The module defines hash blueprints, creates codecs for reading and writing hash values, and integrates with application routes through `core/routes`.

## 2. Features

- **Single value** - Resolves one string, number, or boolean value rather than an object of values
- **Blueprint-based parsing** - Supports unrestricted strings and fixed enum values
- **URL encoding** - Decodes hash values during parsing and encodes them during serialization
- **Optional defaults** - Returns a configured default or `undefined` for missing and unmatched values
- **Route integration** - Provides the codec consumed by `createAppRoute`

## 3. Concepts

### Blueprint

`InferHashParamBlueprintFromValue<Value>` defines how one hash value is handled:

- `type` is a representative value used for type inference.
- `parse(value)` converts a decoded hash value into the typed value.
- `stringify(value)` converts the typed value into a hash fragment value.

### Codec

`InferHashParamCodecFromBlueprint<Blueprint>` describes the codec returned by `createHashParamCodec`. The runtime codec contains:

- `blueprint` - The configured hash blueprint
- `type` - A typed value used for inference
- `parse(location)` - Reads and converts `location.hash`
- `stringify(value)` - Produces an encoded hash beginning with `#`

### Hash Value

`HashParamValue` allows string, number, and boolean enum values.

## 4. Configuration

### Available Blueprint Types

| Blueprint | Default | Behavior |
| --- | --- | --- |
| `string(defaultValue?)` | `''` | Returns the hash value or the default when the hash is missing |
| `enum(values, defaultValue?)` | `undefined` | Returns a matching value or the default |

### Creating A Codec

```typescript
import { createHashParamCodec } from 'features/hash-params';

const codec = createHashParamCodec()(({ enum: createEnum }) =>
  createEnum(['overview', 'installation', 'usage'])
);
```

The callback receives `HASH_PARAM_BLUEPRINTS`, which exposes the `string` and `enum` blueprint factories.

## 5. Usage

Codecs accept a React Router `Location` and return one parsed value:

```typescript
import type { Location } from 'react-router';

const location: Location = {
  hash: '#usage',
  key: 'default',
  pathname: '/docs',
  search: '',
  state: null
};

const value = codec.parse(location);
// value: 'overview' | 'installation' | 'usage' | undefined

const hash = codec.stringify(value);
// hash: '#usage'
```

In the application, `createAppRoute` creates and owns the codec from its `path` and `hash` options. Route components read the parsed value through `useAppHashParams`:

```typescript
import { useAppHashParams } from 'core/routes';
import { HASH_PARAM_BLUEPRINTS } from 'features/hash-params';

const documentationHash = (blueprints: typeof HASH_PARAM_BLUEPRINTS) =>
  blueprints.enum(['overview', 'installation', 'usage']);

// Passed to createAppRoute({ path: '/docs', hash: documentationHash, ... })

const DocumentationPage = () => {
  const section = useAppHashParams<'/docs'>();
  return <div>{section}</div>;
};
```

The route definition must also provide its component, labels, icons, and other required route options:

```typescript
import { createAppRoute } from 'core/routes';

const DocumentationRoute = createAppRoute({
  component: <DocumentationPage />,
  hash: documentationHash,
  path: '/docs',
  shortname: () => ['app_route.docs.shortname'],
  fullname: () => ['app_route.docs.fullname'],
  shorticon: () => <span />,
  fullicon: () => <span />
});
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `hash-params.models.ts` | Public hash value, blueprint, and codec types |
| `hash-params.utils.ts` | Blueprint factories, default blueprint, and codec creation |
| `hash-params.utils.test.ts` | Unit tests for parsing and serialization |
| `index.ts` | Explicit public exports |

### Type Utilities

| Type | Purpose |
| --- | --- |
| `HashParamValue` | Allowed string, number, and boolean values |
| `InferHashParamBlueprintFromValue<Value>` | Defines one hash blueprint |
| `InferHashParamFromBlueprint<Blueprint>` | Resolves a blueprint to its value type or `undefined` |
| `InferHashParamCodecFromBlueprint<Blueprint>` | Describes the inferred codec type |

### Data Flow And Boundaries

The input boundary is a route `Location` and its hash. The codec removes the leading `#`, decodes the value, and passes it to the blueprint parser. Serialization runs the blueprint serializer and encodes the result. Missing, unmatched, or invalid values use the blueprint default or resolve to `undefined`; empty serialized values return an empty string.

## 7. Related Modules

- `core/routes/` - Creates hash codecs for application routes and exposes parsed values through route hooks
- `features/path-params/` - Provides the parallel typed codec system for path parameters
- `features/search-params/` - Provides the parallel typed codec system for query parameters
