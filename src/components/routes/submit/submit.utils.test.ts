import { MOCK_CONFIGURATION } from 'components/mocks/configuration';
import { MOCK_SETTINGS } from 'components/mocks/setting';
import type { UserSettings } from 'components/models/base/user_settings';
import { initializeSettings } from 'components/routes/settings/settings.utils';
import type { SubmitStore } from 'components/routes/submit/submit.form';
import {
  calculateFileHash,
  getDefaultExternalSources,
  getHashQuery,
  getPreferredSubmissionProfile,
  isSubmissionValid,
  isUsingExternalServices,
  isValidJSON,
  isValidMetadata,
  parseSubmitProfile
} from 'components/routes/submit/submit.utils';
import generateUUID from 'helpers/uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ------------------------ Helpers -----------------------------------------
const clone = <T>(x: T) => JSON.parse(JSON.stringify(x)) as T;

const MOCK_SUBMIT_STORE: SubmitStore = {
  state: {
    adjust: false,
    customize: false,
    disabled: false,
    phase: 'loading',
    profile: null,
    tab: 'file',
    progress: 0,
    uuid: generateUUID()
  },
  file: {
    ...new File(['abc'], 'file.txt'),
    relativePath: 'file.txt',
    fileName: 'file.txt',
    path: '/mock/path/file.txt',
    hash: '01020304'
  },
  hash: { type: null, value: '' },
  settings: initializeSettings(MOCK_SETTINGS),
  metadata: { data: {}, edit: '' },
  autoURLServiceSelection: { open: false, prev: [] }
};

// ------------------------ getPreferredSubmissionProfile -------------------
describe('getPreferredSubmissionProfile', () => {
  it('returns preferred profile if exists', () => {
    expect(getPreferredSubmissionProfile(MOCK_SETTINGS)).toBe('default');
  });

  it('falls back to first profile if preferred is missing', () => {
    const s = clone(MOCK_SETTINGS);
    s.preferred_submission_profile = 'missing';
    expect(getPreferredSubmissionProfile(s)).toBe(Object.keys(s.submission_profiles)[0]);
  });

  it('returns null if no profiles exist', () => {
    const s = { preferred_submission_profile: 'x', submission_profiles: {} } as UserSettings;
    expect(getPreferredSubmissionProfile(s)).toBeNull();
  });
});

// ------------------------ getDefaultExternalSources -----------------------
describe('getDefaultExternalSources', () => {
  it('merges, deduplicates, and sorts sources', () => {
    const result = getDefaultExternalSources(MOCK_SETTINGS, MOCK_CONFIGURATION);
    expect(result.value).toEqual(['Assemblyline']);
  });
});

// ------------------------ isValidJSON -------------------------------------
describe('isValidJSON', () => {
  it.each([
    ['{"a":1}', true],
    ['{bad', false],
    ['', false],
    ['null', true],
    ['[]', true]
  ])('validates JSON "%s"', (input, expected) => {
    expect(isValidJSON(input)).toBe(expected);
  });
});

// ------------------------ isValidMetadata ---------------------------------
describe('isValidMetadata', () => {
  it('returns null for valid non-reserved keys', () => {
    const input = JSON.stringify({ custom: 123 });
    expect(isValidMetadata(input, MOCK_CONFIGURATION)).toBeNull();
  });

  it('rejects reserved keys', () => {
    const input = JSON.stringify({ url: 'x' });
    const msg = isValidMetadata(input, MOCK_CONFIGURATION);
    expect(JSON.stringify(msg)).toMatch(null);
  });

  it('returns error for invalid JSON', () => {
    expect(isValidMetadata('{bad', MOCK_CONFIGURATION)).toMatch(/SyntaxError/i);
  });
});

// ------------------------ isSubmissionValid -------------------------------
describe('isSubmissionValid', () => {
  let store: SubmitStore;

  beforeEach(() => {
    store = clone(MOCK_SUBMIT_STORE);
  });

  it('returns false if file missing', () => {
    store.file = null;
    expect(isSubmissionValid(store, MOCK_CONFIGURATION)).toBe(false);
  });

  it('returns false if TTL exceeds max', () => {
    store.settings.ttl.value = 9999;
    expect(isSubmissionValid(store, MOCK_CONFIGURATION)).toBe(false);
  });

  it('returns false if integer metadata invalid', () => {
    store.metadata.data = { age: 500 };
    expect(isSubmissionValid(store, MOCK_CONFIGURATION)).toBe(false);
  });

  it('returns false if regex metadata invalid', () => {
    store.metadata.data = { tag: 'wrong' };
    expect(isSubmissionValid(store, MOCK_CONFIGURATION)).toBe(false);
  });
});

// ------------------------ calculateFileHash -------------------------------
describe('calculateFileHash', () => {
  beforeEach(() => {
    // Mock subtle.digest for deterministic results
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer)
      }
    });
  });

  it('computes deterministic hash', async () => {
    const file = new File(['test'], 'file.txt');
    const hash = await calculateFileHash(file);
    expect(hash).toBe('01020304');
  });
});

// ------------------------ getHashQuery -----------------------------------
describe('getHashQuery', () => {
  it('formats "file" hashes as sha256', () => {
    expect(getHashQuery('file', 'abc')).toBe('sha256:"abc"');
  });

  it('formats other hash types correctly', () => {
    expect(getHashQuery('md5', 'abc')).toBe('md5:"abc"');
  });
});

// ------------------------ isUsingExternalServices ------------------------
describe('isUsingExternalServices', () => {
  it('returns false if no services match config', () => {
    const profile = initializeSettings(MOCK_SETTINGS);
    expect(isUsingExternalServices(profile, MOCK_CONFIGURATION)).toBe(false);
  });

  it('returns true if any service matches config', () => {
    const profile = initializeSettings(MOCK_SETTINGS);
    // artificially select a matching service
    profile.services[1].services[1].selected = true;
    expect(isUsingExternalServices(profile, MOCK_CONFIGURATION)).toBe(true);
  });
});

// ------------------------ parseSubmitProfile -----------------------------
describe('parseSubmitProfile', () => {
  it('returns null for empty input', () => {
    expect(parseSubmitProfile(null)).toBeNull();
  });

  it('serializes and normalizes profile fields', () => {
    const profile = initializeSettings({ ...MOCK_SETTINGS, description: 'desc' });
    const out = parseSubmitProfile(profile);

    expect(out.malicious).toBe(false);
    expect(out.preferred_submission_profile).toBe('default');
    expect(out.initial_data).toBe('{\n  "passwords": []\n}');
  });
});
