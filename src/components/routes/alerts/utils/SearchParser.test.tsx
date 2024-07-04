import { describe, expect, test } from 'vitest';
import type { SearchFormat } from './SearchParser';
import { SearchFormatter } from './SearchParser';

type Format = {
  query: string;
};

const format: SearchFormat<Format> = {
  query: 'string'
};

const options = {};

describe('class SearchFormatter', () => {
  const formatter = new SearchFormatter<Format>(format);

  test('testing the mergeArray', () => {
    expect(formatter.mergeArray([], []).toSorted()).toStrictEqual([].toSorted());
    expect(formatter.mergeArray(['apple', 'banana', 'orange'], ['banana', 'orange', 'grape']).toSorted()).toStrictEqual(
      ['apple', 'banana', 'orange', 'grape'].toSorted()
    );
  });

  test('testing the diffArray', () => {
    expect(formatter.diffArray([], []).toSorted()).toStrictEqual([].toSorted());
    expect(formatter.diffArray(['apple', 'banana', 'orange'], ['banana', 'orange', 'grape']).toSorted()).toStrictEqual(
      ['apple', '!(grape)'].toSorted()
    );
  });
});
