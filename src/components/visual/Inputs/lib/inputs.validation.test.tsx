import type { CoercersResolver, ValidationResolver } from 'components/visual/Inputs/lib/inputs.validation';
import { CoercersSchema, ValidationSchema } from 'components/visual/Inputs/lib/inputs.validation';
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
    const schema = new ValidationSchema({}).required();
    const parser = schema as ValidationResolver<string>;
    const result = parser.resolve(tMock, '', '');
    expect(result).toEqual({ status: 'error', message: 'validation.required' });
  });

  it('inRange validator respects min and max', () => {
    const schema = new ValidationSchema({ min: 5, max: 10 }).inRange();
    const parser = schema as ValidationResolver<number>;

    expect(parser.resolve(tMock, 7, 7)).toEqual({ status: 'default', message: null }); // valid
    expect(parser.resolve(tMock, 3, 3).status).toBe('error'); // too low
    expect(parser.resolve(tMock, 12, 12).status).toBe('error'); // too high
  });

  it('noLeadingTrailingWhitespace warns when string has extra spaces', () => {
    const schema = new ValidationSchema({}).noLeadingTrailingWhitespace();
    const parser = schema as ValidationResolver<string>;

    expect(parser.resolve(tMock, 'hello', 'hello')).toEqual({ status: 'default', message: null });
    expect(parser.resolve(tMock, ' hello ', ' hello ').status).toBe('warning');
  });

  it('returns default when no validators match', () => {
    const schema = new ValidationSchema({});
    const parser = schema as ValidationResolver<string>;

    expect(parser.resolve(tMock, 'valid', 'valid')).toEqual({ status: 'default', message: null });
  });
});

describe('CoercersResolver', () => {
  it('trim coercer removes whitespace', () => {
    const schema = new CoercersSchema({}).trim();
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, '  hello  ', '  hello  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('toLowerCase coercer converts string to lowercase', () => {
    const schema = new CoercersSchema({}).toLowerCase();
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, 'HeLLo', 'HeLLo');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('required coercer sets ignore to true for empty values', () => {
    const schema = new CoercersSchema({}).required();
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, '', '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('applies multiple coercers in order', () => {
    const schema = new CoercersSchema({}).trim().toLowerCase();
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, '  HeLLo  ', '  HeLLo  ');
    expect(result).toEqual({ value: 'hello', ignore: false });
  });

  it('respects ignore flags from coercers', () => {
    const schema = new CoercersSchema({}).required().trim();
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, '', '');
    expect(result).toEqual({ value: '', ignore: true });
  });

  it('works with no coercers', () => {
    const schema = new CoercersSchema({});
    const parser = schema as CoercersResolver<string>;
    const result = parser.resolve({} as any, 'value', 'value');
    expect(result).toEqual({ value: 'value', ignore: false });
  });
});
