import type {
  InferOptionalPathParamKeyFromPath,
  InferPathParamKeyFromPath,
  PathMatch,
  RoutePath
} from 'features/path-params';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';
import {
  assertValidPathParam,
  collectPathParams,
  createPathMatchContext,
  decodePathSegment,
  fillOmittedDefaults,
  findPathMatch,
  getDecodedPathPart,
  getDefaultPathParam,
  getOmittedParamIndexes,
  getOwnValue,
  getSegmentBlueprints,
  isPathConsumed,
  joinPathParts,
  matchPathPattern,
  parsePathPattern,
  pathnameRoundTrips,
  prependPathAssignment,
  resolvePathMatch,
  selectPathMatch,
  serializePathParam,
  serializePathSegments,
  splitPathname,
  stringifyPathPattern
} from 'features/path-params/path-params.utils';
import type { Location } from 'react-router';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

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

  it('rejects an empty trailing parameter', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(() => codec.stringify({ itemID: '' })).toThrow(TypeError);
    expect(() => codec.parse(makeLocation('/item/'))).toThrow(TypeError);
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

  it('prefers a match that supplies required params over a consumed optional param', () => {
    const codec = createPathParamsCodec('/item/:tab?/:id')(b => ({
      tab: b.string('default-tab'),
      id: b.string('default-id')
    }));
    const pathname = codec.stringify({ id: 'abc' });

    expect(pathname).toBe('/item/abc');
    expect(codec.parse(makeLocation(pathname))).toEqual({ tab: 'default-tab', id: 'abc' });
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

  it('round-trips an omitted optional param before a trailing static segment', () => {
    const codec = createPathParamsCodec('/item/:id?/')(b => ({ id: b.string('default-id') }));
    const pathname = codec.stringify({});

    expect(pathname).toBe('/item/');
    expect(codec.parse(makeLocation(pathname))).toEqual({ id: 'default-id' });
  });

  it('does not reject a valid omitted match because an abandoned branch consumed an empty segment', () => {
    const codec = createPathParamsCodec('/item/:a?/:b?/file/')(b => ({
      a: b.string('default-a'),
      b: b.string('default-b')
    }));

    expect(codec.parse(makeLocation('/item/file/'))).toEqual({ a: 'default-a', b: 'default-b' });
    expect(codec.parse(makeLocation(codec.stringify({})))).toEqual({ a: 'default-a', b: 'default-b' });
  });

  it('writes the omitted default when a required segment sits between optionals', () => {
    const codec = createPathParamsCodec('/item/:view?/:id/:tab?')(b => ({
      view: b.string('summary'),
      id: b.string(),
      tab: b.string('main')
    }));
    const pathname = codec.stringify({ id: 'abc', tab: 'hex' });

    expect(pathname).toBe('/item/summary/abc/hex');
    expect(codec.parse(makeLocation(pathname))).toEqual({ view: 'summary', id: 'abc', tab: 'hex' });
    expect(codec.stringify({ id: 'abc' })).toBe('/item/abc');
  });

  it('writes the omitted default when a static separator collides with a supplied value', () => {
    const codec = createPathParamsCodec('/item/:view?/file/:tab?')(b => ({
      view: b.string('summary'),
      tab: b.string('main')
    }));
    const pathname = codec.stringify({ tab: 'file' });

    expect(pathname).toBe('/item/summary/file/file');
    expect(codec.parse(makeLocation(pathname))).toEqual({ view: 'summary', tab: 'file' });
  });

  it('rejects serialization that cannot be made unambiguous instead of changing values', () => {
    const codec = createPathParamsCodec('/item/:view?/:id/:tab?')(b => ({
      view: b.string(),
      id: b.string(),
      tab: b.string('main')
    }));

    expect(() => codec.stringify({ id: 'abc', tab: 'hex' })).toThrow(TypeError);
  });

  it('normalizes an omitted root optional param in both directions', () => {
    const codec = createPathParamsCodec('/:id?')(b => ({ id: b.string('default-id') }));

    expect(codec.parse(makeLocation('/'))).toEqual({ id: 'default-id' });
    expect(codec.stringify({})).toBe('/');
    expect(() => codec.stringify({ id: '' })).toThrow(TypeError);
  });

  it('rejects empty trailing values for optional params', () => {
    const codec = createPathParamsCodec('/item/:itemID/:tab?')(b => ({
      itemID: b.string(),
      tab: b.string('fallback')
    }));

    expect(codec.parse(makeLocation('/item/abc'))).toEqual({ itemID: 'abc', tab: 'fallback' });
    expect(() => codec.parse(makeLocation('/item/abc/'))).toThrow(TypeError);
    expect(() => codec.stringify({ itemID: 'abc', tab: '' })).toThrow(TypeError);
  });

  it('parses an omitted optional parameter before a required segment', () => {
    const codec = createPathParamsCodec('/item/:tab?/file/:fileID')(b => ({
      tab: b.enum(['ascii', 'hex'] as const, 'ascii'),
      fileID: b.string()
    }));

    expect(codec.parse(makeLocation('/item/file/abc'))).toEqual({ tab: 'ascii', fileID: 'abc' });
    expect(codec.stringify({ fileID: 'abc' })).toBe('/item/file/abc');
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

  it('rejects empty and dot-segment values when parsing or stringifying', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(() => codec.parse(makeLocation('/item/'))).toThrow(TypeError);
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

  it('matches many consecutive optional params without exponential backtracking', () => {
    const path = `/item/${Array.from({ length: 24 }, (_, index) => `:p${index}?`).join('/')}/:id`;
    const codec = createPathParamsCodec(path)(
      b =>
        Object.fromEntries([
          ...Array.from({ length: 24 }, (_, index) => [`p${index}`, b.string('d')]),
          ['id', b.string()]
        ]) as never
    );

    expect(codec.parse(makeLocation('/item/abc'))).toMatchObject({ id: 'abc', p0: 'd', p23: 'd' });
    expect(codec.parse(makeLocation('/item/x/abc'))).toMatchObject({ id: 'abc', p0: 'x', p1: 'd' });
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
});

describe('stringifyPathPattern', () => {
  it('only reads own properties of values and blueprints', () => {
    const blueprints = { id: PATH_PARAM_BLUEPRINTS_MAP.string() };

    expect(stringifyPathPattern(parsePathPattern('/item/:id'), { id: 'abc' }, blueprints)).toBe('/item/abc');
    expect(stringifyPathPattern(parsePathPattern('/item/:toString?'), {}, blueprints)).toBe('/item');
  });

  it('writes only the defaults needed to keep supplied values in place', () => {
    const pattern = parsePathPattern('/item/:view?/:id/:tab?');
    const blueprints = {
      view: PATH_PARAM_BLUEPRINTS_MAP.string('summary'),
      id: PATH_PARAM_BLUEPRINTS_MAP.string(),
      tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
    };

    expect(stringifyPathPattern(pattern, { id: 'abc' }, blueprints)).toBe('/item/abc');
    expect(stringifyPathPattern(pattern, { id: 'abc', tab: 'hex' }, blueprints)).toBe('/item/summary/abc/hex');
  });

  it('throws when no unambiguous pathname exists', () => {
    const pattern = parsePathPattern('/item/:view?/:id/:tab?');
    const blueprints = {
      view: PATH_PARAM_BLUEPRINTS_MAP.string(),
      id: PATH_PARAM_BLUEPRINTS_MAP.string(),
      tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
    };

    expect(() => stringifyPathPattern(pattern, { id: 'abc', tab: 'hex' }, blueprints)).toThrow(TypeError);
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

describe('createPathMatchContext', () => {
  it('creates a fresh context for a pattern and pathname', () => {
    const pattern = parsePathPattern('/item/:id');
    const context = createPathMatchContext(pattern, '/item/abc');

    expect(context.segments).toBe(pattern.segments);
    expect(context.pathParts).toEqual(['item', 'abc']);
    expect(context.isRoot).toBe(false);
    expect(context.decodedParts).toEqual([]);
    expect(context.memo.size).toBe(0);
  });

  it('flags only the exact root pathname', () => {
    const pattern = parsePathPattern('/:id?');

    expect(createPathMatchContext(pattern, '/').isRoot).toBe(true);
    expect(createPathMatchContext(pattern, '').isRoot).toBe(false);
  });
});

describe('getDecodedPathPart', () => {
  it('decodes a pathname segment and caches it', () => {
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/item/a%20b');

    expect(getDecodedPathPart(context, 1)).toBe('a b');
    expect(context.decodedParts[1]).toBe('a b');

    context.pathParts[1] = 'changed';
    expect(getDecodedPathPart(context, 1)).toBe('a b');
  });

  it('keeps malformed escapes literal', () => {
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/item/caf%ZZ');

    expect(getDecodedPathPart(context, 1)).toBe('caf%ZZ');
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

describe('prependPathAssignment', () => {
  it('returns null when the remaining pattern did not match', () => {
    expect(prependPathAssignment(null, 'id', 'abc', 0)).toBeNull();
  });

  it('adds the assignment in front and accumulates missing required params', () => {
    const rest: PathMatch = { missingRequired: 1, assignments: null };
    const match = prependPathAssignment(rest, 'id', 'abc', 2);

    expect(match).toEqual({ missingRequired: 3, assignments: { key: 'id', value: 'abc', next: null } });
  });

  it('links to the existing assignments without copying them', () => {
    const rest = prependPathAssignment({ missingRequired: 0, assignments: null }, 'b', undefined, 0);
    const match = prependPathAssignment(rest, 'a', 'x', 0);

    expect(match.assignments?.next).toBe(rest.assignments);
  });
});

describe('selectPathMatch', () => {
  const none: PathMatch = { missingRequired: 0, assignments: null };
  const oneMissing: PathMatch = { missingRequired: 1, assignments: null };

  it('returns null when neither matched', () => {
    expect(selectPathMatch(null, null)).toBeNull();
  });

  it('returns the only match', () => {
    expect(selectPathMatch(none, null)).toBe(none);
    expect(selectPathMatch(null, none)).toBe(none);
  });

  it('prefers the match with fewer missing required params', () => {
    expect(selectPathMatch(oneMissing, none)).toBe(none);
    expect(selectPathMatch(none, oneMissing)).toBe(none);
  });

  it('prefers consuming the segment on a tie', () => {
    const other: PathMatch = { missingRequired: 0, assignments: null };

    expect(selectPathMatch(none, other)).toBe(none);
  });
});

describe('resolvePathMatch', () => {
  const matched: PathMatch = { missingRequired: 0, assignments: null };

  it('matches when the pattern is exhausted and the pathname consumed', () => {
    const find = vi.fn();
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/item/abc');

    expect(resolvePathMatch(context, 2, 2, find)).toEqual(matched);
    expect(resolvePathMatch(context, 2, 1, find)).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  it('compares static segments decoded and case-insensitively', () => {
    const find = vi.fn(() => matched);
    const context = createPathMatchContext(parsePathPattern('/café/:id'), '/CAF%C3%A9/abc');

    expect(resolvePathMatch(context, 0, 0, find)).toBe(matched);
    expect(find).toHaveBeenCalledWith(context, 1, 1);
  });

  it('returns null for a static mismatch without recursing', () => {
    const find = vi.fn(() => matched);
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/other/abc');

    expect(resolvePathMatch(context, 0, 0, find)).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  it('counts a missing required param and not a missing optional one', () => {
    const find = vi.fn(() => matched);
    const required = createPathMatchContext(parsePathPattern('/item/:id'), '/item');
    const optional = createPathMatchContext(parsePathPattern('/item/:id?'), '/item');

    expect(resolvePathMatch(required, 1, 1, find)).toEqual({
      missingRequired: 1,
      assignments: { key: 'id', value: undefined, next: null }
    });
    expect(resolvePathMatch(optional, 1, 1, find)).toEqual({
      missingRequired: 0,
      assignments: { key: 'id', value: undefined, next: null }
    });
  });

  it('omits an optional param at the root pathname', () => {
    const find = vi.fn(() => matched);
    const context = createPathMatchContext(parsePathPattern('/:id?'), '/');

    expect(resolvePathMatch(context, 0, 0, find)).toEqual({
      missingRequired: 0,
      assignments: { key: 'id', value: undefined, next: null }
    });
    expect(find).toHaveBeenCalledWith(context, 1, 0);
  });

  it('consumes the segment as a required param and defers validation', () => {
    const find = vi.fn(() => matched);
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/item/');

    expect(resolvePathMatch(context, 1, 1, find)).toEqual({
      missingRequired: 0,
      assignments: { key: 'id', value: '', next: null }
    });
  });

  it('falls back to omitting an optional param when consuming the segment fails', () => {
    const find = vi.fn((_context, _segmentIndex: number, pathIndex: number) => (pathIndex === 1 ? matched : null));
    const context = createPathMatchContext(parsePathPattern('/item/:id?/file'), '/item/file');

    expect(resolvePathMatch(context, 1, 1, find)).toEqual({
      missingRequired: 0,
      assignments: { key: 'id', value: undefined, next: null }
    });
  });

  it('prefers consuming the segment as an optional param when both match', () => {
    const find = vi.fn(() => matched);
    const context = createPathMatchContext(parsePathPattern('/item/:id?'), '/item/abc');

    expect(resolvePathMatch(context, 1, 1, find)).toEqual({
      missingRequired: 0,
      assignments: { key: 'id', value: 'abc', next: null }
    });
  });
});

describe('findPathMatch', () => {
  it('finds the best match and memoizes it', () => {
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/item/abc');
    const first = findPathMatch(context, 0, 0);

    expect(first).toEqual({ missingRequired: 0, assignments: { key: 'id', value: 'abc', next: null } });
    expect(context.memo.size).toBeGreaterThan(0);
    expect(findPathMatch(context, 0, 0)).toBe(first);
  });

  it('memoizes a non-match as null', () => {
    const context = createPathMatchContext(parsePathPattern('/item/:id'), '/other/abc');

    expect(findPathMatch(context, 0, 0)).toBeNull();
    expect(context.memo.get(0)).toBeNull();
    expect(findPathMatch(context, 0, 0)).toBeNull();
  });

  it('prefers the match that supplies required params', () => {
    const context = createPathMatchContext(parsePathPattern('/item/:tab?/:id'), '/item/abc');

    expect(findPathMatch(context, 0, 0)).toEqual({
      missingRequired: 0,
      assignments: {
        key: 'tab',
        value: undefined,
        next: { key: 'id', value: 'abc', next: null }
      }
    });
  });
});

describe('collectPathParams', () => {
  it('returns an empty null-prototype record for no assignments', () => {
    const params = collectPathParams(null);

    expect(Object.getPrototypeOf(params)).toBe(null);
    expect(params).toEqual({});
  });

  it('collects values in order, including omitted params', () => {
    const params = collectPathParams({ key: 'a', value: 'x', next: { key: 'b', value: undefined, next: null } });

    expect(params).toEqual({ a: 'x', b: undefined });
    expect(Object.keys(params)).toEqual(['a', 'b']);
  });

  it('keeps __proto__ as an own property', () => {
    const params = collectPathParams({ key: '__proto__', value: 'x', next: null });

    expect(Object.prototype.hasOwnProperty.call(params, '__proto__')).toBe(true);
    expect(params['__proto__']).toBe('x');
  });

  it('rejects supplied empty and dot-segment values', () => {
    for (const value of ['', '.', '..']) {
      expect(() => collectPathParams({ key: 'id', value, next: null })).toThrow(TypeError);
    }
  });
});

//*****************************************************************************************
// Path Stringify Helpers
//*****************************************************************************************

describe('getSegmentBlueprints', () => {
  it('returns one entry per segment and leaves static segments undefined', () => {
    const id = PATH_PARAM_BLUEPRINTS_MAP.string();

    expect(getSegmentBlueprints(parsePathPattern('/item/:id/:other?'), { id })).toEqual([undefined, id, undefined]);
  });

  it('reads only own properties of the blueprint map', () => {
    expect(getSegmentBlueprints(parsePathPattern('/item/:toString'), {})).toEqual([undefined, undefined]);
  });
});

describe('serializePathSegments', () => {
  const pattern = parsePathPattern('/item/:id/:tab?');
  const blueprints = {
    id: PATH_PARAM_BLUEPRINTS_MAP.string(),
    tab: PATH_PARAM_BLUEPRINTS_MAP.enum(['ascii', 'hex'] as const, 'ascii')
  };

  it('keeps static segments and encodes param values', () => {
    const parts = serializePathSegments(pattern, { id: 'a b', tab: 'hex' }, getSegmentBlueprints(pattern, blueprints));

    expect(parts).toEqual(['item', 'a%20b', 'hex']);
  });

  it('marks omitted optional params as null', () => {
    const segmentBlueprints = getSegmentBlueprints(pattern, blueprints);

    expect(serializePathSegments(pattern, { id: 'abc' }, segmentBlueprints)).toEqual(['item', 'abc', null]);
    expect(serializePathSegments(pattern, { id: 'abc', tab: null }, segmentBlueprints)).toEqual(['item', 'abc', null]);
  });

  it('keeps the :param text for a param without a blueprint', () => {
    const noBlueprints = getSegmentBlueprints(parsePathPattern('/item/:id'), {});

    expect(serializePathSegments(parsePathPattern('/item/:id'), { id: 'abc' }, noBlueprints)).toEqual(['item', ':id']);
  });

  it('rejects empty and dot-segment values', () => {
    const segmentBlueprints = getSegmentBlueprints(pattern, blueprints);

    expect(() => serializePathSegments(pattern, { id: '' }, segmentBlueprints)).toThrow(TypeError);
    expect(() => serializePathSegments(pattern, { id: '..' }, segmentBlueprints)).toThrow(TypeError);
  });
});

describe('getOmittedParamIndexes', () => {
  it('lists omitted params that have a blueprint', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string();

    expect(getOmittedParamIndexes(['item', null, 'abc', null], [undefined, blueprint, blueprint, blueprint])).toEqual([
      1, 3
    ]);
  });

  it('ignores omitted params without a blueprint', () => {
    expect(getOmittedParamIndexes(['item', null], [undefined, undefined])).toEqual([]);
  });

  it('returns an empty list when nothing was omitted', () => {
    expect(getOmittedParamIndexes(['item', 'abc'], [undefined, PATH_PARAM_BLUEPRINTS_MAP.string()])).toEqual([]);
  });
});

describe('getDefaultPathParam', () => {
  it('serializes the blueprint default', () => {
    expect(getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.string('summary'))).toBe('summary');
    expect(getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.number(7))).toBe('7');
    expect(getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b'] as const, 'b'))).toBe('b');
  });

  it('returns null when the default is not a valid path value', () => {
    expect(getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.string())).toBeNull();
    expect(getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.string('..'))).toBeNull();
  });

  it('does not swallow encoding errors', () => {
    expect(() => getDefaultPathParam(PATH_PARAM_BLUEPRINTS_MAP.string('a\uD800'))).toThrow(URIError);
  });
});

describe('fillOmittedDefaults', () => {
  const blueprints = [undefined, PATH_PARAM_BLUEPRINTS_MAP.string('summary'), undefined];

  it('fills only the listed omitted params without modifying the input', () => {
    const parts = ['item', null, 'hex'];

    expect(fillOmittedDefaults(parts, blueprints, [1])).toEqual(['item', 'summary', 'hex']);
    expect(parts).toEqual(['item', null, 'hex']);
  });

  it('returns an equal copy when nothing is listed', () => {
    const parts = ['item', null, 'hex'];
    const filled = fillOmittedDefaults(parts, blueprints, []);

    expect(filled).toEqual(parts);
    expect(filled).not.toBe(parts);
  });

  it('returns null when a default cannot be serialized', () => {
    expect(fillOmittedDefaults(['item', null], [undefined, PATH_PARAM_BLUEPRINTS_MAP.string()], [1])).toBeNull();
  });
});

describe('joinPathParts', () => {
  it('joins parts and prefixes absolute patterns with a slash', () => {
    expect(joinPathParts(parsePathPattern('/item/:id'), ['item', 'abc'])).toBe('/item/abc');
    expect(joinPathParts(parsePathPattern('item/:id'), ['item', 'abc'])).toBe('item/abc');
  });

  it('skips omitted parts', () => {
    expect(joinPathParts(parsePathPattern('/item/:id?'), ['item', null])).toBe('/item');
  });

  it('handles patterns where every part is omitted', () => {
    expect(joinPathParts(parsePathPattern('/:id?'), [null])).toBe('/');
    expect(joinPathParts(parsePathPattern(':id?'), [null])).toBe('');
  });

  it('keeps empty static segments', () => {
    expect(joinPathParts(parsePathPattern('/item/:id?/'), ['item', null, ''])).toBe('/item/');
  });
});

describe('pathnameRoundTrips', () => {
  const pattern = parsePathPattern('/item/:view?/:id/:tab?');
  const blueprints = getSegmentBlueprints(pattern, {
    view: PATH_PARAM_BLUEPRINTS_MAP.string('summary'),
    id: PATH_PARAM_BLUEPRINTS_MAP.string(),
    tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
  });
  const encodedParts = ['item', null, 'abc', 'hex'];

  it('is true when every value parses back unchanged', () => {
    expect(pathnameRoundTrips(pattern, '/item/summary/abc/hex', encodedParts, blueprints)).toBe(true);
  });

  it('is false when a supplied value would be read as a different parameter', () => {
    expect(pathnameRoundTrips(pattern, '/item/abc/hex', encodedParts, blueprints)).toBe(false);
  });

  it('is false when the pathname does not match the pattern', () => {
    expect(pathnameRoundTrips(pattern, '/other/abc', encodedParts, blueprints)).toBe(false);
  });

  it('is false when the pathname contains an invalid parameter value', () => {
    const idPattern = parsePathPattern('/item/:id');
    const idBlueprints = getSegmentBlueprints(idPattern, { id: PATH_PARAM_BLUEPRINTS_MAP.string() });

    expect(pathnameRoundTrips(idPattern, '/item/', ['item', 'abc'], idBlueprints)).toBe(false);
  });

  it('is true for an omitted optional param that parses to its default', () => {
    const optionalPattern = parsePathPattern('/item/:id?');
    const optionalBlueprints = getSegmentBlueprints(optionalPattern, { id: PATH_PARAM_BLUEPRINTS_MAP.string('x') });

    expect(pathnameRoundTrips(optionalPattern, '/item', ['item', null], optionalBlueprints)).toBe(true);
  });
});
