import { expect, test } from 'vitest';

const fn = () => {
  return 'Hello, tsdown!';
};

test('fn', () => {
  expect(fn()).toBe('Hello, tsdown!');
});
