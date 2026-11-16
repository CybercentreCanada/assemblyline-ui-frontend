import type { FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
import { loadFeatureFlags, saveFeatureFlags } from 'core/feature-flag/feature-flag.persistence';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('loadFeatureFlags', () => {
  it('loads enabled and disabled flags from the requested key', () => {
    const saved: FeatureFlagStore = {
      flags: [
        { flag: 'enabled', enabled: true },
        { flag: 'disabled', enabled: false }
      ]
    };
    localStorage.setItem('flags', JSON.stringify(saved));
    localStorage.setItem('other', JSON.stringify({ flags: [] }));

    const defaults: FeatureFlagStore = {
      flags: [
        { flag: 'enabled', enabled: false },
        { flag: 'disabled', enabled: true }
      ]
    };

    expect(loadFeatureFlags('flags', defaults)).toEqual(saved);
  });

  it('returns the provided defaults when the key is missing', () => {
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };

    expect(loadFeatureFlags('missing', defaults)).toBe(defaults);
  });

  it('adds defaults when the stored flag list is empty', () => {
    localStorage.setItem('flags', JSON.stringify({ flags: [] }));
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: true }] };

    expect(loadFeatureFlags('flags', defaults)).toEqual(defaults);
  });

  it('adds new flags and removes obsolete flags while preserving saved values', () => {
    const saved: FeatureFlagStore = {
      flags: [
        { flag: 'existing', enabled: true },
        { flag: 'removed', enabled: true }
      ]
    };
    const defaults: FeatureFlagStore = {
      flags: [
        { flag: 'new', enabled: false },
        { flag: 'existing', enabled: false }
      ]
    };
    localStorage.setItem('flags', JSON.stringify(saved));

    expect(loadFeatureFlags('flags', defaults)).toEqual({
      flags: [
        { flag: 'new', enabled: false },
        { flag: 'existing', enabled: true }
      ]
    });
    expect(defaults.flags[1].enabled).toBe(false);
  });

  it('removes all stored flags when no flags are defined', () => {
    localStorage.setItem('flags', JSON.stringify({ flags: [{ flag: 'removed', enabled: true }] }));

    expect(loadFeatureFlags('flags', { flags: [] })).toEqual({ flags: [] });
  });

  it.each([
    '',
    '{invalid',
    'null',
    '[]',
    '{}',
    '{"flags":null}',
    '{"flags":[{"flag":"demo"}]}',
    '{"flags":[{"flag":123,"enabled":true}]}',
    '{"flags":[{"flag":"demo","enabled":"true"}]}'
  ])('returns defaults for malformed or invalid saved data: %s', raw => {
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };
    localStorage.setItem('flags', raw);

    expect(loadFeatureFlags('flags', defaults)).toBe(defaults);
  });

  it('returns defaults when localStorage cannot be read', () => {
    const defaults: FeatureFlagStore = { flags: [] };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(loadFeatureFlags('flags', defaults)).toBe(defaults);
  });
});

describe('saveFeatureFlags', () => {
  it('round-trips the store through the requested key without changing other keys', () => {
    const state: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: true }] };
    localStorage.setItem('other', 'unchanged');

    saveFeatureFlags('flags', state);

    expect(loadFeatureFlags('flags', state)).toEqual(state);
    expect(localStorage.getItem('other')).toBe('unchanged');
  });

  it('overwrites previously stored flags with an empty store', () => {
    localStorage.setItem('flags', JSON.stringify({ flags: [{ flag: 'demo', enabled: true }] }));

    saveFeatureFlags('flags', { flags: [] });

    expect(localStorage.getItem('flags')).toBe('{"flags":[]}');
  });

  it('does not throw when storage cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    expect(() => saveFeatureFlags('flags', { flags: [] })).not.toThrow();
  });
});
