import type { InferHashParamCodecFromBlueprint } from 'features/hash-params';
import { createHashParamCodec, getDefaultHashParamBlueprint, HASH_PARAM_BLUEPRINTS } from 'features/hash-params';
import type { Location } from 'react-router';
import { describe, expect, expectTypeOf, it } from 'vitest';

describe('hash-params.codec', () => {
  describe('getDefaultHashParamBlueprint', () => {
    it('returns a safe no-op hash blueprint', () => {
      const blueprint = getDefaultHashParamBlueprint();

      expect(blueprint.type).toBe('');
      expect(blueprint.parse('abc')).toBeUndefined();
      expect(blueprint.stringify('abc')).toBe('');
    });
  });

  describe('createHashParamCodec', () => {
    it('preserves the configured blueprint types in the codec type', () => {
      const blueprint = HASH_PARAM_BLUEPRINTS.enum(['title', 'section-1'] as const);
      type Codec = InferHashParamCodecFromBlueprint<typeof blueprint>;

      expectTypeOf<Codec['blueprint']>().toEqualTypeOf<typeof blueprint>();
      expectTypeOf<Codec['type']>().toEqualTypeOf<'title' | 'section-1'>();
      expectTypeOf<ReturnType<Codec['parse']>>().toEqualTypeOf<'title' | 'section-1' | undefined>();
      expectTypeOf<Parameters<Codec['stringify']>[0]>().toEqualTypeOf<'title' | 'section-1' | undefined>();
    });

    it('infers enum codec members from the configured blueprint', () => {
      const codec = createHashParamCodec<'title' | 'section'>()(blueprint =>
        blueprint.enum(['title', 'section'] as const)
      );

      expectTypeOf<typeof codec.type>().toEqualTypeOf<'title' | 'section'>();
      expectTypeOf<ReturnType<typeof codec.parse>>().toEqualTypeOf<'title' | 'section' | undefined>();
      expectTypeOf<Parameters<typeof codec.stringify>[0]>().toEqualTypeOf<'title' | 'section' | undefined>();
    });

    it('rejects enum options with colliding string representations', () => {
      expect(() => HASH_PARAM_BLUEPRINTS.enum([1, '1'] as const)).toThrow(
        'Enum options must have unique string representations.'
      );
      expect(() => HASH_PARAM_BLUEPRINTS.enum([true, 'true'] as const)).toThrow(
        'Enum options must have unique string representations.'
      );
    });

    it('should parse enum hash values correctly', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section-1', 'section-2']));

      const location1: Location = { pathname: '/test', hash: '#title', search: '', state: null, key: 'default' };
      expect(codec.parse(location1)).toBe('title');

      const location2: Location = { pathname: '/test', hash: '#section-1', search: '', state: null, key: 'default' };
      expect(codec.parse(location2)).toBe('section-1');

      const location3: Location = { pathname: '/test', hash: '', search: '', state: null, key: 'default' };
      expect(codec.parse(location3)).toBeUndefined();
    });

    it('should handle missing hash gracefully', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section-1'], 'title'));

      const location: Location = { pathname: '/test', hash: '', search: '', state: null, key: 'default' };
      expect(codec.parse(location)).toBe('title');
    });

    it('should return undefined for unmatched hash values', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section-1']));

      const location: Location = { pathname: '/test', hash: '#invalid', search: '', state: null, key: 'default' };
      expect(codec.parse(location)).toBeUndefined();
    });

    it('should stringify values back to hash format', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section-1', 'section-2']));

      expect(codec.stringify('title')).toBe('#title');
      expect(codec.stringify('section-1')).toBe('#section-1');
      expect(codec.stringify(undefined)).toBe('');
    });

    it('should handle URL encoding/decoding', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['my-section', 'other-section']));

      const encoded = codec.stringify('my-section');
      expect(encoded).toBe('#my-section');

      const location: Location = { pathname: '/test', hash: encoded, search: '', state: null, key: 'default' };
      expect(codec.parse(location)).toBe('my-section');
    });

    it('should provide a type property for compile-time inference', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section-1', 'section-2']));

      // This should be inferred as 'title' | 'section-1' | 'section-2'
      const _type = codec.type;
      expect(_type).toBe('title');
    });

    it('should handle numeric and boolean enum values', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum([1, 2, 3] as const));

      const location: Location = { pathname: '/test', hash: '#2', search: '', state: null, key: 'default' };
      expect(codec.parse(location)).toBe(2);

      expect(codec.stringify(1)).toBe('#1');
    });

    it('should handle hash with leading # character', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.enum(['title', 'section']));

      const location1: Location = { pathname: '/test', hash: '#title', search: '', state: null, key: 'default' };
      expect(codec.parse(location1)).toBe('title');

      const location2: Location = { pathname: '/test', hash: 'title', search: '', state: null, key: 'default' };
      expect(codec.parse(location2)).toBe('title');
    });

    it('should parse and stringify string hash values, falling back to the default', () => {
      const codec = createHashParamCodec()(blueprint => blueprint.string('fallback'));

      const location1: Location = { pathname: '/test', hash: '#custom', search: '', state: null, key: 'default' };
      expect(codec.parse(location1)).toBe('custom');

      const location2: Location = { pathname: '/test', hash: '', search: '', state: null, key: 'default' };
      expect(codec.parse(location2)).toBe('fallback');

      expect(codec.stringify('custom')).toBe('#custom');
      expect(codec.stringify('fallback')).toBe('');
    });
  });
});
