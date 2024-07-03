import { describe, test } from 'vitest';
import type { SearchParamsFormat } from './SearchParamsParser';
import SearchParamsParser from './SearchParamsParser';

type Format = {
  query: string;
};

const format: SearchParamsFormat<Format> = {
  query: 'string'
};

const options = {};

describe('describe', () => {
  test('test', () => {
    const parser = new SearchParamsParser(format, options);

    parser
      .fromParams('')
      .filterObj((key, value) => true)
      .toObject({});

    // const test = parser.fromObject({}).
    const test2 = parser.fromParams(new URLSearchParams()).toObject();

    // expect(parser.toObject(null)).toBe(null);
  });
});
