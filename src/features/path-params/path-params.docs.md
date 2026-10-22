# Features/Path-Params

## 1. Purpose

Type-safe URL path parameter extraction and serialization. The module derives parameter keys from route path literals and creates codecs that parse `Location.pathname` values into typed objects and serialize typed values back into paths.

## 2. Features

- **Typed parameter keys** - Derives keys only from complete `:param` path segments
- **Blueprint-based parsing** - Supports string, number, boolean, and enum parameter values
- **URL encoding** - Decodes dynamic and static path segments during parsing and encodes dynamic values during serialization; malformed escapes are preserved as literal text
- **Safe path segments** - Rejects empty parameter values and exact `.` or `..` segments while allowing other encoded characters
- **Default values** - Resolves missing parameters and blueprint-unrecognized values to the configured default
- **Optional path matching** - Supports omitted dynamic segments anywhere in a pattern, prioritizes matches that supply required parameters, and verifies that serialized paths parse back to the same values
- **Route integration** - Provides the codec consumed by `createAppRoute`

## 3. Concepts

### Route Path

`RoutePath` represents a route pattern that may contain required `:param` or optional `:param?` segments, such as `/alerts/:id/:tab?`. Optional parameters still require a blueprint; when the URL omits the segment, the blueprint parses `undefined` and supplies its configured default. For a root pattern such as `/:id?`, `/` represents the omitted parameter. Empty parameter values are otherwise invalid. When optional segments could consume a required parameter, parsing prefers the match that supplies more required parameters. A parameter is recognized only when its segment starts with `:`; a colon within a static segment does not define a parameter. Optional static segments such as `view?` remain unsupported.

### Blueprint

`InferPathParamBlueprintFromValue<Value>` defines how one path parameter is handled:

- `type` is a representative value used for type inference.
- `parse(value)` converts a raw path segment into the typed value.
- `stringify(value)` converts the typed value into a path segment.
- Dynamic values are URI-decoded during parsing and URI-encoded during serialization. Empty values and values that decode/stringify to exactly `.` or `..` are rejected; other punctuation is allowed. Static pattern and pathname segments are also decoded before comparison, with malformed escapes treated literally.

### Blueprint Map

`InferPathParamBlueprintMapFromPath<Path>` maps every parameter key extracted from `Path` to a blueprint, removing the `?` marker from optional parameter keys. A path without parameters resolves to `never`. Every entry returned by the codec's blueprint callback must be a path-param blueprint.

### Codec

`InferPathParamCodecFromPath<Path>` describes the codec returned by `createPathParamsCodec`. The runtime codec contains:

- `blueprints` - The configured parameter blueprints
- `type` - A typed object used for inference
- `parse(location)` - Reads and converts values from `location.pathname`
- `stringify(params)` - Replaces required `:param` segments with encoded values and omits optional segments when their values are omitted or `null`. When omitting a parameter would make the path parse to different values, the blueprint defaults of a growing set of omitted optionals are written until the path round-trips. The set grows from the last omitted optional backwards and skips optionals whose default is not a valid path value; if no path can be made unambiguous, it throws a `TypeError`. Omitting the parameter in a root pattern such as `/:id?` serializes as `/`.

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

The path literal determines the required blueprint keys, including a blueprint for every optional parameter. Each key must have a matching blueprint in the callback result, and every callback entry must be a blueprint.

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
| `path-params.models.ts` | Public path, blueprint, inferred-value, and codec types, plus the internal pattern and match types |
| `path-params.utils.ts` | Blueprint factories, standalone pattern matching and serialization helpers, and codec creation |
| `path-params.utils.test.ts` | Unit tests for blueprints, every helper, and codec parsing and serialization |
| `index.ts` | Explicit public exports |

### Type Utilities

| Type | Purpose |
| --- | --- |
| `RoutePath` | Route path pattern type |
| `PathParamValue` | Allowed string, number, and boolean values |
| `InferPathParamKeyFromPath<Path>` | Extracts parameter keys from a path literal |
| `InferOptionalPathParamKeyFromPath<Path>` | Extracts keys for optional dynamic segments |
| `InferPathParamBlueprintFromValue<Value>` | Defines one parameter blueprint |
| `InferPathParamBlueprintMapFromPath<Path>` | Maps extracted keys to blueprints |
| `InferPathParamValuesFromBlueprintMap<Blueprints>` | Resolves blueprint values into an object type |
| `InferPathParamStringifyValuesFromBlueprintMap<Path, Blueprints>` | Allows optional path parameters to be omitted during serialization |
| `InferPathParamCodecFromPath<Path>` | Describes the inferred codec type for a path |
| `PathPattern` | A route pattern split once into segments; records whether it starts with `/` |
| `PathPatternSegment` | One static or `:param` / `:param?` segment of a pattern |
| `PathMatchContext` | State shared by one pathname match: segments, pathname parts, decoded-part cache, and memo |
| `PathMatch` | A complete match with its assignments and its count of missing required parameters |
| `PathAssignment` | Linked list of matched parameter values, ordered by pattern position |
| `PathMatchFinder` | Signature of the function that matches a pattern suffix against a pathname suffix |

### Data Flow And Boundaries

The input boundary is a route `Location` and its pathname. The codec compares static segments after decoding both the pattern and pathname, preserving malformed escapes literally. It locates each complete `:param` segment, decodes the corresponding value, rejects empty and exact dot-segment values, and passes valid values through the configured blueprint parser. When optional segments create multiple possible matches, the codec prefers the match with fewer missing required parameters. Serialization applies the same value checks and URI-encodes each blueprint value into one path segment; it reads only own properties from the supplied params object. Missing parameters and values not recognized by a blueprint use its configured default.

### Implementation Overview

`createPathParamsCodec` parses the route pattern once into a `PathPattern`, then delegates each call to standalone helpers in `path-params.utils.ts`. Each helper does one step so it can be unit tested on its own.

| Step | Helpers | Responsibility |
| --- | --- | --- |
| Shared | `assertValidPathParam`, `decodePathSegment`, `getOwnValue` | Validate values, decode segments with malformed escapes kept literal, and read only own properties |
| Pattern | `parsePathPattern` | Split the pattern into static and param segments; static segments store a decoded, lower-cased form |
| Matching | `matchPathPattern`, `createPathMatchContext`, `splitPathname`, `getDecodedPathPart`, `isPathConsumed`, `resolvePathMatch`, `findPathMatch`, `selectPathMatch`, `prependPathAssignment`, `collectPathParams` | Match a pathname against the pattern and extract raw parameter values |
| Serialization | `stringifyPathPattern`, `getSegmentBlueprints`, `serializePathSegments`, `serializePathParam`, `getOmittedParamIndexes`, `getDefaultPathParam`, `getFillableParamIndexes`, `fillOmittedDefaults`, `joinPathParts`, `pathnameRoundTrips` | Build a pathname and verify that it parses back to the supplied values |

**Matching.** `resolvePathMatch` walks the pattern and pathname together. A static segment must equal the decoded pathname segment, ignoring case. A required param consumes one segment. An optional param is tried both ways, consuming the segment and omitting it, and `selectPathMatch` keeps the match with fewer missing required parameters, preferring the consuming match on a tie. `findPathMatch` memoizes results by position, so consecutive optional params cannot branch exponentially. Values are validated in `collectPathParams` only for the selected match, so an abandoned branch cannot reject a valid omitted-parameter match. The root pathname `/` is read as an omitted optional param.

**Serialization.** `serializePathSegments` encodes supplied values and marks omitted optionals. `stringifyPathPattern` first tries the path with every omitted optional dropped. It then writes blueprint defaults for a growing set of omitted optionals, taken from the last one backwards and limited to those whose default is a valid path value (`getFillableParamIndexes`), and returns the first candidate that `pathnameRoundTrips` accepts. This tries at most one candidate per fillable optional, so earlier unrelated optionals, such as one with the `''` default of `string()`, stay omitted when a later omission is enough. Writing every fillable default is the last candidate, so serialization fails only when an optional that must be filled has no valid default.

### Design Decisions And Alternatives

The codec accepts optional `:param?` segments at any position, so matching and serialization must resolve ambiguity. For example, `/item/:tab?/:id` and `/item/:view?/file/:tab?` can match one pathname in more than one way, and `/:view?/:tab?` with only `tab` supplied would otherwise serialize to a path that parses `tab` as `view`. This is why matching is memoized and ordered by missing required parameters, and why serialization verifies a round trip. The alternatives below were considered and are not used.

| Alternative | How it would work | Trade-offs |
| --- | --- | --- |
| Trailing-only optional params | Allow `:param?` only at the end of a pattern and enforce it in the types. Match with a linear walk. Omit an optional only when every later optional is also omitted, otherwise throw. | Removes the memoized matcher, the round-trip check, and default filling. Patterns with an optional before a required or static segment become unsupported. |
| Delegate matching to React Router `matchPath` | Reuse the router's handling of optional segments and decoding, then validate values and apply blueprints. | Captured params live in a plain object, so a `__proto__` key is lost. Unmatched or empty segments return no match instead of throwing. Serialization still needs its own ambiguity handling. |

The general matcher is kept so optional segments are not limited to the end of a pattern and the router's pattern syntax stays fully usable.

## 7. Related Modules

- `core/routes/` - Creates path codecs for application routes and exposes parsed values through route hooks
- `features/search-params/` - Provides the parallel typed codec system for query parameters
- `features/hash-params/` - Provides typed codecs for a single URL hash value
