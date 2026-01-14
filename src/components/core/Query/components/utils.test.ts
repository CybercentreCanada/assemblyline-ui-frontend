import { stableStringify } from 'components/core/Query/components/utils';
import { describe, expect, it } from 'vitest';

describe('stableStringify', () => {
  it('should stringify primitives correctly', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(false)).toBe('false');
    expect(stableStringify(123)).toBe('123');
    expect(stableStringify('abc')).toBe('"abc"');
  });

  it('should stringify arrays consistently', () => {
    expect(stableStringify([3, 2, 1])).toBe('[3,2,1]');
    expect(stableStringify([{ a: 1 }, { b: 2 }])).toBe('[{"a":1},{"b":2}]');
  });

  it('should stringify objects with sorted keys', () => {
    const obj = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(stableStringify(obj)).toBe('{"a":1,"b":2}');
    expect(stableStringify(obj2)).toBe('{"a":1,"b":2}');
  });

  it('should handle nested structures', () => {
    const nested = { z: [2, 1], a: { b: 3 } };
    expect(stableStringify(nested)).toBe('{"a":{"b":3},"z":[2,1]}');
  });

  it('should convert Date to ISO string', () => {
    const date = new Date('2026-01-05T00:00:00Z');
    expect(stableStringify({ d: date })).toBe(`{"d":"${date.toISOString()}"}`);
  });
});
