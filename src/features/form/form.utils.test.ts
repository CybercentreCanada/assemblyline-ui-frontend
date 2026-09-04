import { buildPath, getValueFromPath, isObject, setValue, setValueFromPath } from 'features/form/form.utils';
import { expect } from 'vitest';

describe('Test `Form Utilities`', () => {
  it('testing the `isObject()`', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject({}, true)).toBe(true);
    expect(isObject({}, false)).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject({ test: 'test' })).toBe(true);
  });

  it('testing the `buildPath()`', () => {
    expect(buildPath({ a: 1, b: { c: 2 } }).a.toPath()).toBe('$.a');
    expect(buildPath({ a: 1, b: { c: 2 } }).b.c.toPath()).toBe('$.b.c');
    expect(buildPath([1, 2])[0].toPath()).toBe('$.0');
    expect(buildPath(1).toPath()).toBe('$');
  });

  it('testing the `getValueFromPath()`', () => {
    const data = { a: { b: { c: 3 } } };
    expect(getValueFromPath(data, '$.a.b.c')).toBe(3);
    expect(getValueFromPath(data, 'a.b')).toEqual({ c: 3 });
    expect(getValueFromPath(data, 'a.missing')).toBeUndefined();
    expect(getValueFromPath(null as never, 'a')).toBeNull();
  });

  it('testing the `setValue()`', () => {
    expect(setValue({ a: 1, b: 2 }, ['a'], 9)).toEqual({ a: 9, b: 2 });
    expect(setValue({ a: { b: 1 } }, ['a', 'b'], 5)).toEqual({ a: { b: 5 } });
    expect(setValue({ a: 1 } as never, [], 9)).toBe(9);
  });

  it('testing the `setValueFromPath()`', () => {
    expect(
      (setValueFromPath as (s: object, p: never, v: never) => unknown)({ a: 1, b: 2 }, 'a' as never, 9 as never)
    ).toEqual({ a: 9, b: 2 });
    expect(
      (setValueFromPath as (s: object, p: never, v: never) => unknown)({ a: { b: 1 } }, ['a', 'b'] as never, 5 as never)
    ).toEqual({ a: { b: 5 } });
  });
});
