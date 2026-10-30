import { buildPath, getValueFromPath, isObject, setValue, setValueFromPath } from 'features/form/form.utils.ts';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// isObject
//*****************************************************************************************
describe('isObject', () => {
  it.each([undefined, null, false, true, 0, '', 'text', [], [1]])('rejects non-object value %j', value => {
    expect(isObject(value)).toBe(false);
  });

  it('accepts empty objects by default and when explicitly allowed', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({}, true)).toBe(true);
  });

  it('rejects empty objects when empty objects are disabled', () => {
    expect(isObject({}, false)).toBe(false);
  });

  it('accepts populated objects even when their values are falsy', () => {
    expect(isObject({ count: 0, enabled: false, name: '' }, false)).toBe(true);
  });
});

//*****************************************************************************************
// buildPath
//*****************************************************************************************
describe('buildPath', () => {
  it('builds resolvers for the root and nested properties', () => {
    const paths = buildPath({ user: { name: 'Alice' }, enabled: false });

    expect(paths.toPath()).toBe('$');
    expect(paths.user.toPath()).toBe('$.user');
    expect(paths.user.name.toPath()).toBe('$.user.name');
    expect(paths.enabled.toPath()).toBe('$.enabled');
  });

  it('builds array element paths starting at index zero', () => {
    const paths = buildPath({ items: [{ value: 0 }, { value: 1 }] });

    expect(paths.items[0].toPath()).toBe('$.items.0');
    expect(paths.items[1].value.toPath()).toBe('$.items.1.value');
  });

  it('uses a custom prefix for nested paths', () => {
    const paths = buildPath({ name: 'Alice' }, 'form');

    expect(paths.toPath()).toBe('form');
    expect(paths.name.toPath()).toBe('form.name');
  });

  it('handles empty objects and arrays', () => {
    expect(buildPath({}).toPath()).toBe('$');
    expect(buildPath([])).toEqual([]);
    expect(buildPath({ items: [] }).items).toEqual([]);
  });

  it('builds a root resolver for a primitive value', () => {
    expect(buildPath(0).toPath()).toBe('$');
  });

  it('produces paths that can read the original data', () => {
    const data = { items: [{ name: 'first' }] };
    const paths = buildPath(data);

    expect(getValueFromPath(data, paths.items[0].name.toPath())).toBe('first');
  });
});

//*****************************************************************************************
// getValueFromPath
//*****************************************************************************************
describe('getValueFromPath', () => {
  it.each(['user.name', '$.user.name'])('reads nested values using %s', path => {
    expect(getValueFromPath({ user: { name: 'Alice' } }, path)).toBe('Alice');
  });

  it('returns the original object for the root path', () => {
    const data = { name: 'Alice' };

    expect(getValueFromPath(data, '$')).toBe(data);
  });

  it('reads the first element in an array', () => {
    expect(getValueFromPath({ items: [{ value: 42 }] }, '$.items.0.value')).toBe(42);
  });

  it.each([0, false, '', null])('preserves the leaf value %j', value => {
    expect(getValueFromPath({ nested: { value } }, '$.nested.value')).toBe(value);
  });

  it('returns undefined for missing properties and out-of-range indices', () => {
    expect(getValueFromPath({}, '$.missing')).toBeUndefined();
    expect(getValueFromPath({ nested: {} }, '$.nested.missing.value')).toBeUndefined();
    expect(getValueFromPath({ items: [] }, '$.items.0')).toBeUndefined();
  });

  it.each([null, undefined])('returns null for nullish root input %j', data => {
    expect(getValueFromPath(data, '$.value')).toBeNull();
  });

  it('returns undefined when a path continues through null', () => {
    expect(getValueFromPath({ nested: null }, '$.nested.value')).toBeUndefined();
  });

  it('returns undefined when a path continues through a primitive', () => {
    expect(getValueFromPath({ nested: 0 }, '$.nested.value')).toBeUndefined();
  });
});

//*****************************************************************************************
// setValue
//*****************************************************************************************
describe('setValue', () => {
  it('updates a nested value while preserving siblings and the original object', () => {
    const data = { user: { name: 'Alice', enabled: true }, unchanged: { id: 1 } };
    const path = ['user', 'name'];
    const result = setValue(data, path, 'Bob') as typeof data;

    expect(result).toEqual({ user: { name: 'Bob', enabled: true }, unchanged: { id: 1 } });
    expect(data.user.name).toBe('Alice');
    expect(path).toEqual(['user', 'name']);
    expect(result).not.toBe(data);
    expect(result.user).not.toBe(data.user);
    expect(result.unchanged).toBe(data.unchanged);
  });

  it('replaces the root value for an empty path', () => {
    const replacement = { value: 2 };

    expect(setValue({ value: 1 }, [], replacement)).toBe(replacement);
  });

  it('adds a property to an empty object', () => {
    expect(setValue({}, ['enabled'], false)).toEqual({ enabled: false });
  });

  it.each([0, false, '', null])('sets falsy replacement %j', value => {
    expect(setValue({ nested: { value: 'old' } }, ['nested', 'value'], value)).toEqual({ nested: { value } });
  });
});

//*****************************************************************************************
// setValueFromPath
//*****************************************************************************************
describe('setValueFromPath', () => {
  it('updates a typed nested path without changing the original store', () => {
    const store = { user: { name: 'Alice', enabled: true } };
    const path: ['user', 'name'] = ['user', 'name'];
    const result = setValueFromPath(store, path, 'Bob');

    expect(result).toEqual({ user: { name: 'Bob', enabled: true } });
    expect(store.user.name).toBe('Alice');
  });

  it('sets a top-level boolean to false', () => {
    expect(setValueFromPath({ enabled: true }, ['enabled'], false)).toEqual({ enabled: false });
  });

  it('updates a property containing an empty collection', () => {
    const store = { values: [] as number[] };

    expect(setValueFromPath(store, ['values'], [0])).toEqual({ values: [0] });
    expect(store.values).toEqual([]);
  });
});
