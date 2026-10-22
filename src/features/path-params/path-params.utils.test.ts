import type { InferOptionalPathParamKeyFromPath, InferPathParamKeyFromPath, RoutePath } from 'features/path-params';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';
import { matchPathPattern, parsePathPattern, stringifyPathPattern } from 'features/path-params/path-params.utils';
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
});
