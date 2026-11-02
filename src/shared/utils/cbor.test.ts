import { decode, encode } from 'shared/utils/cbor';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// encode
//*****************************************************************************************
describe('encode', () => {
  it.each([
    { value: 0, bytes: [0x00] },
    { value: 23, bytes: [0x17] },
    { value: 24, bytes: [0x18, 0x18] },
    { value: 255, bytes: [0x18, 0xff] },
    { value: 256, bytes: [0x19, 0x01, 0x00] },
    { value: -1, bytes: [0x20] },
    { value: -24, bytes: [0x37] },
    { value: -25, bytes: [0x38, 0x18] }
  ])('encodes integer $value using the expected CBOR width', ({ value, bytes }) => {
    expect([...new Uint8Array(encode(value))]).toEqual(bytes);
  });

  it.each([
    { value: '', bytes: [0x60] },
    { value: [], bytes: [0x80] },
    { value: {}, bytes: [0xa0] },
    { value: new Uint8Array(), bytes: [0x40] },
    { value: null, bytes: [0xf6] },
    { value: false, bytes: [0xf4] },
    { value: true, bytes: [0xf5] }
  ])('encodes empty or simple value $value', ({ value, bytes }) => {
    expect([...new Uint8Array(encode(value))]).toEqual(bytes);
  });

  it('encodes Unicode text using UTF-8 bytes including surrogate pairs', () => {
    expect([...new Uint8Array(encode('é😀'))]).toEqual([0x66, 0xc3, 0xa9, 0xf0, 0x9f, 0x98, 0x80]);
  });

  it('preserves nested maps and arrays after growing beyond the initial buffer', () => {
    const value = { text: 'é😀'.repeat(100), nested: [[], {}, [0, false, null]] };
    const encoded = encode(value);

    expect(encoded.byteLength).toBeGreaterThan(256);
    expect(decode(encoded)).toEqual(value);
  });
});

//*****************************************************************************************
// decode
//*****************************************************************************************
describe('decode', () => {
  it.each([
    { bytes: [0x17], value: 23 },
    { bytes: [0x18, 0x18], value: 24 },
    { bytes: [0x19, 0x01, 0x00], value: 256 },
    { bytes: [0x38, 0x18], value: -25 },
    { bytes: [0x60], value: '' },
    { bytes: [0x80], value: [] },
    { bytes: [0xa0], value: {} },
    { bytes: [0x40], value: new Uint8Array() }
  ])('decodes fixed CBOR bytes $bytes', ({ bytes, value }) => {
    expect(decode(Uint8Array.from(bytes).buffer)).toEqual(value);
  });

  it('decodes an indefinite-length array', () => {
    expect(decode(Uint8Array.from([0x9f, 0x01, 0x02, 0xff]).buffer)).toEqual([1, 2]);
  });

  it('joins chunks in an indefinite-length text string', () => {
    expect(decode(Uint8Array.from([0x7f, 0x61, 0x61, 0x61, 0x62, 0xff]).buffer)).toBe('ab');
  });

  it('decodes an indefinite-length map', () => {
    expect(decode(Uint8Array.from([0xbf, 0x61, 0x61, 0x01, 0xff]).buffer)).toEqual({ a: 1 });
  });

  it('rejects empty or truncated encoded input', () => {
    expect(() => {
      decode(new ArrayBuffer(0));
    }).toThrow();
    expect(() => {
      decode(Uint8Array.from([0x19, 0x01]).buffer);
    }).toThrow();
  });

  it('rejects trailing bytes after a complete value', () => {
    expect(() => {
      decode(Uint8Array.from([0x00, 0x00]).buffer);
    }).toThrow('Remaining bytes');
  });
});
