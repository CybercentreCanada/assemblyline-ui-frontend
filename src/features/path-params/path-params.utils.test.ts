import type { InferPathParamKeyFromPath } from 'features/path-params';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from 'features/path-params';
import {
  decodePathSegment,
  extractPathParams,
  getOwnValue,
  joinPathParts,
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
    expectTypeOf<InferPathParamKeyFromPath<'/files/:id/:tab'>>().toEqualTypeOf<'id' | 'tab'>();
    expectTypeOf<InferPathParamKeyFromPath<string>>().toEqualTypeOf<string>();
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

  it('parses a slashless path definition', () => {
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

  it('does not compare static segments with the pathname', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string('none') }));

    expect(codec.parse(makeLocation('/other/abc'))).toEqual({ itemID: 'abc' });
    expect(codec.parse(makeLocation('/item/abc/extra'))).toEqual({ itemID: 'abc' });
  });

  it('uses default values when the pathname segment is missing or empty', () => {
    const codec = createPathParamsCodec('/item/:itemID/page/:pageNumber')(b => ({
      itemID: b.string('none'),
      pageNumber: b.number(1)
    }));

    expect(codec.parse(makeLocation('/item'))).toEqual({ itemID: 'none', pageNumber: 1 });
    expect(codec.parse(makeLocation('/item/'))).toEqual({ itemID: 'none', pageNumber: 1 });
    expect(codec.parse(makeLocation('/item//page/3'))).toEqual({ itemID: 'none', pageNumber: 3 });
    expect(codec.parse(makeLocation(''))).toEqual({ itemID: 'none', pageNumber: 1 });
  });

  it('uses the default for a value the blueprint does not recognize', () => {
    const codec = createPathParamsCodec('/file/:id/:tab')(b => ({
      id: b.string(),
      tab: b.enum(['ascii', 'hex'] as const, 'ascii')
    }));

    expect(codec.parse(makeLocation('/file/abc/unknown'))).toEqual({ id: 'abc', tab: 'ascii' });
  });

  it('ignores a trailing slash', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string('fallback') }));

    expect(codec.parse(makeLocation('/item/value/'))).toEqual({ itemID: 'value' });

    const trailingSlashCodec = createPathParamsCodec('/item/:id/')(b => ({ id: b.string('fallback') }));
    const pathname = trailingSlashCodec.stringify({ id: 'abc' });
    expect(pathname).toBe('/item/abc/');
    expect(trailingSlashCodec.parse(makeLocation(pathname))).toEqual({ id: 'abc' });
  });

  it('decodes URI-encoded path segments', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/a%20b'))).toEqual({ itemID: 'a b' });
  });

  it('preserves malformed escapes as literal text', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));
    expect(codec.parse(makeLocation('/item/caf%ZZ'))).toEqual({ itemID: 'caf%ZZ' });
  });

  it('returns dot-segment values as they are when parsing', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(codec.parse(makeLocation('/item/..'))).toEqual({ itemID: '..' });
    expect(codec.parse(makeLocation('/item/%2E%2E'))).toEqual({ itemID: '..' });
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

  it('ignores inherited properties on the blueprint object', () => {
    const codec = createPathParamsCodec('/item/:constructor')(b => ({ constructor: b.string('fallback') }));

    expect(codec.parse(makeLocation('/item'))).toEqual({ constructor: 'fallback' });
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

  it('writes punctuation and dot values as they are', () => {
    const codec = createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() }));

    expect(codec.stringify({ itemID: 'a-b_1' })).toBe('/item/a-b_1');
    expect(codec.parse(makeLocation('/item/a-b_1'))).toEqual({ itemID: 'a-b_1' });
    expect(codec.stringify({ itemID: '...' })).toBe('/item/...');
    expect(codec.stringify({ itemID: '..' })).toBe('/item/..');
  });

  it('does not validate values when stringifying', () => {
    const codec = createPathParamsCodec('/item/:itemID/page/:pageNumber')(b => ({
      itemID: b.string(),
      pageNumber: b.number(0)
    }));

    expect(codec.stringify({ itemID: '', pageNumber: 3 })).toBe('/item//page/3');
    expect(codec.stringify({ itemID: '.', pageNumber: 3 })).toBe('/item/./page/3');
    expect(codec.stringify({ itemID: '..', pageNumber: 3 })).toBe('/item/../page/3');
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

//*****************************************************************************************
// decodePathSegment
//*****************************************************************************************

describe('decodePathSegment', () => {
  it('decodes URI-encoded segments', () => {
    expect(decodePathSegment('a%20b')).toBe('a b');
    expect(decodePathSegment('caf%C3%A9')).toBe('café');
  });

  it('keeps malformed escapes as literal text', () => {
    expect(decodePathSegment('caf%ZZ')).toBe('caf%ZZ');
    expect(decodePathSegment('%E0%A4%A')).toBe('%E0%A4%A');
  });

  it('returns an empty segment as-is', () => {
    expect(decodePathSegment('')).toBe('');
  });
});

//*****************************************************************************************
// getOwnValue
//*****************************************************************************************

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

//*****************************************************************************************
// parsePathPattern
//*****************************************************************************************

describe('parsePathPattern', () => {
  it('splits a definition into static and param segments', () => {
    expect(parsePathPattern('/Item/:id/:tab')).toEqual({
      absolute: true,
      segments: [
        { kind: 'static', raw: 'Item' },
        { kind: 'param', raw: ':id', key: 'id' },
        { kind: 'param', raw: ':tab', key: 'tab' }
      ]
    });
  });

  it('tracks a slashless definition as not absolute', () => {
    expect(parsePathPattern('item/:id').absolute).toBe(false);
  });

  it('keeps a trailing slash as an empty static segment', () => {
    expect(parsePathPattern('/item/:id/').segments.at(-1)).toEqual({ kind: 'static', raw: '' });
  });

  it('treats the root as a single empty static segment', () => {
    expect(parsePathPattern('/')).toEqual({ absolute: true, segments: [{ kind: 'static', raw: '' }] });
  });

  it('reads everything after the colon as the key', () => {
    expect(parsePathPattern('/:a-b').segments).toEqual([{ kind: 'param', raw: ':a-b', key: 'a-b' }]);
  });
});

//*****************************************************************************************
// splitPathname
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

//*****************************************************************************************
// extractPathParams
//*****************************************************************************************

describe('extractPathParams', () => {
  it('returns decoded values in a null-prototype object', () => {
    const params = extractPathParams(parsePathPattern('/item/:id'), '/item/a%20b');

    expect(Object.getPrototypeOf(params)).toBe(null);
    expect(params).toEqual({ id: 'a b' });
  });

  it('reads values by position and does not compare static segments', () => {
    const pattern = parsePathPattern('/item/:id');

    expect(extractPathParams(pattern, '/other/abc')).toEqual({ id: 'abc' });
    expect(extractPathParams(pattern, '/item/abc/extra')).toEqual({ id: 'abc' });
  });

  it('returns undefined for a missing or empty segment', () => {
    const pattern = parsePathPattern('/item/:id');

    expect(extractPathParams(pattern, '/item')).toEqual({ id: undefined });
    expect(extractPathParams(pattern, '/item/')).toEqual({ id: undefined });
    expect(extractPathParams(pattern, '/item//')).toEqual({ id: undefined });
    expect(extractPathParams(pattern, '')).toEqual({ id: undefined });
  });

  it('ignores a trailing slash', () => {
    expect(extractPathParams(parsePathPattern('/item/:id'), '/item/abc/')).toEqual({ id: 'abc' });
  });

  it('reads a slashless definition against a pathname with a leading slash', () => {
    expect(extractPathParams(parsePathPattern('item/:id'), '/item/abc')).toEqual({ id: 'abc' });
  });

  it('returns an empty object when the definition has no params', () => {
    expect(extractPathParams(parsePathPattern('/simple'), '/simple')).toEqual({});
  });

  it('returns dot-segment values as they are', () => {
    expect(extractPathParams(parsePathPattern('/item/:id'), '/item/%2E%2E')).toEqual({ id: '..' });
  });
});

//*****************************************************************************************
// serializePathParam
//*****************************************************************************************

describe('serializePathParam', () => {
  it('serializes through the blueprint and URI-encodes the result', () => {
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.string(), 'a b/a')).toBe('a%20b%2Fa');
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.number(), 42)).toBe('42');
    expect(serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.enum(['a', 'b'] as const, 'b'), 'invalid')).toBe('b');
  });

  it('does not validate the serialized value', () => {
    const blueprint = PATH_PARAM_BLUEPRINTS_MAP.string();

    expect(serializePathParam(blueprint, '')).toBe('');
    expect(serializePathParam(blueprint, '.')).toBe('.');
    expect(serializePathParam(blueprint, '..')).toBe('..');
  });

  it('throws a URIError for values that cannot be encoded', () => {
    expect(() => serializePathParam(PATH_PARAM_BLUEPRINTS_MAP.string(), 'a\uD800')).toThrow(URIError);
  });
});

//*****************************************************************************************
// serializePathSegments
//*****************************************************************************************

describe('serializePathSegments', () => {
  const pattern = parsePathPattern('/item/:id/:tab');
  const blueprints = {
    id: PATH_PARAM_BLUEPRINTS_MAP.string(),
    tab: PATH_PARAM_BLUEPRINTS_MAP.string('main')
  };

  it('keeps static segments and encodes param values', () => {
    expect(serializePathSegments(pattern, { id: 'a b', tab: 'x' }, blueprints)).toEqual(['item', 'a%20b', 'x']);
  });

  it('keeps the :param text for a param without a blueprint', () => {
    expect(serializePathSegments(parsePathPattern('/item/:id'), { id: 'abc' }, {})).toEqual(['item', ':id']);
  });

  it('keeps the empty segment of a root definition', () => {
    expect(serializePathSegments(parsePathPattern('/'), {}, {})).toEqual(['']);
  });

  it('does not validate the serialized values', () => {
    expect(serializePathSegments(pattern, { id: '', tab: 'x' }, blueprints)).toEqual(['item', '', 'x']);
    expect(serializePathSegments(pattern, { id: '..', tab: 'x' }, blueprints)).toEqual(['item', '..', 'x']);
  });

  it('only reads own properties of values and blueprints', () => {
    const inherited = parsePathPattern('/item/:toString');

    expect(
      serializePathSegments(inherited, { toString: 'abc' }, { toString: PATH_PARAM_BLUEPRINTS_MAP.string() })
    ).toEqual(['item', 'abc']);
    expect(serializePathSegments(inherited, { toString: 'abc' }, {})).toEqual(['item', ':toString']);
  });
});

//*****************************************************************************************
// joinPathParts
//*****************************************************************************************

describe('joinPathParts', () => {
  it('joins parts and prefixes absolute definitions with a slash', () => {
    expect(joinPathParts(parsePathPattern('/item/:id'), ['item', 'abc'])).toBe('/item/abc');
    expect(joinPathParts(parsePathPattern('item/:id'), ['item', 'abc'])).toBe('item/abc');
  });

  it('returns the root for an absolute definition with an empty segment and nothing for no parts', () => {
    expect(joinPathParts(parsePathPattern('/'), [''])).toBe('/');
    expect(joinPathParts(parsePathPattern('item'), [])).toBe('');
  });
});

//*****************************************************************************************
// stringifyPathPattern
//*****************************************************************************************

describe('stringifyPathPattern', () => {
  const blueprints = { id: PATH_PARAM_BLUEPRINTS_MAP.string() };

  it('builds a pathname from the values', () => {
    expect(stringifyPathPattern(parsePathPattern('/item/:id'), { id: 'abc' }, blueprints)).toBe('/item/abc');
  });

  it('keeps a trailing slash from the definition', () => {
    expect(stringifyPathPattern(parsePathPattern('/item/:id/'), { id: 'abc' }, blueprints)).toBe('/item/abc/');
  });

  it('returns a definition without params as it is', () => {
    expect(stringifyPathPattern(parsePathPattern('/simple'), {}, {})).toBe('/simple');
  });

  it('writes an empty value as an empty segment', () => {
    expect(stringifyPathPattern(parsePathPattern('/item/:id'), { id: '' }, blueprints)).toBe('/item/');
  });
});
