import { describe, expect, it } from '@jest/globals';
import toArrayBuffer from 'helpers/toArrayBuffer';

describe('Test `toArrayBuffer`', () => {
  it('Should return a uint8array', () => {
    expect(toArrayBuffer([1, 2, 3])).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('Should convert non-unint8 data into 0s', () => {
    expect(toArrayBuffer(['a', 'b'])).toEqual(new Uint8Array([0, 0]));
    expect(toArrayBuffer([1e20, 2e15, 100])).toEqual(new Uint8Array([0, 0, 100]));
  });

  it('Should return an empty buffer on invalid data types', () => {
    expect(toArrayBuffer(new Set([1, 2]))).toEqual(new Uint8Array([]));
    expect(toArrayBuffer({ 1: 2 })).toEqual(new Uint8Array([]));
  });
});
