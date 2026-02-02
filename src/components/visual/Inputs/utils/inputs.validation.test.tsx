import { CoercersResolver, ValidationResolver } from 'components/visual/Inputs/lib/inputs.validation';
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
    const parser = new ValidationResolver<string>({}).required();
    const result = parser.resolve(tMock, '', '');
    expect(result).toEqual({ status: 'error', message: 'validation.required' });
  });

  it('inRange validator respects min and max', () => {
    const parser = new ValidationResolver<number>({ min: 5, max: 10 }).inRange();
    expect(parser.resolve(tMock, 7, 7)).toEqual({ status: 'default', message: null }); // valid
    expect(parser.resolve(tMock, 3, 3).status).toBe('error'); // too low
    expect(parser.resolve(tMock, 12, 12).status).toBe('error'); // too high
  });

  it('noLeadingTrailingWhitespace warns when string has extra spaces', () => {
    const parser = new ValidationResolver<string>({}).noLeadingTrailingWhitespace();
    expect(parser.resolve(tMock, 'hello', 'hello')).toEqual({ status: 'default', message: null });
    expect(parser.resolve(tMock, ' hello ', ' hello ').status).toBe('warning');
  });

  it('returns default when no validators match', () => {
    const parser = new ValidationResolver<string>({});
    expect(parser.resolve(tMock, 'valid', 'valid')).toEqual({ status: 'default', message: null });
  });
});

describe('CoercersResolver', () => {
  it('trim coercer removes whitespace', () => {
    const parser = new CoercersResolver<string>({}).trim();
    const result = parser.resolve({} as never, '  hello  ', '  hello  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('toLowerCase coercer converts string to lowercase', () => {
    const parser = new CoercersResolver<string>({}).toLowerCase();
    const result = parser.resolve({} as never, 'HeLLo', 'HeLLo');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('required coercer sets ignore to true for empty values', () => {
    const parser = new CoercersResolver<string>({}).required();
    const result = parser.resolve({} as never, '', '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('applies multiple coercers in order', () => {
    const parser = new CoercersResolver<string>({}).trim().toLowerCase();
    const result = parser.resolve({} as never, '  HeLLo  ', '  HeLLo  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('respects ignore flags from coercers', () => {
    const parser = new CoercersResolver<string>({}).required().trim();
    const result = parser.resolve({} as never, '', '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('works with no coercers', () => {
    const parser = new CoercersResolver<string>({});
    const result = parser.resolve({} as never, 'value', 'value');
    expect(result).toEqual({ value: 'value', ignore: false });
  });
});
