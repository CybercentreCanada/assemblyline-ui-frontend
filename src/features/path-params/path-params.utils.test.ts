import type {
  InferOptionalPathParamKeyFromPath,
  InferPathParamKeyFromPath,
  InferRoutePathFormFromPath,
  RoutePath,
  RoutePathWithTrailingOptionalParamsOnly
} from 'features/path-params';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';
import {
  assertSupportedPathPattern,
  assertValidPathParam,
  decodePathSegment,
  findLastSuppliedParamIndex,
  getOwnValue,
  isPathConsumed,
  joinPathParts,
  matchPathPattern,
  parsePathPattern,
  serializePathParam,
  serializePathSegments,
  splitPathname,
  stringifyPathPattern
} from 'features/path-params/path-params.utils';
import type { Location } from 'react-router';
import { describe, expect, expectTypeOf, it } from 'vitest';

//*****************************************************************************************
// PATH_PARAM_BLUEPRINTS_MAP
//*****************************************************************************************

describe('PATH_PARAM_BLUEPRINTS_MAP.string', () => {
  it('returns the default value when parsing a missing value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string('fallback');
    expect(blueprint.parse(undefined)).toBe('fallback');
  });

  it('returns the given value as-is when present', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string('fallback');
    expect(blueprint.parse('abc')).toBe('abc');
  });

  it('stringifies values to strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string();
    expect(blueprint.stringify('abc')).toBe('abc');
  });
});

describe('PATH_PARAM_BLUEPRINTS_MAP.number', () => {
  it('returns the default value when parsing a missing value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.number(7);
    expect(blueprint.parse(undefined)).toBe(7);
  });

  it('parses numeric strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.number();
    expect(blueprint.parse('42')).toBe(42);
  });

  it('returns the default value for non-numeric strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.number(9);
    expect(blueprint.parse('abc')).toBe(9);
  });

  it('stringifies numbers to strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.number();
    expect(blueprint.stringify(42)).toBe('42');
  });
});

describe('PATH_PARAM_BLUEPRINTS_MAP.boolean', () => {
  it('returns the default value when parsing a missing value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.boolean(true);
    expect(blueprint.parse(undefined)).toBe(true);
  });

  it('parses truthy string representations', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.boolean();
    expect(blueprint.parse('true')).toBe(true);
    expect(blueprint.parse('1')).toBe(true);
  });

  it('parses falsy string representations', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.boolean();
    expect(blueprint.parse('false')).toBe(false);
    expect(blueprint.parse('0')).toBe(false);
  });

  it('returns the default value for unrecognized strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.boolean(true);
    expect(blueprint.parse('nope')).toBe(true);
  });

  it('stringifies booleans to strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.boolean();
    expect(blueprint.stringify(true)).toBe('true');
  });
});

describe('PATH_PARAM_BLUEPRINTS_MAP.enum', () => {
  it('returns the default value when parsing a missing value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b', 'c'] as const, 'b');
    expect(blueprint.parse(undefined)).toBe('b');
  });

  it('parses a matching candidate value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b', 'c'] as const);
    expect(blueprint.parse('c')).toBe('c');
  });

  it('returns the default value for a non-matching candidate', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b'] as const, 'a');
    expect(blueprint.parse('zzz')).toBe('a');
  });

  it('defaults to the first value when no default is given', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['x', 'y'] as const);
    expect(blueprint.type).toBe('x');
  });

  it('rejects distinct options with the same string representation', () => {
    expect(() => PATH_PARAM_BLUEPRINTS_MAP.enum([1, '1'] as const)).toThrow(
      'Enum options must have unique string representations.'
    );
    expect(() => PATH_PARAM_BLUEPRINTS_MAP.enum([true, 'true'] as const)).toThrow(
      'Enum options must have unique string representations.'
    );
  });

  it('stringifies enum values to strings', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum([1, 2, 3] as const);
    expect(blueprint.stringify(2)).toBe('2');
  });

  it('stringifies invalid values to the configured default', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['ascii', 'code'] as const, 'ascii');
    expect(blueprint.stringify(null as never)).toBe('ascii');
    expect(blueprint.stringify('invalid' as never)).toBe('ascii');
  });

  it('does not match invalid values to enum options by string representation', () => {
    const nullBlueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['ascii', 'null'] as const, 'ascii');
    const undefinedBlueprint = PATH_PARAM_BLUEPRINTS_MAP.enum(['ascii', 'undefined'] as const, 'ascii');

    expect(nullBlueprint.stringify(null as never)).toBe('ascii');
    expect(undefinedBlueprint.stringify(undefined as never)).toBe('ascii');
  });
});

//*****************************************************************************************
// createPathParamsCodec
//*****************************************************************************************

const makeLocation = (pathname: string): Location => ({ pathname, search: '', hash: '', state: null, key: 'default' });

describe('createPathParamsCodec', () => {
  it('extracts keys only from colon-prefixed path segments', () => {
    expectTypeOf<InferPathParamKeyFromPath<'/items/:itemID/version:latest'>>().toEqualTypeOf<'itemID'>();
    expectTypeOf<InferPathParamKeyFromPath<'/items/version:latest'>>().toEqualTypeOf<never>();
  });

  it('extracts optional dynamic keys without their marker', () => {
    expectTypeOf<InferPathParamKeyFromPath<'/item/:itemID/:tab?'>>().toEqualTypeOf<'itemID' | 'tab'>();
    expectTypeOf<InferOptionalPathParamKeyFromPath<'/item/:itemID/:tab?'>>().toEqualTypeOf<'tab'>();
  });

  it('rejects optional static route segments', () => {
    const optionalPath: RoutePath = '/item/:itemID?';
    expect(() => createPathParamsCodec(optionalPath)(b => ({ itemID: b.string() }))).not.toThrow();

    const optionalStaticPath: RoutePath = '/items/view?/:id';
    expect(() => createPathParamsCodec(optionalStaticPath)).toThrow('Optional static path segments are not supported.');
    expect(() => {
      // @ts-expect-error Optional static route segment syntax is unsupported.
      createPathParamsCodec('/items/view?/:id');
    }).toThrow('Optional static path segments are not supported.');
  });

  it('only allows optional params at the end of the path', () => {
    const allowed: string[] = ['/path/:param', '/path/:param?', '/path/:param?/:other?', '/path/:id/:tab?'];
    const rejected: string[] = [
      '/path/:param?/:other',
      '/path/:param?/:other/:next?',
      '/path/:param?/file',
      '/path/:param?/'
    ];

    for (const path of allowed) {
      expect(() => createPathParamsCodec(path)).not.toThrow();
    }
    for (const path of rejected) {
      expect(() => createPathParamsCodec(path)).toThrow(
        'Optional path parameters are only supported at the end of the path.'
      );
    }
  });

  it('rejects optional params followed by a required segment at the type level', () => {
    expectTypeOf<
      RoutePathWithTrailingOptionalParamsOnly<'/path/:param?/:other?'>
    >().toEqualTypeOf<'/path/:param?/:other?'>();
    expectTypeOf<RoutePathWithTrailingOptionalParamsOnly<'/path/:param?/:other'>>().toEqualTypeOf<never>();
    expectTypeOf<RoutePathWithTrailingOptionalParamsOnly<'/path/:param?/:other/:next?'>>().toEqualTypeOf<never>();

    expect(() => {
      // @ts-expect-error An optional param cannot be followed by a required param.
      createPathParamsCodec('/path/:param?/:other');
    }).toThrow('Optional path parameters are only supported at the end of the path.');
  });

  it('rejects repeated parameter names, optional or not', () => {
    for (const path of ['/item/:id/:id', '/item/:id/:id?', '/item/:id?/:id?', '/:a/x/:a']) {
      expect(() => createPathParamsCodec(path)).toThrow(/Path parameter names must be unique/);
    }
  });

  it('rejects wildcard segments and special characters in parameter names', () => {
    for (const path of ['/files/:id/*', '/files/*', '/files/:id/*/x', '/files/:id?/*']) {
      expect(() => createPathParamsCodec(path)).toThrow('Wildcard path segments are not supported.');
    }
    for (const path of ['/files/:id*', '/files/:id-x', '/files/:id.x', '/files/:', '/files/:id?x']) {
      expect(() => createPathParamsCodec(path)).toThrow(
        'Path parameter names may only contain letters, numbers and underscores.'
      );
    }
    expect(() => createPathParamsCodec('/files/:file_id/:ID2?')).not.toThrow();
  });

  it('expands trailing optional params into every form of the path', () => {
    expectTypeOf<InferRoutePathFormFromPath<'/path/:option?/:other?'>>().toEqualTypeOf<
      '/path' | '/path/:option' | '/path/:option/:other'
    >();
    expectTypeOf<InferRoutePathFormFromPath<'/alerts/:id/:tab?'>>().toEqualTypeOf<'/alerts/:id' | '/alerts/:id/:tab'>();
    expectTypeOf<InferRoutePathFormFromPath<'/alerts/:id'>>().toEqualTypeOf<'/alerts/:id'>();
    expectTypeOf<InferRoutePathFormFromPath<'/alerts'>>().toEqualTypeOf<'/alerts'>();
    expectTypeOf<InferRoutePathFormFromPath<'/:id?'>>().toEqualTypeOf<'/' | '/:id'>();
    expectTypeOf<InferRoutePathFormFromPath<':id?'>>().toEqualTypeOf<'' | ':id'>();
    expectTypeOf<InferRoutePathFormFromPath<string>>().toEqualTypeOf<string>();
  });

  it('requires extra callback entries to be path-param blueprints', () => {
    const createInvalidCodec = () => {
      // @ts-expect-error Every callback entry must be a path-param blueprint.
      createPathParamsCodec('/item/:id')(b => ({ id: b.string(), extra: 42 }));
    };

    expectTypeOf(createInvalidCodec).returns.toBeVoid();
  });

  it('parses a single string path param from the location', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/abc'))).toEqual({ itemID: 'abc' });
  });

  it('round-trips a __proto__ path parameter as an own property', () => {
    const codec = createPathParamsCodec('/item/:__proto__')(b => ({ ['__proto__']: b.string() }));
    const parsed = codec.parse(makeLocation('/item/abc'));

    expect(Object.getPrototypeOf(codec.type)).toBe(null);
    expect(Object.prototype.hasOwnProperty.call(codec.type, '__proto__')).toBe(true);
    expect(codec.type['__proto__']).toBe('');
    expect(Object.getPrototypeOf(parsed)).toBe(null);
    expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).toBe(true);
    expect(parsed['__proto__']).toBe('abc');
    expect(codec.stringify(parsed)).toBe('/item/abc');
  });

  it('omits an optional __proto__ parameter without reading an inherited value', () => {
    const codec = createPathParamsCodec('/item/:__proto__?')(b => ({ ['__proto__']: b.string() }));

    expect(codec.stringify({})).toBe('/item');
  });

  it('parses a slashless root-level route pattern', () => {
    const codec = createPathParamsCodec('item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/abc'))).toEqual({ itemID: 'abc' });
  });

  it('parses multiple typed path params from the location', () => {
    const codec = createPathParamsCodec('/item/:itemID/page/:pageNumber')(b => ({
      itemID: b.string(),
      pageNumber: b.number(0)
    }));
    expect(codec.parse(makeLocation('/item/abc/page/3'))).toEqual({ itemID: 'abc', pageNumber: 3 });
  });

  it('rejects an empty parameter before a subsequent parameter', () => {
    const codec = createPathParamsCodec('/item/:itemID/page/:pageNumber')(b => ({
      itemID: b.string(),
      pageNumber: b.number(0)
    }));

    expect(() => codec.stringify({ itemID: '', pageNumber: 3 })).toThrow(TypeError);
    expect(() => codec.parse(makeLocation('/item//page/3'))).toThrow(TypeError);
  });

  it('treats a trailing slash as a missing required parameter', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string('fallback') }));

    expect(() => codec.stringify({ itemID: '' })).toThrow(TypeError);
    expect(codec.parse(makeLocation('/item/'))).toEqual({ itemID: 'fallback' });
    expect(codec.parse(makeLocation('/item/value/'))).toEqual({ itemID: 'value' });
    expect(() => codec.parse(makeLocation('/item//'))).toThrow(TypeError);

    const rootCodec = createPathParamsCodec('/:id')(b => ({ id: b.string('fallback') }));
    expect(rootCodec.parse(makeLocation('/'))).toEqual({ id: 'fallback' });
  });

  it('uses default values when the pathname segment is missing', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string('none') }));
    expect(codec.parse(makeLocation('/item'))).toEqual({ itemID: 'none' });
  });

  it('uses blueprint defaults for omitted optional params and omits them when stringifying', () => {
    const codec = createPathParamsCodec('/item/:itemID/:tab?')(b => ({
      itemID: b.string(),
      tab: b.enum(['ascii', 'hex'] as const, 'ascii')
    }));

    expect(codec.parse(makeLocation('/item/abc'))).toEqual({ itemID: 'abc', tab: 'ascii' });
    expect(codec.stringify({ itemID: 'abc' })).toBe('/item/abc');
    expect(codec.stringify({ itemID: 'abc', tab: null })).toBe('/item/abc');
    expect(codec.stringify({ itemID: 'abc', tab: 'hex' })).toBe('/item/abc/hex');
  });

  it('uses blueprint defaults to disambiguate omitted adjacent optional params', () => {
    const codec = createPathParamsCodec('/item/:view?/:tab?')(b => ({
      view: b.enum(['ascii', 'hex'] as const, 'ascii'),
      tab: b.enum(['ascii', 'hex'] as const, 'ascii')
    }));
    const pathname = codec.stringify({ tab: 'hex' });

    expect(pathname).toBe('/item/ascii/hex');
    expect(codec.parse(makeLocation(pathname))).toEqual({ view: 'ascii', tab: 'hex' });
  });

  it('parses trailing optional params left to right', () => {
    const codec = createPathParamsCodec('/path/:param?/:other?')(b => ({
      param: b.string('default-param'),
      other: b.string('default-other')
    }));

    expect(codec.parse(makeLocation('/path'))).toEqual({ param: 'default-param', other: 'default-other' });
    expect(codec.parse(makeLocation('/path/x'))).toEqual({ param: 'x', other: 'default-other' });
    expect(codec.parse(makeLocation('/path/x/y'))).toEqual({ param: 'x', other: 'y' });
  });

  it('writes the default of an omitted optional param before a supplied one', () => {
    const codec = createPathParamsCodec('/path/:param?/:other?')(b => ({
      param: b.string('default-param'),
      other: b.string('default-other')
    }));

    expect(codec.stringify({})).toBe('/path');
    expect(codec.stringify({ param: 'x' })).toBe('/path/x');
    expect(codec.stringify({ other: 'y' })).toBe('/path/default-param/y');
    expect(codec.parse(makeLocation(codec.stringify({ other: 'y' })))).toEqual({ param: 'default-param', other: 'y' });
  });

  it('rejects a default that cannot be written when a later optional param is supplied', () => {
    const codec = createPathParamsCodec('/item/:view?/:tab?')(b => ({ view: b.string(), tab: b.string('main') }));

    expect(codec.stringify({})).toBe('/item');
    expect(() => codec.stringify({ tab: 'hex' })).toThrow(TypeError);
  });

  it('writes the defaults of every omitted optional before the last supplied one', () => {
    const codec = createPathParamsCodec('/:a?/:b?/:c?')(b => ({
      a: b.string('da'),
      b: b.string('db'),
      c: b.string('dc')
    }));
    const pathname = codec.stringify({ c: 'x' });

    expect(pathname).toBe('/da/db/x');
    expect(codec.parse(makeLocation(pathname))).toEqual({ a: 'da', b: 'db', c: 'x' });
  });

  it('normalizes an omitted root optional param in both directions', () => {
    const codec = createPathParamsCodec('/:id?')(b => ({ id: b.string('default-id') }));

    expect(codec.parse(makeLocation('/'))).toEqual({ id: 'default-id' });
    expect(codec.stringify({})).toBe('/');
    expect(() => codec.stringify({ id: '' })).toThrow(TypeError);
  });

  it('round-trips an omitted slashless root optional param through an empty pathname', () => {
    const codec = createPathParamsCodec(':id?')(b => ({ id: b.string('default-id') }));
    const pathname = codec.stringify({});

    expect(pathname).toBe('');
    expect(codec.parse(makeLocation(pathname))).toEqual({ id: 'default-id' });
    expect(codec.parse(makeLocation(codec.stringify({ id: 'abc' })))).toEqual({ id: 'abc' });
    expect(() => codec.stringify({ id: '' })).toThrow(TypeError);
  });

  it('treats a trailing slash as an omitted optional param', () => {
    const codec = createPathParamsCodec('/item/:itemID/:tab?')(b => ({
      itemID: b.string(),
      tab: b.string('fallback')
    }));

    expect(codec.parse(makeLocation('/item/abc'))).toEqual({ itemID: 'abc', tab: 'fallback' });
    expect(codec.parse(makeLocation('/item/abc/'))).toEqual({ itemID: 'abc', tab: 'fallback' });
    expect(() => codec.stringify({ itemID: 'abc', tab: '' })).toThrow(TypeError);

    const viewerCodec = createPathParamsCodec('/file/viewer/:view?')(b => ({ view: b.string('fallback') }));
    expect(viewerCodec.parse(makeLocation('/file/viewer/'))).toEqual({ view: 'fallback' });
  });

  it('decodes URI-encoded path segments', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/a%20b'))).toEqual({ itemID: 'a b' });
  });

  it('matches encoded and unencoded static path segments consistently', () => {
    const unencodedPatternCodec = createPathParamsCodec('/café/:id')(b => ({ id: b.string('missing') }));
    const encodedPatternCodec = createPathParamsCodec('/caf%C3%A9/:id')(b => ({ id: b.string('missing') }));

    expect(unencodedPatternCodec.parse(makeLocation('/caf%C3%A9/abc'))).toEqual({ id: 'abc' });
    expect(encodedPatternCodec.parse(makeLocation('/café/abc'))).toEqual({ id: 'abc' });
    expect(encodedPatternCodec.parse(makeLocation('/caf%C3%A9/abc'))).toEqual({ id: 'abc' });
  });

  it('preserves malformed escapes in static segments as literal text', () => {
    const codec = createPathParamsCodec('/caf%ZZ/:id')(b => ({ id: b.string('missing') }));

    expect(codec.parse(makeLocation('/caf%ZZ/abc'))).toEqual({ id: 'abc' });
  });

  it('stringifies path params back into a pathname', () => {
    const codec = createPathParamsCodec('/item/:itemID/page/:pageNumber')(b => ({
      itemID: b.string(),
      pageNumber: b.number(0)
    }));
    expect(codec.stringify({ itemID: 'abc', pageNumber: 3 })).toBe('/item/abc/page/3');
  });

  it('encodes special characters within a single path segment', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    const pathname = codec.stringify({ itemID: 'a b/a' });
    expect(pathname).toBe('/item/a%20b%2Fa');
    expect(codec.parse(makeLocation(pathname))).toEqual({ itemID: 'a b/a' });
  });

  it('allows punctuation other than standalone dot segments', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(codec.stringify({ itemID: 'a-b_1' })).toBe('/item/a-b_1');
    expect(codec.parse(makeLocation('/item/a-b_1'))).toEqual({ itemID: 'a-b_1' });
    expect(codec.stringify({ itemID: '...' })).toBe('/item/...');
  });

  it('rejects empty and dot-segment parameter values when parsing or stringifying', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(() => codec.parse(makeLocation('/item//'))).toThrow(TypeError);
    expect(() => codec.stringify({ itemID: '.' })).toThrow(TypeError);
    expect(() => codec.stringify({ itemID: '..' })).toThrow(TypeError);
    expect(() => codec.parse(makeLocation('/item/.'))).toThrow(TypeError);
    expect(() => codec.parse(makeLocation('/item/%2E%2E'))).toThrow(TypeError);
  });

  it('throws instead of emitting an unencoded value with malformed Unicode', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    const itemID = 'a\uD800/other?x=1#frag';

    expect(() => codec.stringify({ itemID })).toThrow(URIError);
  });

  it('stringifies null enum values to the configured default', () => {
    const codec = createPathParamsCodec('/file/viewer/:id/:tab')(b => ({
      id: b.string(),
      tab: b.enum(['ascii', 'code', 'strings', 'hex', 'image'] as const, 'ascii')
    }));

    expect(codec.stringify({ id: 'abc', tab: null as never })).toBe('/file/viewer/abc/ascii');
  });

  it('handles a path with no dynamic segments', () => {
    const codec = createPathParamsCodec('/simple')(() => ({}) as never);
    expect(codec.parse(makeLocation('/simple'))).toEqual({});
    expect(codec.stringify({} as never)).toBe('/simple');
  });

  it('exposes a type property used as a compile-time type marker', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string('default') }));
    expect(codec.type).toEqual({ itemID: '' });
  });

  it('uses the configured string default, not the type marker, to disambiguate adjacent optionals', () => {
    const codec = createPathParamsCodec('/item/:view?/:tab?')(b => ({
      view: b.string('summary'),
      tab: b.string('main')
    }));
    const pathname = codec.stringify({ tab: 'raw' });

    expect(pathname).toBe('/item/summary/raw');
    expect(codec.parse(makeLocation(pathname))).toEqual({ view: 'summary', tab: 'raw' });
  });

  it('ignores inherited properties on the params and blueprint objects', () => {
    const codec = createPathParamsCodec('/item/:constructor?')(b => ({ constructor: b.string('fallback') }));

    expect(codec.stringify({} as never)).toBe('/item');
    expect(codec.parse(makeLocation('/item'))).toEqual({ constructor: 'fallback' });
  });

  it('parses many trailing optional params', () => {
    const path = `/item/:id/${Array.from({ length: 24 }, (_, index) => `:p${index}?`).join('/')}`;
    const codec = createPathParamsCodec(path)(
      b =>
        Object.fromEntries([
          ['id', b.string()],
          ...Array.from({ length: 24 }, (_, index) => [`p${index}`, b.string('d')])
        ]) as never
    );

    expect(codec.parse(makeLocation('/item/abc'))).toMatchObject({ id: 'abc', p0: 'd', p23: 'd' });
    expect(codec.parse(makeLocation('/item/abc/x'))).toMatchObject({ id: 'abc', p0: 'x', p1: 'd' });
  });
});

//*****************************************************************************************
// Path Pattern Helpers
//*****************************************************************************************

describe('parsePathPattern', () => {
  it('splits a pattern into static and param segments', () => {
    expect(parsePathPattern('/Item/:id/:tab?')).toEqual({
      absolute: true,
      segments: [
        { kind: 'static', raw: 'Item', normalized: 'item' },
        { kind: 'param', raw: ':id', key: 'id', optional: false },
        { kind: 'param', raw: ':tab?', key: 'tab', optional: true }
      ]
    });
  });

  it('tracks a slashless pattern as not absolute', () => {
    expect(parsePathPattern('item/:id').absolute).toBe(false);
  });
});

describe('matchPathPattern', () => {
  it('returns raw values and null-prototype params', () => {
    const params = matchPathPattern(parsePathPattern('/item/:id'), '/ITEM/a%20b');

    expect(Object.getPrototypeOf(params)).toBe(null);
    expect(params).toEqual({ id: 'a b' });
  });

  it('returns null when the pathname does not match', () => {
    expect(matchPathPattern(parsePathPattern('/item/:id'), '/other/abc')).toBeNull();
    expect(matchPathPattern(parsePathPattern('/item/:id'), '/item/abc/extra')).toBeNull();
  });

  it('fills trailing optional params left to right and leaves omitted ones undefined', () => {
    const pattern = parsePathPattern('/item/:id/:view?/:tab?');

    expect(matchPathPattern(pattern, '/item/abc')).toEqual({ id: 'abc', view: undefined, tab: undefined });
    expect(matchPathPattern(pattern, '/item/abc/x')).toEqual({ id: 'abc', view: 'x', tab: undefined });
    expect(matchPathPattern(pattern, '/item/abc/x/y')).toEqual({ id: 'abc', view: 'x', tab: 'y' });
    expect(matchPathPattern(pattern, '/item/abc/x/y/z')).toBeNull();
  });

  it('treats a missing required param as undefined', () => {
    expect(matchPathPattern(parsePathPattern('/item/:id'), '/item')).toEqual({ id: undefined });
  });

  it('omits a leading optional param at the root pathname', () => {
    expect(matchPathPattern(parsePathPattern('/:id?'), '/')).toEqual({ id: undefined });
    expect(matchPathPattern(parsePathPattern('/:id?'), '')).toEqual({ id: undefined });
    expect(matchPathPattern(parsePathPattern(':id?'), '')).toEqual({ id: undefined });
  });

  it('does not treat an empty pathname as an omitted required param', () => {
    expect(() => matchPathPattern(parsePathPattern(':id'), '')).toThrow(TypeError);
  });

  it('ignores a trailing slash for required and optional params', () => {
    expect(matchPathPattern(parsePathPattern('/item/:id'), '/item/abc/')).toEqual({ id: 'abc' });
    expect(matchPathPattern(parsePathPattern('/item/:id'), '/item/')).toEqual({ id: undefined });
    expect(matchPathPattern(parsePathPattern('/:id'), '/')).toEqual({ id: undefined });
    expect(matchPathPattern(parsePathPattern('/item/:id/:tab?'), '/item/abc/')).toEqual({
      id: 'abc',
      tab: undefined
    });
    expect(() => matchPathPattern(parsePathPattern('/item/:id'), '/item//')).toThrow(TypeError);
  });

  it('rejects dot-segment values', () => {
    expect(() => matchPathPattern(parsePathPattern('/item/:id'), '/item/.')).toThrow(TypeError);
    expect(() => matchPathPattern(parsePathPattern('/item/:id'), '/item/%2E%2E')).toThrow(TypeError);
  });

  it('compares static segments decoded and case-insensitively', () => {
    expect(matchPathPattern(parsePathPattern('/café/:id'), '/CAF%C3%A9/abc')).toEqual({ id: 'abc' });
  });
});

describe('stringifyPathPattern', () => {
  it('only reads own properties of values and blueprints', () => {
    const blueprints = { id: PATH_PARAM_BLUEPRINTS_MAP.string() };

    expect(stringifyPathPattern(parsePathPattern('/item/:id'), { id: 'abc' }, blueprints)).toBe('/item/abc');
    expect(stringifyPathPattern(parsePathPattern('/item/:toString?'), {}, blueprints)).toBe('/item');
  });

  it('drops omitted optionals and writes defaults before the last supplied one', () => {
    const pattern = parsePathPattern('/item/:view?/:tab?');
    const blueprints = {
      view: PATH_PARAM_BLUEPRINTS_MAP.string('summary'),
      tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
    };

    expect(stringifyPathPattern(pattern, {}, blueprints)).toBe('/item');
    expect(stringifyPathPattern(pattern, { view: 'x' }, blueprints)).toBe('/item/x');
    expect(stringifyPathPattern(pattern, { tab: 'y' }, blueprints)).toBe('/item/summary/y');
  });
});

//*****************************************************************************************
// Path Segment Helpers
//*****************************************************************************************

describe('assertValidPathParam', () => {
  it('accepts ordinary values and punctuation', () => {
    expect(() => assertValidPathParam('abc')).not.toThrow();
    expect(() => assertValidPathParam('...')).not.toThrow();
  });

  it('rejects empty and dot-segment values', () => {
    for (const value of ['', '.', '..']) {
      expect(() => assertValidPathParam(value)).toThrow(TypeError);
    }
  });
});

describe('decodePathSegment', () => {
  it('decodes URI-encoded segments', () => {
    expect(decodePathSegment('a%20b')).toBe('a b');
    expect(decodePathSegment('caf%C3%A9')).toBe('café');
  });

  it('keeps malformed escapes as literal text', () => {
    expect(decodePathSegment('caf%ZZ')).toBe('caf%ZZ');
    expect(decodePathSegment('%E0%A4%A')).toBe('%E0%A4%A');
  });
});

describe('getOwnValue', () => {
  it('reads own properties', () => {
    expect(getOwnValue({ a: 1 }, 'a')).toBe(1);
  });

  it('returns undefined for missing and inherited keys', () => {
    expect(getOwnValue<unknown>({ a: 1 }, 'b')).toBeUndefined();
    expect(getOwnValue<unknown>({}, 'constructor')).toBeUndefined();
    expect(getOwnValue<unknown>({}, 'toString')).toBeUndefined();
    expect(getOwnValue<unknown>({}, '__proto__')).toBeUndefined();
  });

  it('reads an own __proto__ property', () => {
    const record = Object.create(null) as Record<string, string>;
    record['__proto__'] = 'own';

    expect(getOwnValue(record, '__proto__')).toBe('own');
  });
});

describe('serializePathParam', () => {
  it('serializes through the blueprint and URI-encodes the result', () => {
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.string(), 'a b/a')).toBe('a%20b%2Fa');
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.number(), 42)).toBe('42');
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b'] as const, 'b'), 'invalid')).toBe('b');
  });

  it('rejects empty and dot-segment values', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string();

    for (const value of ['', '.', '..']) {
      expect(() => serializePathParam(blueprint, value)).toThrow(TypeError);
    }
  });

  it('throws a URIError for values that cannot be encoded', () => {
    expect(() => serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.string(), 'a\uD800')).toThrow(URIError);
  });
});

//*****************************************************************************************
// Path Match Helpers
//*****************************************************************************************

describe('splitPathname', () => {
  it('strips one leading slash and splits into segments', () => {
    expect(splitPathname('/item/abc')).toEqual(['item', 'abc']);
    expect(splitPathname('item/abc')).toEqual(['item', 'abc']);
  });

  it('keeps empty segments', () => {
    expect(splitPathname('/')).toEqual(['']);
    expect(splitPathname('')).toEqual(['']);
    expect(splitPathname('/item/')).toEqual(['item', '']);
    expect(splitPathname('//a')).toEqual(['', 'a']);
  });
});

describe('assertSupportedPathPattern', () => {
  it('accepts required params and trailing optional params', () => {
    for (const path of ['/path', '/path/:param', '/path/:param?', '/path/:param?/:other?', '/path/:id/:tab?']) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).not.toThrow();
    }
  });

  it('rejects an optional param followed by a required segment', () => {
    for (const path of [
      '/path/:param?/:other',
      '/path/:param?/:other/:next?',
      '/path/:param?/file',
      '/path/:param?/'
    ]) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).toThrow(
        'Optional path parameters are only supported at the end of the path.'
      );
    }
  });

  it('rejects optional static segments', () => {
    expect(() => assertSupportedPathPattern(parsePathPattern('/items/view?/:id'))).toThrow(
      'Optional static path segments are not supported.'
    );
    expect(() => assertSupportedPathPattern(parsePathPattern('/items/:id?/view?'))).toThrow(
      'Optional static path segments are not supported.'
    );
  });

  it('rejects repeated parameter names', () => {
    for (const path of ['/item/:id/:id', '/item/:id/:id?', '/item/:id?/:id?']) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).toThrow(
        'Path parameter names must be unique: "id".'
      );
    }
    expect(() => assertSupportedPathPattern(parsePathPattern('/item/:id/:other'))).not.toThrow();
  });

  it('rejects wildcard segments', () => {
    for (const path of ['/files/*', '/files/:id/*', '/files/:id?/*', '/files/pre*fix/:id']) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).toThrow(
        'Wildcard path segments are not supported.'
      );
    }
  });

  it('only allows letters, numbers and underscores in parameter names', () => {
    for (const path of ['/files/:id*', '/files/:id-x', '/files/:id.x', '/files/:', '/files/:id?x', '/files/:café']) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).toThrow(
        'Path parameter names may only contain letters, numbers and underscores.'
      );
    }
    for (const path of ['/files/:id', '/files/:file_id', '/files/:ID2?', '/files/:__proto__']) {
      expect(() => assertSupportedPathPattern(parsePathPattern(path))).not.toThrow();
    }
  });
});

describe('isPathConsumed', () => {
  it('is true when every segment was used', () => {
    expect(isPathConsumed(['a', 'b'], 2)).toBe(true);
  });

  it('allows a single trailing empty segment', () => {
    expect(isPathConsumed(['a', ''], 1)).toBe(true);
    expect(isPathConsumed([''], 0)).toBe(true);
  });

  it('is false when segments remain', () => {
    expect(isPathConsumed(['a', 'b'], 1)).toBe(false);
    expect(isPathConsumed(['a', '', 'b'], 1)).toBe(false);
    expect(isPathConsumed(['a', 'b'], 3)).toBe(false);
  });
});

describe('findLastSuppliedParamIndex', () => {
  const pattern = parsePathPattern('/item/:id/:view?/:tab?');

  it('returns the index of the last optional param with a value', () => {
    expect(findLastSuppliedParamIndex(pattern, { id: 'a', view: 'x', tab: 'y' })).toBe(3);
    expect(findLastSuppliedParamIndex(pattern, { id: 'a', view: 'x' })).toBe(2);
  });

  it('ignores required params and null or missing values', () => {
    expect(findLastSuppliedParamIndex(pattern, { id: 'a' })).toBe(-1);
    expect(findLastSuppliedParamIndex(pattern, { id: 'a', view: null, tab: undefined })).toBe(-1);
  });

  it('reads only own properties', () => {
    expect(findLastSuppliedParamIndex(parsePathPattern('/item/:constructor?'), {})).toBe(-1);
  });
});

describe('serializePathSegments', () => {
  const pattern = parsePathPattern('/item/:id/:view?/:tab?');
  const blueprints = {
    id: PATH_PARAM_BLUEPRINTS_MAP.string(),
    view: PATH_PARAM_BLUEPRINTS_MAP.string('summary'),
    tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
  };

  it('keeps static segments and encodes param values', () => {
    expect(serializePathSegments(pattern, { id: 'a b', view: 'x', tab: 'y' }, blueprints)).toEqual([
      'item',
      'a%20b',
      'x',
      'y'
    ]);
  });

  it('drops omitted optionals after the last supplied one', () => {
    expect(serializePathSegments(pattern, { id: 'abc' }, blueprints)).toEqual(['item', 'abc']);
    expect(serializePathSegments(pattern, { id: 'abc', view: 'x' }, blueprints)).toEqual(['item', 'abc', 'x']);
    expect(serializePathSegments(pattern, { id: 'abc', view: null, tab: null }, blueprints)).toEqual(['item', 'abc']);
  });

  it('writes the default of an omitted optional before a supplied one', () => {
    expect(serializePathSegments(pattern, { id: 'abc', tab: 'y' }, blueprints)).toEqual([
      'item',
      'abc',
      'summary',
      'y'
    ]);
  });

  it('keeps the :param text for a param without a blueprint', () => {
    expect(serializePathSegments(parsePathPattern('/item/:id'), { id: 'abc' }, {})).toEqual(['item', ':id']);
  });

  it('rejects empty and dot-segment values', () => {
    expect(() => serializePathSegments(pattern, { id: '' }, blueprints)).toThrow(TypeError);
    expect(() => serializePathSegments(pattern, { id: '..' }, blueprints)).toThrow(TypeError);
  });

  it('rejects a default that is not a valid path value only when it must be written', () => {
    const emptyDefault = { ...blueprints, view: PATH_PARAM_BLUEPRINTS_MAP.string() };

    expect(serializePathSegments(pattern, { id: 'abc' }, emptyDefault)).toEqual(['item', 'abc']);
    expect(() => serializePathSegments(pattern, { id: 'abc', tab: 'y' }, emptyDefault)).toThrow(TypeError);
  });

  it('only reads own properties of values and blueprints', () => {
    expect(serializePathSegments(parsePathPattern('/item/:toString?'), {}, blueprints)).toEqual(['item']);
  });
});

describe('joinPathParts', () => {
  it('joins parts and prefixes absolute patterns with a slash', () => {
    expect(joinPathParts(parsePathPattern('/item/:id'), ['item', 'abc'])).toBe('/item/abc');
    expect(joinPathParts(parsePathPattern('item/:id'), ['item', 'abc'])).toBe('item/abc');
  });

  it('returns the root for an absolute pattern with no parts and nothing for a relative one', () => {
    expect(joinPathParts(parsePathPattern('/:id?'), [])).toBe('/');
    expect(joinPathParts(parsePathPattern(':id?'), [])).toBe('');
  });
});
