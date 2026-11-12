import { isUserFeatureFlagAdmin } from 'core/feature-flag/feature-flag.guard';
import type { CustomUser } from 'models/api/user';
import { describe, expect, it } from 'vitest';

describe('isUserFeatureFlagAdmin', () => {
  it('allows an administrator', () => {
    expect(isUserFeatureFlagAdmin({ is_admin: true } as CustomUser)).toBe(true);
  });

  it('rejects a non-administrator', () => {
    expect(isUserFeatureFlagAdmin({ is_admin: false } as CustomUser)).toBe(false);
  });

  it.each([null, undefined, {}])('rejects a user without administrator information: %s', user => {
    expect(isUserFeatureFlagAdmin(user as CustomUser)).toBe(false);
  });
});
