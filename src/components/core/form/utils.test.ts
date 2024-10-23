import { expect } from 'vitest';
import type { NestedType } from './models';
import { isObject } from './utils';

// Demo
const dictionary = {
  someProp: 123,
  nested: {
    moreProps: 333,
    deeper: {
      evenDeeper: {
        deepest: 'string'
      }
    },
    alsoDeeper: {
      randomProp: {
        anotherProp: 'another'
      }
    }
  }
} as const;

type MyDict = typeof dictionary;

type Test = NestedType<MyDict, 'nested.alsoDeeper.randomProp.anotherProp'>; // = yay

const Fn = <T, P extends string>(dict: T, path: P): NestedType<T, P> => {
  // skip impl.
  return undefined as any;
};

const testFromFn = Fn(dictionary, 'nested.moreProps'); // = 333

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
