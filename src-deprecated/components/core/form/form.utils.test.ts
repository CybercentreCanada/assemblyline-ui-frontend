import { isObject } from 'components/core/form/form.utils';
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
});
