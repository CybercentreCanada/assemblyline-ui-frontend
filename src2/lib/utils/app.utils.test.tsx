import { describe, expect, it } from 'vitest';
import { deepCompare, deepReconcile, generateRandomUUID, shallowCompareObject, shallowReconcile } from './app.utils';

//*****************************************************************************************
// generateRandomUUID
//*****************************************************************************************
describe('generateRandomUUID', () => {
  it('returns a base64 id string', () => {
    const id = generateRandomUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('retries when generated id already exists', () => {
    const firstBytes = new Uint8Array(12).fill(1);
    const secondBytes = new Uint8Array(12).fill(2);
    const firstId = btoa(String.fromCharCode(...firstBytes));
    const secondId = btoa(String.fromCharCode(...secondBytes));

    const spy = vi.spyOn(crypto, 'getRandomValues');
    spy
      .mockImplementationOnce((typedArray: Uint8Array) => {
        typedArray.set(firstBytes);
        return typedArray;
      })
      .mockImplementationOnce((typedArray: Uint8Array) => {
        typedArray.set(secondBytes);
        return typedArray;
      });

    const id = generateRandomUUID([firstId]);

    expect(id).toBe(secondId);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});

//*****************************************************************************************
// shallowCompareObject
//*****************************************************************************************
describe('shallowCompareObject', () => {
  it('returns true for the same object reference', () => {
    const value = { a: 1 };
    expect(shallowCompareObject(value, value)).toBe(true);
  });

  it('compares only top-level values', () => {
    expect(shallowCompareObject({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
    expect(shallowCompareObject({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false);
  });

  it('compares nested arrays by reference at the top level', () => {
    const arr = [1, 2, 3];
    expect(shallowCompareObject({ items: arr }, { items: arr })).toBe(true);
    expect(shallowCompareObject({ items: [1, 2, 3] }, { items: [1, 2, 3] })).toBe(false);
  });

  it('requires non-array root objects', () => {
    expect(shallowCompareObject([1, 2], [1, 2])).toBe(false);
    expect(shallowCompareObject({ a: 1 }, null)).toBe(false);
  });
});

//*****************************************************************************************
// deepCompare
//*****************************************************************************************
describe('deepCompare', () => {
  it('deeply compares nested objects and arrays', () => {
    expect(deepCompare({ a: { b: [1, 2, 3] } }, { a: { b: [1, 2, 3] } })).toBe(true);
    expect(deepCompare({ a: { b: [1, 2, 3] } }, { a: { b: [1, 2, 4] } })).toBe(false);
  });

  it('compares root arrays by item value', () => {
    expect(deepCompare([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(deepCompare([1, { a: 2 }], [1, { a: 3 }])).toBe(false);
  });

  it('compares functions by reference', () => {
    const fn = () => 'x';
    const fn2 = () => 'x';

    expect(deepCompare(fn, fn)).toBe(true);
    expect(deepCompare(fn, fn2)).toBe(false);
    expect(deepCompare({ cb: fn }, { cb: fn })).toBe(true);
    expect(deepCompare({ cb: fn }, { cb: fn2 })).toBe(false);
  });

  it('returns false when root types are incompatible', () => {
    expect(deepCompare({ a: 1 }, [1])).toBe(false);
    expect(deepCompare({ a: 1 }, null)).toBe(false);
    expect(deepCompare(1, 1)).toBe(true);
    expect(deepCompare(1, 2)).toBe(false);
  });
});

//*****************************************************************************************
// shallowReconcile
//*****************************************************************************************
describe('shallowReconcile', () => {
  it('prioritizes current values and keeps result-only values', () => {
    type T = { a: number; b: number; c: number };
    const output = shallowReconcile<T>({ a: 10 }, { a: 1, b: 2 }, { b: 2, c: 3 });

    expect(output).toEqual({ a: 10, c: 3 });
  });

  it('drops keys removed from current when they were already in previous and result', () => {
    type T = { a: number };
    const output = shallowReconcile<T>({}, { a: 1 }, { a: 1 });

    expect(output).toEqual({});
  });
});

//*****************************************************************************************
// deepReconcile
//*****************************************************************************************
describe('deepReconcile', () => {
  it('prioritizes incoming values', () => {
    type T = { a: number; b: number };
    const output = deepReconcile<T>({ a: 10 }, { a: 2, b: 3 }, { a: 1, b: 0 });

    expect(output).toEqual({ a: 10, b: 0 });
  });

  it('falls back to existing, then initial for missing incoming keys', () => {
    type T = { a: number; b: number; c: number };
    const output = deepReconcile<T>({}, { a: 2, c: 9 }, { a: 1, b: 7 });

    expect(output).toEqual({ a: 1, b: 7, c: 9 });
  });
});
