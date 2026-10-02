import { evaluateMediaQuery, parseMediaQuery } from 'core/router';
import { describe, expect, it } from 'vitest';

describe('parseMediaQuery', () => {
  it('parses a min-width condition', () => {
    expect(parseMediaQuery('(min-width:600px)')).toEqual([{ minWidth: 600 }]);
  });

  it('parses compound min/max-width conditions', () => {
    expect(parseMediaQuery('(min-width:600px) and (max-width:959px)')).toEqual([{ minWidth: 600 }, { maxWidth: 959 }]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(parseMediaQuery('screen')).toEqual([]);
  });
});

describe('evaluateMediaQuery', () => {
  it('returns true when all conditions pass', () => {
    expect(evaluateMediaQuery([{ minWidth: 600 }, { maxWidth: 959 }], 700)).toBe(true);
  });

  it('returns false when a condition fails', () => {
    expect(evaluateMediaQuery([{ minWidth: 600 }], 400)).toBe(false);
  });

  it('returns true for an empty conditions array', () => {
    expect(evaluateMediaQuery([], 400)).toBe(true);
  });
});
