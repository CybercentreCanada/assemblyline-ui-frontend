import {
  deepReconcile,
  isValidNumber,
  isValidValue,
  shallowEqual,
  shallowReconcile
} from 'components/core/PropProvider/props.utils';
import { describe, expect, it } from 'vitest';

describe('isValidValue', () => {
  it('returns false for null or undefined', () => {
    expect(isValidValue(null)).toBe(false);
    expect(isValidValue(undefined)).toBe(false);
  });

  it('validates strings', () => {
    expect(isValidValue('')).toBe(false);
    expect(isValidValue('   ')).toBe(false);
    expect(isValidValue('hello')).toBe(true);
  });

  it('validates numbers', () => {
    expect(isValidValue(NaN)).toBe(false);
    expect(isValidValue(0)).toBe(true);
    expect(isValidValue(42)).toBe(true);
  });

  it('validates arrays', () => {
    expect(isValidValue([])).toBe(false);
    expect(isValidValue([1, 2, 3])).toBe(true);
  });

  it('validates objects', () => {
    expect(isValidValue({})).toBe(false);
    expect(isValidValue({ a: 1 })).toBe(true);
  });

  it('returns true for other types', () => {
    expect(isValidValue(true)).toBe(true);
    expect(isValidValue(false)).toBe(true);
    expect(isValidValue(Symbol('x'))).toBe(true);
  });
});

describe('isValidNumber', () => {
  it('returns false for null or undefined', () => {
    expect(isValidNumber(null, {})).toBe(false);
    expect(isValidNumber(undefined, {})).toBe(false);
  });

  it('checks min constraint', () => {
    expect(isValidNumber(5, { min: 3 })).toBe(true);
    expect(isValidNumber(2, { min: 3 })).toBe(false);
  });

  it('checks max constraint', () => {
    expect(isValidNumber(5, { max: 10 })).toBe(true);
    expect(isValidNumber(12, { max: 10 })).toBe(false);
  });

  it('checks both min and max', () => {
    expect(isValidNumber(5, { min: 3, max: 10 })).toBe(true);
    expect(isValidNumber(2, { min: 3, max: 10 })).toBe(false);
    expect(isValidNumber(12, { min: 3, max: 10 })).toBe(false);
  });
});

describe('shallowEqual', () => {
  it('returns true for same primitive values', () => {
    expect(shallowEqual(5, 5)).toBe(true);
    expect(shallowEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different primitive values', () => {
    expect(shallowEqual(5, 6)).toBe(false);
    expect(shallowEqual('a', 'b')).toBe(false);
  });

  it('returns true for objects with identical shallow keys and values', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
  });

  it('returns false for objects with different values', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false for objects with different keys', () => {
    expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it('returns false if one value is not an object', () => {
    expect(shallowEqual({ a: 1 }, null)).toBe(false);
    expect(shallowEqual(null, { a: 1 })).toBe(false);
  });
});

describe('deepReconcile', () => {
  it('merges incoming, existing, and initial correctly', () => {
    const incoming = { a: 1, b: 2 };
    const existing = { b: 5, c: 6 };
    const initial = { b: 0, c: 0, d: 9 };
    const result = deepReconcile(incoming, existing, initial);
    expect(result).toEqual({ a: 1, b: 2, c: 0, d: 9 });
  });

  it('handles missing keys', () => {
    const incoming = {};
    const existing = { a: 1 };
    const initial = { a: 0, b: 2 };
    const result = deepReconcile(incoming, existing, initial);
    expect(result).toEqual({ a: 0, b: 2 });
  });
});

describe('shallowReconcile', () => {
  it('prefers current over previous and result', () => {
    const current = { a: 1 };
    const previous = { a: 0 };
    const result = { a: 9, b: 2 };
    expect(shallowReconcile(current, previous, result)).toEqual({ a: 1, b: 2 });
  });

  it('keeps result values if not overridden', () => {
    const current = {};
    const previous = { a: 0 };
    const result = { a: 9, b: 2 };
    expect(shallowReconcile(current, previous, result)).toEqual({ b: 2 });
  });

  it('ignores keys present in previous and result but missing in current', () => {
    const current = {};
    const previous = { a: 0 };
    const result = { a: 1 };
    expect(shallowReconcile(current, previous, result)).toEqual({});
  });

  it('includes keys only in current', () => {
    const current = { c: 3 } as object;
    const previous = { a: 0 } as object;
    const result = { a: 1, b: 2 } as object;
    expect(shallowReconcile(current, previous, result)).toEqual({ b: 2, c: 3 });
  });
});
