import { formatAppDebugTimestamp, serializeAppDebugState } from 'layout/debug/debug.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// serializeAppDebugState
//*****************************************************************************************
describe('serializeAppDebugState', () => {
  it('serializes set values as arrays', () => {
    expect(serializeAppDebugState({ keys: new Set(['tag__network', 'file__hash']) })).toBe(
      '{\n  "keys": [\n    "tag__network",\n    "file__hash"\n  ]\n}'
    );
  });

  it('serializes an empty set as an empty array', () => {
    expect(serializeAppDebugState({ keys: new Set() })).toBe('{\n  "keys": []\n}');
  });

  it('preserves non-set values alongside set values', () => {
    expect(serializeAppDebugState({ count: 1, keys: new Set(['tag__network']) })).toBe(
      '{\n  "count": 1,\n  "keys": [\n    "tag__network"\n  ]\n}'
    );
  });
});

//*****************************************************************************************
// formatAppDebugTimestamp
//*****************************************************************************************
describe('formatAppDebugTimestamp', () => {
  it('includes zero-padded milliseconds', () => {
    expect(formatAppDebugTimestamp(5)).toMatch(/\(005ms\)$/);
  });

  it('includes three-digit milliseconds', () => {
    expect(formatAppDebugTimestamp(123)).toMatch(/\(123ms\)$/);
  });

  it('includes a localized time', () => {
    expect(formatAppDebugTimestamp(0)).toMatch(/^.+ \(000ms\)$/);
  });
});
