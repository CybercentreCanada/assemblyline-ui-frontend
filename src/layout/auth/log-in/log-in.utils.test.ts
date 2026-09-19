import {
  USERNAME_MIN_LENGTH,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateUsername
} from 'layout/auth/log-in/log-in.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// validateUsername
//*****************************************************************************************
describe('validateUsername', () => {
  it('accepts a lowercase username', () => {
    expect(validateUsername('someuser')).toBeUndefined();
  });

  it('accepts a hyphenated username', () => {
    expect(validateUsername('some-user')).toBeUndefined();
  });

  it('rejects an empty username', () => {
    expect(validateUsername('')).toBe('validate.username.required');
  });

  it('rejects a null username', () => {
    expect(validateUsername(null)).toBe('validate.username.required');
  });

  it('rejects a username shorter than the minimum length', () => {
    expect(validateUsername('a'.repeat(USERNAME_MIN_LENGTH - 1))).toBe('validate.username.too_short');
  });

  it('accepts a username exactly at the minimum length', () => {
    expect(validateUsername('a'.repeat(USERNAME_MIN_LENGTH))).toBeUndefined();
  });

  it('rejects uppercase characters', () => {
    expect(validateUsername('SomeUser')).toBe('validate.username.characters');
  });

  it('rejects digits and symbols', () => {
    expect(validateUsername('user_1')).toBe('validate.username.characters');
  });
});

//*****************************************************************************************
// validatePassword
//*****************************************************************************************
describe('validatePassword', () => {
  it('accepts a non-empty password', () => {
    expect(validatePassword('hunter2')).toBeUndefined();
  });

  it('rejects an empty password', () => {
    expect(validatePassword('')).toBe('validate.password.required');
  });

  it('rejects a null password', () => {
    expect(validatePassword(null)).toBe('validate.password.required');
  });
});

//*****************************************************************************************
// validatePasswordConfirm
//*****************************************************************************************
describe('validatePasswordConfirm', () => {
  it('accepts a matching confirmation', () => {
    expect(validatePasswordConfirm('hunter2', 'hunter2')).toBeUndefined();
  });

  it('rejects an empty confirmation', () => {
    expect(validatePasswordConfirm('hunter2', '')).toBe('validate.password.required');
  });

  it('rejects a mismatching confirmation', () => {
    expect(validatePasswordConfirm('hunter2', 'hunter3')).toBe('validate.password_confirm.mismatch');
  });

  it('rejects a confirmation when the original password is missing', () => {
    expect(validatePasswordConfirm(null, 'hunter2')).toBe('validate.password_confirm.mismatch');
  });
});

//*****************************************************************************************
// validateEmail
//*****************************************************************************************
describe('validateEmail', () => {
  it('accepts a well-formed address', () => {
    expect(validateEmail('user@example.com')).toBeUndefined();
  });

  it('accepts an address with surrounding whitespace and uppercase', () => {
    expect(validateEmail('  User@Example.COM ')).toBeUndefined();
  });

  it('rejects an empty address', () => {
    expect(validateEmail('')).toBe('validate.email.required');
  });

  it('rejects a null address', () => {
    expect(validateEmail(null)).toBe('validate.email.required');
  });

  it('rejects a whitespace-only address', () => {
    expect(validateEmail('   ')).toBe('validate.email.required');
  });

  it('rejects an address without a domain', () => {
    expect(validateEmail('user@')).toBe('validate.email.invalid');
  });

  it('rejects an address without a top-level domain', () => {
    expect(validateEmail('user@example')).toBe('validate.email.invalid');
  });
});
