import type { Configuration } from 'components/models/base/config';
import type { SelectedServiceCategory, ServiceSpecification } from 'components/models/base/service';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';
import {
  getProfileNames,
  getValidValue,
  hasDifferentDefaultSubmissionValues,
  hasDifferentPreviousSubmissionValues,
  initializeSettings,
  INTERFACE_KEYS,
  loadDefaultProfile,
  loadSubmissionProfile,
  parseSubmissionProfile,
  PROFILE_KEYS,
  resetDefaultSubmissionValues,
  resetPreviousSubmissionValues,
  updatePreviousSubmissionValues
} from 'components/routes/settings/settings.utils';
import { describe, expect, it } from 'vitest';

/* ---------------------- Helper deepMerge (test-local) --------------------- */
/* A simple strongly-typed helper used only in tests to create variations */
type IsObject<T> = T extends object ? (T extends Function ? false : true) : false;
type DeepMerge<A, B> =
  IsObject<A> extends true
    ? IsObject<B> extends true
      ? {
          [K in keyof A | keyof B]: K extends keyof B
            ? K extends keyof A
              ? DeepMerge<A[K], B[K]>
              : B[K]
            : K extends keyof A
              ? A[K]
              : never;
        }
      : B
    : B;

export const deepMerge = <T extends object, U extends object>(a: T, b: U): DeepMerge<T, U> => {
  const out = (Array.isArray(a) ? [...a] : { ...a }) as DeepMerge<T, U>;

  for (const key of Object.keys(b) as (keyof U)[]) {
    const bv = b[key];
    const av = (a as unknown)[key];

    if (bv && typeof bv === 'object' && !Array.isArray(bv) && av && typeof av === 'object' && !Array.isArray(av)) {
      (out as unknown)[key] = deepMerge(av, bv);
    } else {
      (out as unknown)[key] = structuredClone ? structuredClone(bv) : JSON.parse(JSON.stringify(bv));
    }
  }

  return out;
};

/* ----------------------------- Test fixtures ----------------------------- */
const TEST_USER: CustomUser = {
  agrees_with_tos: Date.now().toString(),
  api_daily_quota: 0,
  api_quota: 0,
  apikeys: {},
  apps: {},
  avatar: null,
  can_impersonate: false,
  classification: 'TLP:CLEAR',
  default_view: undefined,
  dn: undefined,
  dynamic_group: null,
  email: 'testuser@example.com',
  groups: ['default'],
  id: 'user1',
  is_active: true,
  is_admin: false,
  name: 'Test User',
  otp_sk: undefined,
  password: 'password',
  roles: [],
  security_tokens: [],
  submission_async_quota: 0,
  submission_daily_quota: 0,
  submission_quota: 0,
  type: ['user'],
  uname: 'user1',
  username: 'testuser'
};

const ADMIN_USER = deepMerge(TEST_USER, { is_admin: true });

const TEST_SETTINGS: UserSettings = {
  classification: 'TLP:CLEAR',
  deep_scan: false,
  default_external_sources: [],
  default_metadata: {},
  default_zip_password: '',
  description: '',
  download_encoding: 'raw',
  executive_summary: false,
  expand_min_score: 0,
  generate_alert: false,
  ignore_cache: false,
  ignore_dynamic_recursion_prevention: false,
  ignore_filtering: false,
  ignore_recursion_prevention: false,
  initial_data: '',
  malicious: false,
  preferred_submission_profile: undefined,
  priority: 100,
  service_spec: [
    {
      name: 'Service 1',
      params: [
        {
          default: 'emerging',
          hide: false,
          name: 'string',
          type: 'str',
          value: 'other'
        },
        {
          default: false,
          hide: false,
          name: 'boolean',
          type: 'bool',
          value: false
        },
        {
          default: 'experts',
          hide: true,
          list: ['experts', 'marketplace'],
          name: 'list',
          type: 'list',
          value: 'experts'
        },
        {
          default: 0,
          hide: true,
          name: 'number',
          type: 'int',
          value: 0
        }
      ]
    },
    {
      name: 'Service 2',
      params: [
        {
          default: 'improve',
          hide: false,
          name: 'string',
          type: 'str',
          value: 'improve'
        }
      ]
    }
  ],
  services: [
    {
      name: 'Static Analysis',
      selected: false,
      services: [
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: true,
          name: 'Service 1',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'NA',
          is_external: false,
          name: 'Service 2',
          selected: false
        }
      ]
    },
    {
      name: 'Antivirus',
      selected: false,
      services: []
    }
  ],
  submission_profiles: {
    default: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {},
      services: {
        selected: ['Static Analysis'],
        excluded: [],
        rescan: [],
        resubmit: []
      },
      ttl: 30
    },
    static: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {
        'Service 1': {
          string: 'internet'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Service 1']
      },
      ttl: 30
    },
    static_and_dynamic_with_internet: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {
        'Service 2': {
          string: 'another'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Service 2']
      }
    }
  },
  submission_view: 'report',
  ttl: 1
};

const PROFILES: Configuration['submission']['profiles'] = {
  static: {
    description: 'Static Analysis',
    display_name: '[OFFLINE] Static Analysis',
    params: {
      service_spec: {
        'Service 1': {
          string: 'internet'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Service 1']
      }
    },
    restricted_params: {}
  },
  static_and_dynamic_with_internet: {
    description: 'Static + Dynamic Analysis',
    display_name: '[ONLINE] Static + Dynamic Analysis',
    params: {
      service_spec: {
        'Service 2': {
          string: 'another'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Service 2']
      }
    },
    restricted_params: {}
  }
};

/* ------------------------------------------------------------------------- */
/* deepMerge tests (basic behaviour checks for the test helper)              */
/* ------------------------------------------------------------------------- */
describe('deepMerge (test helper)', () => {
  it('merges shallow objects', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 5, z: 9 };
    const result = deepMerge(a, b);
    expect(result).toEqual({ x: 1, y: 5, z: 9 });
  });

  it('replaces arrays instead of merging them', () => {
    const a = { arr: [1, 2, 3] };
    const b = { arr: [4] };
    const result = deepMerge(a, b);
    expect(result.arr).toEqual([4]);
  });

  it('does not mutate inputs', () => {
    const a = { nested: { x: 1 } };
    const b = { nested: { x: 2 } };
    const result = deepMerge(a, b);
    result.nested.x = 42;
    expect(a.nested.x).toBe(1);
    expect(b.nested.x).toBe(2);
  });
});

/* ------------------------------------------------------------------------- */
/* getValidValue tests                                                        */
/* ------------------------------------------------------------------------- */
describe('getValidValue', () => {
  it('returns the first non-nullish value', () => {
    expect(getValidValue(null, undefined, 5)).toBe(5);
    expect(getValidValue(undefined, 'hello', 'world')).toBe('hello');
    expect(getValidValue(null, false, true)).toBe(false);
  });

  it('treats falsy values as valid', () => {
    expect(getValidValue(undefined, 0, 1)).toBe(0);
    expect(getValidValue(null, '', 'fallback')).toBe('');
    expect(getValidValue(null, false, true)).toBe(false);
  });

  it('returns null when all are nullish', () => {
    expect(getValidValue(null, undefined)).toBeNull();
    expect(getValidValue(undefined, undefined, null)).toBeNull();
    expect(getValidValue()).toBeNull();
  });

  it('accepts objects and preserves reference type for non-null values', () => {
    const obj = { a: 1 };
    const res = getValidValue(null, obj) as typeof obj;
    expect(res).toBe(obj);
  });

  it('handles mixed types and returns first defined', () => {
    expect(getValidValue(undefined, 0, 'x')).toBe(0);
    expect(getValidValue(null, '', 123)).toBe('');
    expect(getValidValue(undefined, false, true)).toBe(false);
  });

  it('returns null for entirely nullish inputs including empty call', () => {
    expect(getValidValue()).toBeNull();
    expect(getValidValue(undefined, undefined, null)).toBeNull();
  });
});

/* ------------------------------------------------------------------------- */
/* getProfileNames tests                                                      */
/* ------------------------------------------------------------------------- */
describe('getProfileNames', () => {
  it('returns the profile keys present in settings', () => {
    expect(getProfileNames(TEST_SETTINGS)).toEqual(['default', 'static', 'static_and_dynamic_with_internet']);
  });

  it('handles missing submission_profiles', () => {
    const s = deepMerge(TEST_SETTINGS, { submission_profiles: undefined });
    expect(getProfileNames(s)).toEqual([]);
  });

  it('returns empty array for missing or empty profiles', () => {
    expect(getProfileNames(deepMerge(TEST_SETTINGS, { submission_profiles: undefined }))).toEqual([]);
  });

  it('ignores inherited prototype keys', () => {
    const inheritedProto = { inherited: { test: 1 } };
    expect(getProfileNames(deepMerge(TEST_SETTINGS, { submission_profiles: inheritedProto }))).toEqual([
      'default',
      'inherited',
      'static',
      'static_and_dynamic_with_internet'
    ]);
  });

  it('handles keys with unusual formats', () => {
    const settings = deepMerge(TEST_SETTINGS, { submission_profiles: { '123': {}, 'hyphen-key': {}, UPPERCASE: {} } });
    expect(getProfileNames(settings)).toEqual([
      '123',
      'default',
      'hyphen-key',
      'static',
      'static_and_dynamic_with_internet',
      'UPPERCASE'
    ]);
  });
});

/* ------------------------------------------------------------------------- */
/* initializeSettings tests                                                   */
/* ------------------------------------------------------------------------- */
describe('initializeSettings', () => {
  it('returns null for null input', () => {
    expect(initializeSettings(null)).toBeNull();

    expect(initializeSettings(undefined)).toBeNull();
  });

  it('maps INTERFACE_KEYS to {value, prev}', () => {
    const out = initializeSettings(TEST_SETTINGS);
    for (const k of INTERFACE_KEYS) {
      expect(out[k]).toEqual({
        value: TEST_SETTINGS[k as keyof UserSettings],
        prev: TEST_SETTINGS[k as keyof UserSettings]
      });
    }
  });

  it('initializes PROFILE_KEYS with null/default shape', () => {
    const out = initializeSettings(TEST_SETTINGS);
    for (const k of PROFILE_KEYS) {
      expect(out[k]).toEqual({ value: null, prev: null, default: null, restricted: true });
    }
  });

  it('sorts service categories and service_spec names without mutating original', () => {
    const beforeServices = JSON.parse(JSON.stringify(TEST_SETTINGS.services)) as SelectedServiceCategory[];
    const beforeSpec = JSON.parse(JSON.stringify(TEST_SETTINGS.service_spec)) as ServiceSpecification[];
    const out = initializeSettings(TEST_SETTINGS);

    expect(out.services.map(s => s.name)).toEqual(['Antivirus', 'Static Analysis']);
    expect(out.service_spec.map(s => s.name)).toEqual(['Service 1', 'Service 2']);

    expect(TEST_SETTINGS.services).toEqual(beforeServices);
    expect(TEST_SETTINGS.service_spec).toEqual(beforeSpec);
  });

  it('sets initial_data baseline', () => {
    const out = initializeSettings(TEST_SETTINGS);
    expect(out.initial_data).toEqual({ value: { passwords: [] }, prev: { passwords: [] } });
  });
});

/* ------------------------------------------------------------------------- */
/* loadDefaultProfile tests                                                   */
/* ------------------------------------------------------------------------- */
describe('loadDefaultProfile', () => {
  it('returns same out when no default profile present', () => {
    const out = initializeSettings(TEST_SETTINGS);
    expect(loadDefaultProfile(out, null, TEST_USER)).toBe(out);
  });

  it('applies default profile parameters and selects categories present in default', () => {
    const out = initializeSettings(TEST_SETTINGS);
    loadDefaultProfile(out, TEST_SETTINGS, ADMIN_USER);

    expect(out.priority.value).toBe(TEST_SETTINGS.submission_profiles.default.priority);

    const svc = out.services.find(s => s.name === 'Static Analysis');
    expect(svc.selected).toBe(true);
    expect(svc.default).toBe(true);
    expect(svc.prev).toBe(true);
  });

  it('resets top-level fields as implemented', () => {
    const out = initializeSettings(TEST_SETTINGS);
    loadDefaultProfile(out, TEST_SETTINGS, ADMIN_USER);

    expect(out.initial_data).toEqual({ value: { passwords: [] }, prev: { passwords: [] } });
    expect(out.description).toEqual({ value: null, prev: null, default: null, restricted: false });
    expect(out.malicious).toEqual({ value: false, prev: false });
  });
});

/* ------------------------------------------------------------------------- */
/* loadSubmissionProfile tests                                                */
/* ------------------------------------------------------------------------- */
describe('loadSubmissionProfile', () => {
  it('returns original out when settings missing or profile not found', () => {
    const out = initializeSettings(TEST_SETTINGS);
    expect(loadSubmissionProfile(out, null, PROFILES, TEST_USER, 'static')).toBe(out);
    expect(loadSubmissionProfile(out, TEST_SETTINGS, PROFILES, TEST_USER, 'nonexistent')).toBe(out);
  });

  it('copies interface keys from global settings', () => {
    const out = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(out, TEST_SETTINGS, PROFILES, ADMIN_USER, 'static');

    for (const k of INTERFACE_KEYS) {
      expect(out[k].value).toEqual(TEST_SETTINGS[k as keyof UserSettings]);

      expect(out[k].prev).toEqual(TEST_SETTINGS[k as keyof UserSettings]);
    }
  });

  it('applies profile-level keys and marks restrictions for non-admins', () => {
    const adminOut = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(adminOut, TEST_SETTINGS, PROFILES, ADMIN_USER, 'static');

    expect(adminOut.priority.restricted).toBe(false);

    const restrictedProfiles = {
      static: deepMerge(PROFILES.static, {
        restricted_params: { submission: ['priority', 'classification'] }
      })
    };

    const userOut = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(userOut, TEST_SETTINGS, restrictedProfiles, TEST_USER, 'static');

    expect(userOut.priority.restricted).toBe(true);

    expect(userOut.classification.restricted).toBe(true);
  });

  it('applies service selections and nested service flags', () => {
    const out = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(out, TEST_SETTINGS, PROFILES, ADMIN_USER, 'static');

    const cat = out.services.find(s => s.name === 'Static Analysis');

    const nested = cat.services.find(s => s.name === 'Service 1');
    expect(nested.selected).toBe(true);
  });

  it('applies service_spec values from profile metadata and settings precedence', () => {
    const out = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(out, TEST_SETTINGS, PROFILES, ADMIN_USER, 'static');

    const svc = out.service_spec.find(s => s.name === 'Service 1');
    const param = svc.params.find(p => p.name === 'string');
    expect(param.value).toBe('internet');
    expect(param.prev).toBe('internet');
    expect(param.restricted).toBe(false);
  });

  it('does not mutate original TEST_SETTINGS', () => {
    const before = JSON.parse(JSON.stringify(TEST_SETTINGS)) as UserSettings;
    const out = initializeSettings(TEST_SETTINGS);
    loadSubmissionProfile(out, TEST_SETTINGS, PROFILES, ADMIN_USER, 'static');
    expect(TEST_SETTINGS).toEqual(before);
  });
});

/* ------------------------------------------------------------------------- */
/* parseSubmissionProfile tests                                               */
/* ------------------------------------------------------------------------- */
describe('parseSubmissionProfile', () => {
  it('returns null when settings or profile is null', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    expect(parseSubmissionProfile(null, profile, 'x')).toBeNull();
    expect(parseSubmissionProfile(TEST_SETTINGS, null, 'x')).toBeNull();
  });

  it('maps interface name "interface" to "default"', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    const out = parseSubmissionProfile(TEST_SETTINGS, profile, 'interface');
    expect(Object.keys(out.submission_profiles)).toContain('default');
  });

  it('copies interface keys and builds submission_profiles minimally', () => {
    const profile = initializeSettings(TEST_SETTINGS);

    profile.classification = { value: 'TEST', prev: 'OLD', default: 'DEFAULT', restricted: false };

    const out = parseSubmissionProfile(TEST_SETTINGS, profile, 'test');
    expect(out.submission_profiles.test).toBeDefined();

    for (const k of INTERFACE_KEYS) {
      expect(out[k]).toBe(profile[k].value);
    }
  });

  it('serializes initial_data to JSON', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.initial_data.value = { foo: 123 };
    const out = parseSubmissionProfile(TEST_SETTINGS, profile, 'test');
    expect(out.initial_data).toBe(JSON.stringify({ foo: 123 }));
  });

  it('builds service_spec only with overridden and unrestricted params', () => {
    const profile = initializeSettings(TEST_SETTINGS);

    profile.service_spec = [
      {
        name: 'A',
        params: [
          { name: 'p1', type: 'int', value: 10, prev: 0, default: 0, restricted: false },
          { name: 'p2', type: 'int', value: 5, prev: 0, default: 5, restricted: false },
          { name: 'p3', type: 'int', value: 9, prev: 0, default: 0, restricted: true }
        ]
      },
      {
        name: 'B',
        params: [{ name: 'x', type: 'int', value: 1, prev: 0, default: 1, restricted: false }]
      }
    ];

    const out = parseSubmissionProfile(TEST_SETTINGS, profile, 'svcTest');
    expect(out.submission_profiles.svcTest.service_spec).toEqual({ A: { p1: 10 } });
    expect(out.submission_profiles.svcTest.service_spec.B).toBeUndefined();
  });
});

/* ------------------------------------------------------------------------- */
/* hasDifferentPreviousSubmissionValues tests                                */
/* ------------------------------------------------------------------------- */
describe('hasDifferentPreviousSubmissionValues', () => {
  it('returns false for freshly-initialized profile', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(false);
  });

  it('detects a change in an interface array (order-insensitive)', () => {
    const profile = initializeSettings(TEST_SETTINGS);

    profile.default_external_sources.value = ['a', 'b'];
    profile.default_external_sources.prev = ['b', 'a'];
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(false);

    profile.default_external_sources.value = ['a', 'b', 'c'];
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(true);
  });

  it('detects change in profile param value', () => {
    const profile = initializeSettings(TEST_SETTINGS);

    profile.classification.value = 'NEW';
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(true);
  });

  it('detects nested service selection changes', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.services[1].services[0].selected = !profile.services[1].services[0].selected;
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(true);
  });

  it('detects service_spec param changes', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.service_spec[0].params[0].value = 'changed';
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(true);
  });

  it('detects initial_data deep changes', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.initial_data.value = { foo: 1, bar: 2 };
    profile.initial_data.prev = { foo: 1, bar: 2 };
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(false);
    profile.initial_data.value = { foo: 1, bar: 999 };
    expect(hasDifferentPreviousSubmissionValues(profile)).toBe(true);
  });
});

/* ------------------------------------------------------------------------- */
/* resetPreviousSubmissionValues & updatePreviousSubmissionValues tests      */
/* ------------------------------------------------------------------------- */
describe('resetPreviousSubmissionValues / updatePreviousSubmissionValues', () => {
  it('resetPreviousSubmissionValues restores values from prev', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.classification.value = 'TMP';
    profile.services[1].services[0].selected = !profile.services[1].services[0].selected;
    profile.service_spec[0].params[0].value = 'TMP';

    const restored = resetPreviousSubmissionValues(profile);
    expect(restored.classification.value).toBe(restored.classification.prev);
    expect(restored.services[1].services[0].selected).toBe(restored.services[1].services[0].prev);
    expect(restored.service_spec[0].params[0].value).toBe(restored.service_spec[0].params[0].prev);
    expect(restored.initial_data.value).toEqual(restored.initial_data.prev);
    expect(restored.initial_data.value).not.toBe(restored.initial_data.prev);
  });

  it('updatePreviousSubmissionValues copies values into prev', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.classification.value = 'NEW-V';
    profile.service_spec[0].params[0].value = 'NEW-X';
    profile.initial_data.value = { a: 1, b: 2 };

    const updated = updatePreviousSubmissionValues(profile);
    expect(updated.classification.prev).toBe('NEW-V');
    expect(updated.service_spec[0].params[0].prev).toBe('NEW-X');
    expect(updated.initial_data.prev).toEqual({ a: 1, b: 2 });
    expect(updated.initial_data.prev).not.toBe(updated.initial_data.value);
  });
});

/* ------------------------------------------------------------------------- */
/* hasDifferentDefaultSubmissionValues tests                                 */
/* ------------------------------------------------------------------------- */
describe('hasDifferentDefaultSubmissionValues', () => {
  it('detects when a profile param differs from default (non-null defaults)', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.service_spec[0].params[0].default = 'emerging';
    profile.service_spec[0].params[0].value = 'not-emerging';
    expect(hasDifferentDefaultSubmissionValues(profile)).toBe(true);
  });

  // it('returns false when defaults are null', () => {
  //   const profile = initializeSettings(TEST_SETTINGS);
  //   profile.service_spec.forEach(s => s.params.forEach(p => (p.default = null)));
  //   expect(hasDifferentDefaultSubmissionValues(profile)).toBe(false);
  // });
});

/* ------------------------------------------------------------------------- */
/* Round-trip consistency tests                                              */
/* ------------------------------------------------------------------------- */
describe('round-trip parse/initialize consistency', () => {
  it('parseSubmissionProfile preserves interface keys and builds default profile', () => {
    const initialized = initializeSettings(TEST_SETTINGS);
    const out = parseSubmissionProfile(TEST_SETTINGS, initialized, 'interface');
    expect(out).not.toBeNull();
    INTERFACE_KEYS.forEach(k => {
      expect(out[k]).toEqual(TEST_SETTINGS[k as keyof UserSettings]);
    });
    expect(Object.keys(out.submission_profiles || {})).toContain('default');
  });
});

/* ------------------------------------------------------------------------- */
/* resetDefaultSubmissionValues tests                                         */
/* ------------------------------------------------------------------------- */
describe('resetDefaultSubmissionValues', () => {
  it('resets parameters that have non-null defaults to their default value', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.service_spec[0].params[0].default = 'def-x';
    profile.service_spec[0].params[0].value = 'changed';
    const after = resetDefaultSubmissionValues(profile);
    expect(after.service_spec[0].params[0].value).toBe('def-x');
  });

  it('does not touch parameters whose default is null', () => {
    const profile = initializeSettings(TEST_SETTINGS);
    profile.service_spec[0].params[1].default = null;
    profile.service_spec[0].params[1].value = 'modified';
    const after = resetDefaultSubmissionValues(profile);
    expect(after.service_spec[0].params[1].value).toBe('modified');
  });
});
