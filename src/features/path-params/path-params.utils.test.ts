import type { InferPathParamKeyFromPath, RoutePath } from 'features/path-params';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';
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

  it('rejects optional route parameters', () => {
    const optionalPath: RoutePath = '/item/:itemID?';
    expect(() => createPathParamsCodec(optionalPath)).toThrow('Optional path parameters are not supported.');
    expectTypeOf<InferPathParamKeyFromPath<'/item/:itemID?'>>().toEqualTypeOf<never>();

    expect(() => {
      // @ts-expect-error Optional route parameter syntax is unsupported.
      createPathParamsCodec('/item/:itemID?');
    }).toThrow('Optional path parameters are not supported.');
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

  it('decodes URI-encoded path segments', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/a%20b'))).toEqual({ itemID: 'a b' });
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
});
