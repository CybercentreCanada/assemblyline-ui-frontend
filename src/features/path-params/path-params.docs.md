# Features/Path-Params

## 1. Purpose

Type-safe URL path parameter extraction and serialization. The module derives parameter keys from route path literals and creates codecs that parse `Location.pathname` values into typed objects and serialize typed values back into paths.

## 2. Features

- **Typed parameter keys** - Derives keys only from complete `:param` path segments
- **Blueprint-based parsing** - Supports string, number, boolean, and enum parameter values
- **URL encoding** - Decodes dynamic and static path segments during parsing and encodes dynamic values during serialization; malformed escapes are preserved as literal text
- **Safe path segments** - Rejects empty required parameter values and exact `.` or `..` segments while allowing other encoded characters; an empty final optional slot resolves to its blueprint default
- **Default values** - Resolves missing parameters and blueprint-unrecognized values to the configured default
- **Trailing optional parameters** - Supports `:param?` segments at the end of a pattern; omitted values resolve to the blueprint default, and patterns with an optional before a required segment are rejected
- **Strict patterns** - Rejects repeated parameter names, parameter names with special characters, and wildcard segments when the codec is created
- **Path forms** - `InferRoutePathFormFromPath` expands a path literal with trailing optionals into every form the path can take

## 3. Concepts

### Route Path

`RoutePath` represents a route pattern that may contain required `:param` segments and optional `:param?` segments, such as `/alerts/:id/:tab?`. Optional parameters are only supported at the end of the path, so every `:param?` must be followed only by other `:param?` segments:

| Pattern                       | Supported |
| ----------------------------- | --------- |
| `/path/:param`                | Yes       |
| `/path/:param?`               | Yes       |
| `/path/:param?/:other?`       | Yes       |
| `/path/:param?/:other`        | No        |
| `/path/:param?/:other/:next?` | No        |

Unsupported patterns are rejected by the types when the path is a literal and by a `TypeError` at runtime. Optional parameters still require a blueprint; when the URL omits the segment, the blueprint parses `undefined` and supplies its configured default. One trailing slash is ignored before matching parameters, regardless of whether the final parameter is required or optional, so `/item/` supplies the configured default for `/item/:id`, and `/item/abc/` parses the `tab` default for `/item/:id/:tab?`. An empty final optional slot beside a trailing slash also resolves to its default: `/item//` uses the default for `/item/:id?`, and `/item/abc//` uses the default for `/item/:id/:tab?`. Trailing optionals are filled left to right, so `/path/x` parses `x` as the first optional. For a root pattern such as `/:id?`, `/` represents the omitted parameter, and for a slashless pattern such as `:id?` an empty pathname does. Empty required parameter values remain invalid. The codec does not enforce a route-level trailing-slash policy. A parameter is recognized only when its segment starts with `:`; a colon within a static segment does not define a parameter. Optional static segments such as `view?` remain unsupported.

Parameter names must be unique within a pattern, whether they are optional or not, so `/item/:id/:id` and `/item/:id/:id?` are rejected. Names may only contain letters, numbers and underscores, so `/files/:id-x` and `/files/:id*` are rejected. Wildcard matching is not supported, so a `*` in any segment, such as `/files/:id/*`, is rejected. These rules are checked with a `TypeError` when the codec is created.

`InferRoutePathFormFromPath<Path>` expands the trailing optionals of a path literal into every form the path can take, for example `'/path/:option?/:other?'` becomes `'/path' | '/path/:option' | '/path/:option/:other'`. It assumes optionals are trailing and is not wired into the codec.

### Blueprint

`InferPathParamBlueprintFromValue<Value>` defines how one path parameter is handled:

- `type` is a representative value used for type inference.
- `parse(value)` converts a raw path segment into the typed value.
- `stringify(value)` converts the typed value into a path segment.
- Dynamic values are URI-decoded during parsing and URI-encoded during serialization. Empty required values and values that decode/stringify to exactly `.` or `..` are rejected; an empty final optional slot resolves to its blueprint default. Other punctuation is allowed. Static pattern and pathname segments are also decoded before comparison, with malformed escapes treated literally.

### Blueprint Map

`InferPathParamBlueprintMapFromPath<Path>` maps every parameter key extracted from `Path` to a blueprint, removing the `?` marker from optional parameter keys. A path without parameters resolves to `never`. Every entry returned by the codec's blueprint callback must be a path-param blueprint.

### Codec

`InferPathParamCodecFromPath<Path>` describes the codec returned by `createPathParamsCodec`. The runtime codec contains:

- `blueprints` - The configured parameter blueprints
- `type` - A typed object used for inference
- `parse(location)` - Reads and converts values from `location.pathname`
- `stringify(params)` - Replaces required `:param` segments with encoded values and omits optional segments when their values are omitted or `null`. An omitted optional that comes before a supplied optional is written with its blueprint default so the supplied value keeps its position, for example `{ other: 'y' }` serializes `/path/:param?/:other?` as `/path/<param default>/y`. If that default is not a valid path value, such as the `''` default of `string()`, it throws a `TypeError`. Omitting the parameter in a root pattern such as `/:id?` serializes as `/`.

## 4. Configuration

### Available Blueprint Types

| Blueprint                     | Default     | Behavior                                                                  |
| ----------------------------- | ----------- | ------------------------------------------------------------------------- |
| `string(defaultValue?)`       | `''`        | Returns the raw segment or the default when it is missing                 |
| `number(defaultValue?)`       | `0`         | Converts the segment with `Number`, using the default for invalid numbers |
| `boolean(defaultValue?)`      | `false`     | Converts `true`/`1` to `true` and `false`/`0` to `false`                  |
| `enum(values, defaultValue?)` | `values[0]` | Returns a matching value or the default                                   |

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

Route components can parse the current React Router location directly with the codec defined above:

```typescript
import { useLocation } from 'react-router';

const AlertPage = () => {
  const { id } = codec.parse(useLocation());
  return <div>{id}</div>;
};
```

## 6. Codebase (Internals)

### Key Files

| File                        | Role                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `path-params.models.ts`     | Public path, blueprint, inferred-value, and codec types, plus the internal pattern types       |
| `path-params.utils.ts`      | Blueprint factories, standalone pattern matching and serialization helpers, and codec creation |
| `path-params.utils.test.ts` | Unit tests for blueprints, every helper, and codec parsing and serialization                   |
| `index.ts`                  | Explicit public exports                                                                        |

### Type Utilities

| Type                                                              | Purpose                                                                                       |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `RoutePath`                                                       | Route path pattern type                                                                       |
| `RoutePathWithoutOptionalStaticSegments<Path>`                    | Resolves to `never` for literal paths with optional static segments                           |
| `RoutePathWithTrailingOptionalParamsOnly<Path>`                   | Resolves to `never` for literal paths where an optional segment is followed by a required one |
| `InferRoutePathFormFromPath<Path>`                                | Expands trailing optional params into every form of the path                                  |
| `PathParamValue`                                                  | Allowed string, number, and boolean values                                                    |
| `InferPathParamKeyFromPath<Path>`                                 | Extracts parameter keys from a path literal                                                   |
| `InferOptionalPathParamKeyFromPath<Path>`                         | Extracts keys for optional dynamic segments                                                   |
| `InferPathParamBlueprintFromValue<Value>`                         | Defines one parameter blueprint                                                               |
| `InferPathParamBlueprintMapFromPath<Path>`                        | Maps extracted keys to blueprints                                                             |
| `InferPathParamValuesFromBlueprintMap<Blueprints>`                | Resolves blueprint values into an object type                                                 |
| `InferPathParamStringifyValuesFromBlueprintMap<Path, Blueprints>` | Allows optional path parameters to be omitted during serialization                            |
| `InferPathParamCodecFromPath<Path>`                               | Describes the inferred codec type for a path                                                  |
| `PathPattern`                                                     | A route pattern split once into segments; records whether it starts with `/`                  |
| `PathPatternSegment`                                              | One static or `:param` / `:param?` segment of a pattern                                       |

### Data Flow And Boundaries

The input boundary is a route `Location` and its pathname. The codec compares static segments after decoding both the pattern and pathname, preserving malformed escapes literally. It locates each complete `:param` segment, decodes the corresponding value, rejects empty and exact dot-segment values, and passes valid values through the configured blueprint parser. Serialization applies the same value checks and URI-encodes each blueprint value into one path segment; it reads only own properties from the supplied params object. Missing parameters and values not recognized by a blueprint use its configured default.

### Implementation Overview

`createPathParamsCodec` parses the route pattern once into a `PathPattern`, then delegates each call to standalone helpers in `path-params.utils.ts`. Each helper does one step so it can be unit tested on its own.

| Step          | Helpers                                                                                                              | Responsibility                                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared        | `assertValidPathParam`, `decodePathSegment`, `getOwnValue`                                                           | Validate values, decode segments with malformed escapes kept literal, and read only own properties                                                                                               |
| Pattern       | `parsePathPattern`, `assertSupportedPathPattern`                                                                     | Split the pattern into static and param segments, and reject wildcard and optional static segments, invalid or repeated param names, and optional params that are followed by a required segment |
| Matching      | `matchPathPattern`, `splitPathname`, `isPathConsumed`                                                                | Walk the pattern and pathname together and extract raw parameter values                                                                                                                          |
| Serialization | `stringifyPathPattern`, `serializePathSegments`, `serializePathParam`, `findLastSuppliedParamIndex`, `joinPathParts` | Encode values, drop or fill omitted optionals, and build the pathname                                                                                                                            |

**Matching.** `matchPathPattern` walks the pattern segments and pathname segments in order in a single pass. A static segment must equal the decoded pathname segment, ignoring case. One terminal slash is removed before matching, so it is never treated as a parameter value. A param takes the next segment when one is left, and is `undefined` otherwise, which a blueprint turns into its default. Because optionals can only be trailing, they are filled left to right and there is never more than one way to match. The root pathname `/` and an empty pathname are read as an omitted optional param. Empty required values and values equal to `.` or `..` remain invalid; a final empty optional slot, as in `/item//` for `/item/:id?`, is treated as omitted and resolves to the blueprint default. Other unmatched segments do not match. This codec extracts and serializes path parameters; trailing-slash routing policy is left to the router/application.

**Serialization.** `serializePathSegments` encodes each segment in order. An omitted optional after the last supplied optional (`findLastSuppliedParamIndex`) is dropped. An omitted optional before it is written with its blueprint default so the supplied value stays in its own position.

### Design Decisions And Alternatives

Optional parameters are restricted to the end of the path on purpose. Allowing an optional before a required or static segment makes a pathname ambiguous: `/item/:tab?/:id` and `/item/:view?/file/:tab?` can each match one pathname in more than one way. Supporting that needs a backtracking matcher that prefers matches supplying required parameters, memoization to keep it bounded, and a serializer that verifies each path parses back to the supplied values. That machinery was removed to keep the module small. If middle optionals are needed later, those are the pieces to reintroduce.

Delegating matching to React Router's `matchPath` was also considered. It would reuse the router's handling of optional segments and decoding, but captured params live in a plain object so a `__proto__` key is lost, and unmatched or empty segments return no match instead of throwing.

## 7. Related Modules

- `features/search-params/` - Provides the parallel typed codec system for query parameters
- `features/hash-params/` - Provides typed codecs for a single URL hash value
