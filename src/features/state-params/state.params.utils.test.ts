import {
  areStateParamValuesEqual,
  cloneStateParamValue,
  createDefaultStateParamBlueprint,
  getStateParamDeltaValue,
  getStateParamDeltaValues,
  isStateParamRecord,
  mergeStateParamValues
} from 'features/state-params';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// createDefaultStateParamBlueprint
//*****************************************************************************************
describe('createDefaultStateParamBlueprint', () => {
  it('creates a safe no-op blueprint', () => {
    const blueprint = createDefaultStateParamBlueprint();

    expect(blueprint.type).toEqual({});
    expect(blueprint.full({ value: 1 })).toEqual({});
    expect(blueprint.delta({ value: 1 })).toBeUndefined();
  });

  it('returns a cloned object from full', () => {
    const blueprint = createDefaultStateParamBlueprint();
    const next = blueprint.full(undefined);

    expect(next).toEqual({});
    expect(next).not.toBe(blueprint.type);
  });
});

//*****************************************************************************************
// isStateParamRecord
//*****************************************************************************************
describe('isStateParamRecord', () => {
  it('returns true for non-null objects that are not arrays', () => {
    expect(isStateParamRecord({ a: 1 })).toBe(true);
  });

  it('returns false for null, arrays, and primitives', () => {
    expect(isStateParamRecord(null)).toBe(false);
    expect(isStateParamRecord([1, 2, 3])).toBe(false);
    expect(isStateParamRecord('abc')).toBe(false);
    expect(isStateParamRecord(1)).toBe(false);
  });
});

//*****************************************************************************************
// cloneStateParamValue
//*****************************************************************************************
describe('cloneStateParamValue', () => {
  it('returns primitives as-is', () => {
    expect(cloneStateParamValue(1)).toBe(1);
    expect(cloneStateParamValue('asd')).toBe('asd');
    expect(cloneStateParamValue(null)).toBe(null);
  });

  it('clones arrays and objects deeply', () => {
    const value = { a: 1, nested: { b: 2 }, list: [1, 2, 3] };

    const next = cloneStateParamValue(value);

    expect(next).toEqual(value);
    expect(next).not.toBe(value);
    expect(next.nested).not.toBe(value.nested);
    expect(next.list).not.toBe(value.list);
  });
});

//*****************************************************************************************
// areStateParamValuesEqual
//*****************************************************************************************
describe('areStateParamValuesEqual', () => {
  it('returns true for deeply equal objects and arrays', () => {
    expect(areStateParamValuesEqual({ a: 1, nested: { b: 2 } }, { a: 1, nested: { b: 2 } })).toBe(true);
    expect(areStateParamValuesEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
  });

  it('returns false for different structures or values', () => {
    expect(areStateParamValuesEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(areStateParamValuesEqual([1, 2], [2, 1])).toBe(false);
    expect(areStateParamValuesEqual({ a: 1 }, [1])).toBe(false);
  });
});

//*****************************************************************************************
// getStateParamDeltaValue
//*****************************************************************************************
describe('getStateParamDeltaValue', () => {
  it('returns undefined when primitive value is unchanged', () => {
    expect(getStateParamDeltaValue(1, 1)).toBeUndefined();
  });

  it('returns changed primitive value', () => {
    expect(getStateParamDeltaValue(1, 2)).toBe(2);
  });

  it('returns object delta for changed nested keys only', () => {
    const defaults = { a: 1, nested: { mode: 'auto', count: 0 } };
    const next = { a: 1, nested: { mode: 'manual', count: 0 } };

    expect(getStateParamDeltaValue(defaults, next)).toEqual({ nested: { mode: 'manual' } });
  });
});

//*****************************************************************************************
// mergeStateParamValues
//*****************************************************************************************
describe('mergeStateParamValues', () => {
  it('merges provided values into the default object', () => {
    const defaults = { count: 1, enabled: false, nested: { mode: 'auto' } } as const;

    const next = mergeStateParamValues(defaults, { enabled: true, nested: { mode: 'manual' } });

    expect(next).toEqual({ count: 1, enabled: true, nested: { mode: 'manual' } });
  });

  it('returns a cloned default object for empty input', () => {
    const defaults = { count: 1, nested: { mode: 'auto' } } as const;

    const next = mergeStateParamValues(defaults, undefined);

    expect(next).toEqual(defaults);
    expect(next).not.toBe(defaults);
    expect(next.nested).not.toBe(defaults.nested);
  });

  it('preserves default values for invalid input shapes', () => {
    const defaults = { count: 1, flags: ['a'] };

    const next = mergeStateParamValues(defaults, 'invalid');

    expect(next).toEqual(defaults);
    expect(next.flags).not.toBe(defaults.flags);
  });

  it('replaces arrays when the incoming value is an array', () => {
    const defaults = { tags: ['a', 'b'], nested: { values: [1] } };

    const next = mergeStateParamValues(defaults, { tags: ['x'], nested: { values: [2, 3] } });

    expect(next).toEqual({ tags: ['x'], nested: { values: [2, 3] } });
  });

  it('keeps default arrays when the incoming value is not an array', () => {
    const defaults = { tags: ['a', 'b'] };

    const next = mergeStateParamValues(defaults, { tags: 'bad-shape' });

    expect(next).toEqual(defaults);
  });
});

//*****************************************************************************************
// getStateParamDeltaValues
//*****************************************************************************************
describe('getStateParamDeltaValues', () => {
  it('returns only changed keys', () => {
    const defaults = { test: 'asd', count: 1, nested: { mode: 'auto' } } as const;

    const next = getStateParamDeltaValues(defaults, { count: 5, nested: { mode: 'manual' } });

    expect(next).toEqual({ count: 5, nested: { mode: 'manual' } });
  });

  it('returns undefined when values are unchanged', () => {
    const defaults = { test: 'asd', count: 1, nested: { mode: 'auto' } } as const;

    const next = getStateParamDeltaValues(defaults, { test: 'asd', count: 1, nested: { mode: 'auto' } });

    expect(next).toBeUndefined();
  });

  it('returns undefined for non-record input', () => {
    const defaults = { test: 'asd', count: 1 } as const;

    expect(getStateParamDeltaValues(defaults, undefined)).toBeUndefined();
    expect(getStateParamDeltaValues(defaults, null as never)).toBeUndefined();
    expect(getStateParamDeltaValues(defaults, 'invalid' as never)).toBeUndefined();
  });
});
