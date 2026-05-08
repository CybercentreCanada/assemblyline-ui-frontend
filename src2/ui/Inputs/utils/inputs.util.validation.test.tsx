import { CoercersResolver, ValidationResolver } from 'components/visual/Inputs/utils/inputs.util.validation';
import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

const tMock = ((key: unknown): unknown => {
  if (typeof key === 'string') return key;
  if (Array.isArray(key)) {
    const first = (key as unknown[])[0];
    return typeof first === 'string' ? first : '';
  }
  return '';
}) as unknown as TFunction;

describe('ValidationResolver', () => {
  it('required validator returns error for empty values', () => {
    const parser = new ValidationResolver<string>({}, tMock).required();
    const result = parser.resolve('');
    expect(result).toEqual({ status: 'error', message: 'validation.required' });
  });

  it('inRange validator respects min and max', () => {
    const parser = new ValidationResolver<number>({ min: 5, max: 10 }, tMock).inRange();
    expect(parser.resolve(7)).toEqual({ status: 'default', message: null }); // valid
    expect(parser.resolve(3).status).toBe('error'); // too low
    expect(parser.resolve(12).status).toBe('error'); // too high
  });

  it('isInteger warns on non-integer values', () => {
    const parser = new ValidationResolver<number>({}, tMock).isInteger();
    expect(parser.resolve(5)).toEqual({ status: 'default', message: null }); // integer
    expect(parser.resolve(5.5)).toEqual({ status: 'warning', message: 'validation.integer' }); // float
  });

  it('noLeadingTrailingWhitespace warns when string has extra spaces', () => {
    const parser = new ValidationResolver<string>({}, tMock).noLeadingTrailingWhitespace();
    expect(parser.resolve('hello')).toEqual({ status: 'default', message: null });
    expect(parser.resolve(' hello ').status).toBe('warning');
  });

  it('returns default when no validators match', () => {
    const parser = new ValidationResolver<string>({}, tMock);
    expect(parser.resolve('valid')).toEqual({ status: 'default', message: null });
  });
});

describe('CoercersResolver', () => {
  it('trim coercer removes whitespace', () => {
    const parser = new CoercersResolver<string>({}).trim();
    const result = parser.resolve({} as never, '  hello  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('toLowerCase coercer converts string to lowercase', () => {
    const parser = new CoercersResolver<string>({}).toLowerCase();
    const result = parser.resolve({} as never, 'HeLLo');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('toUpperCase coercer converts string to uppercase', () => {
    const parser = new CoercersResolver<string>({}).toUpperCase();
    const result = parser.resolve({} as never, 'heLLo');
    expect(result).toEqual({ value: 'HELLO', ignore: false });
  });

  it('required coercer sets ignore to true for empty values', () => {
    const parser = new CoercersResolver<string>({}).required();
    const result = parser.resolve({} as never, '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('applies multiple coercers in order', () => {
    const parser = new CoercersResolver<string>({}).trim().toLowerCase();
    const result = parser.resolve({} as never, '  HeLLo  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('respects ignore flags from coercers', () => {
    const parser = new CoercersResolver<string>({}).required().trim();
    const result = parser.resolve({} as never, '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('works with no coercers', () => {
    const parser = new CoercersResolver<string>({});
    const result = parser.resolve({} as never, 'value');
    expect(result).toEqual({ value: 'value', ignore: false });
  });

  it('inRange coercer clamps value within min and max', () => {
    const parser = new CoercersResolver<number>({ min: 5, max: 10 }).inRange();
    expect(parser.resolve({} as never, 3)).toEqual({ value: 5, ignore: false }); // clamped to min
    expect(parser.resolve({} as never, 12)).toEqual({ value: 10, ignore: false }); // clamped to max
    expect(parser.resolve({} as never, 7)).toEqual({ value: 7, ignore: false }); // unchanged
  });

  it('round, floor, ceil coercers work correctly', () => {
    const roundParser = new CoercersResolver<number>({}).round();
    expect(roundParser.resolve({} as never, 5.4)).toEqual({ value: 5, ignore: false });
    expect(roundParser.resolve({} as never, 5.6)).toEqual({ value: 6, ignore: false });

    const floorParser = new CoercersResolver<number>({}).floor();
    expect(floorParser.resolve({} as never, 5.9)).toEqual({ value: 5, ignore: false });

    const ceilParser = new CoercersResolver<number>({}).ceil();
    expect(ceilParser.resolve({} as never, 5.1)).toEqual({ value: 6, ignore: false });
  });

  it('roundTo rounds numbers to N decimal places', () => {
    const parser = new CoercersResolver<number>({}).roundTo(2);
    expect(parser.resolve({} as never, 5.6789)).toEqual({ value: 5.68, ignore: false });
    expect(parser.resolve({} as never, 1.2345)).toEqual({ value: 1.23, ignore: false });
  });
});
