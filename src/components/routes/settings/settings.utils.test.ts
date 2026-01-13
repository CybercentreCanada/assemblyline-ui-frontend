import { MOCK_PROFILES } from 'components/mocks/profiles';
import { MOCK_SETTINGS } from 'components/mocks/setting';
import { MOCK_ADMIN, MOCK_USER } from 'components/mocks/user';

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

/* ------------------------------------------------------------------------- */
/* Helper: safer deepMerge for test use only                                 */
/* ------------------------------------------------------------------------- */
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

const init = () => initializeSettings(MOCK_SETTINGS);
const clone = <T>(v: T): T => structuredClone(v);

/* ------------------------------------------------------------------------- */
/* deepMerge tests                                                           */
/* ------------------------------------------------------------------------- */
describe('deepMerge', () => {
  it('merges shallow objects', () => {
    expect(deepMerge({ x: 1 }, { y: 2 })).toEqual({ x: 1, y: 2 });
  });

  it('overwrites arrays instead of merging', () => {
    const result = deepMerge({ arr: [1, 2] }, { arr: [99] });
    expect(result.arr).toEqual([99]);
  });

  it('does not mutate inputs', () => {
    const a = { nested: { x: 1 } };
    const b = { nested: { x: 2 } };
    const merged = deepMerge(a, b);

    merged.nested.x = 123;
    expect(a.nested.x).toBe(1);
    expect(b.nested.x).toBe(2);
  });
});

/* ------------------------------------------------------------------------- */
/* getValidValue tests                                                        */
/* ------------------------------------------------------------------------- */
describe('getValidValue', () => {
  it('returns first non-nullish value', () => {
    expect(getValidValue(null, undefined, 5)).toBe(5);
    expect(getValidValue(undefined, 'hello', 'world')).toBe('hello');
    expect(getValidValue(null, false, true)).toBe(false);
  });

  it('returns null when all are nullish', () => {
    expect(getValidValue()).toBeNull();
    expect(getValidValue(undefined, undefined, null)).toBeNull();
  });

  it('preserves objects', () => {
    const obj = { a: 1 };
    expect(getValidValue(null, obj)).toBe(obj); // by reference
  });
});

/* ------------------------------------------------------------------------- */
/* getProfileNames tests                                                      */
/* ------------------------------------------------------------------------- */
describe('getProfileNames', () => {
  it('returns sorted profile keys', () => {
    expect(getProfileNames(MOCK_SETTINGS)).toEqual([
      'default',
      'static',
      'static_and_dynamic_with_internet',
      'static_with_dynamic',
      'static_with_internet'
    ]);
  });

  it('handles missing profiles', () => {
    const s = deepMerge(MOCK_SETTINGS, { submission_profiles: undefined });
    expect(getProfileNames(s)).toEqual([]);
  });

  it('includes inherited prototype keys', () => {
    const s = deepMerge(MOCK_SETTINGS, { submission_profiles: { inherited: { x: 1 } } });
    expect(getProfileNames(s)).toContain('inherited');
  });
});

/* ------------------------------------------------------------------------- */
/* initializeSettings tests                                                   */
/* ------------------------------------------------------------------------- */
describe('initializeSettings', () => {
  it('returns null for nullish input', () => {
    expect(initializeSettings(null)).toBeNull();
    expect(initializeSettings(undefined)).toBeNull();
  });

  it('maps INTERFACE_KEYS to {value, prev}', () => {
    const out = init();
    INTERFACE_KEYS.forEach(k => {
      expect(out[k]).toEqual({ value: MOCK_SETTINGS[k], prev: MOCK_SETTINGS[k] });
    });
  });

  it('initializes PROFILE_KEYS', () => {
    const out = init();
    PROFILE_KEYS.forEach(k => {
      expect(out[k]).toEqual({ value: null, prev: null, default: null, restricted: true });
    });
  });

  it('sorts services and service_spec without mutation', () => {
    const servicesBefore = clone(MOCK_SETTINGS.services);
    const specBefore = clone(MOCK_SETTINGS.service_spec);

    const out = init();

    expect(MOCK_SETTINGS.services).toEqual(servicesBefore);
    expect(MOCK_SETTINGS.service_spec).toEqual(specBefore);

    expect(out.services.map(s => s.name)).toEqual([
      'Antivirus',
      'Dynamic Analysis',
      'External',
      'Extraction',
      'Filtering',
      'Networking',
      'Static Analysis'
    ]);
  });

  it('sets initial_data baseline', () => {
    const out = init();
    expect(out.initial_data).toEqual({ value: { passwords: [] }, prev: { passwords: [] } });
  });
});

/* ------------------------------------------------------------------------- */
/* loadDefaultProfile tests                                                   */
/* ------------------------------------------------------------------------- */
describe('loadDefaultProfile', () => {
  it('returns original when no default profile', () => {
    const out = init();
    expect(loadDefaultProfile(out, null, MOCK_USER)).toBe(out);
  });

  it('applies default profile data', () => {
    const out = init();
    loadDefaultProfile(out, MOCK_SETTINGS, MOCK_ADMIN);

    expect(out.priority.value).toBe(MOCK_SETTINGS.submission_profiles.default.priority);

    const staticCat = out.services.find(s => s.name === 'Static Analysis');
    expect(staticCat.selected).toBe(true);
    expect(staticCat.default).toBe(true);
    expect(staticCat.prev).toBe(true);
  });
});

/* ------------------------------------------------------------------------- */
/* loadSubmissionProfile tests                                                */
/* ------------------------------------------------------------------------- */
describe('loadSubmissionProfile', () => {
  it('returns out if settings missing or profile not found', () => {
    const out = init();
    expect(loadSubmissionProfile(out, null, MOCK_PROFILES, MOCK_USER, 'static')).toBe(out);
    expect(loadSubmissionProfile(out, MOCK_SETTINGS, MOCK_PROFILES, MOCK_USER, 'bad')).toBe(out);
  });

  it('copies interface keys', () => {
    const out = init();
    loadSubmissionProfile(out, MOCK_SETTINGS, MOCK_PROFILES, MOCK_ADMIN, 'static');

    INTERFACE_KEYS.forEach(k => {
      expect(out[k].value).toEqual(MOCK_SETTINGS[k]);
      expect(out[k].prev).toEqual(MOCK_SETTINGS[k]);
    });
  });

  it('applies restrictions for non-admins', () => {
    const restricted = {
      static: deepMerge(MOCK_PROFILES.static, {
        restricted_params: { submission: ['priority'] }
      })
    };

    const out = init();
    loadSubmissionProfile(out, MOCK_SETTINGS, restricted, MOCK_USER, 'static');

    expect(out.priority.restricted).toBe(true);
  });

  it('applies nested service selections', () => {
    const out = init();
    loadSubmissionProfile(out, MOCK_SETTINGS, MOCK_PROFILES, MOCK_ADMIN, 'static');

    const cat = out.services.find(s => s.name === 'Static Analysis');
    const nested = cat.services.find(s => s.name === 'APKaye');
    expect(nested.selected).toBe(true);
  });
});

/* ------------------------------------------------------------------------- */
/* parseSubmissionProfile tests                                               */
/* ------------------------------------------------------------------------- */
describe('parseSubmissionProfile', () => {
  it('returns null when inputs null', () => {
    const p = init();
    expect(parseSubmissionProfile(null, p, 'x')).toBeNull();
    expect(parseSubmissionProfile(MOCK_SETTINGS, null, 'x')).toBeNull();
  });

  it('maps interface → default', () => {
    const p = init();
    const out = parseSubmissionProfile(MOCK_SETTINGS, p, 'interface');
    expect(Object.keys(out.submission_profiles)).toContain('default');
  });

  it('serializes initial_data', () => {
    const p = init();
    p.initial_data.value = { foo: 123 };
    const out = parseSubmissionProfile(MOCK_SETTINGS, p, 'x');
    expect(out.initial_data).toBe(JSON.stringify({ foo: 123 }));
  });
});

/* ------------------------------------------------------------------------- */
/* hasDifferentPreviousSubmissionValues tests                                 */
/* ------------------------------------------------------------------------- */
describe('hasDifferentPreviousSubmissionValues', () => {
  it('returns false for fresh profile', () => {
    expect(hasDifferentPreviousSubmissionValues(init())).toBe(false);
  });

  it('detects array differences regardless of order', () => {
    const p = init();

    p.default_external_sources.value = ['a', 'b'];
    p.default_external_sources.prev = ['b', 'a'];
    expect(hasDifferentPreviousSubmissionValues(p)).toBe(false);

    p.default_external_sources.value = ['a', 'b', 'c'];
    expect(hasDifferentPreviousSubmissionValues(p)).toBe(true);
  });

  it('detects service_spec changes', () => {
    const p = init();
    p.service_spec[0].params[0].value = 'changed';
    expect(hasDifferentPreviousSubmissionValues(p)).toBe(true);
  });
});

/* ------------------------------------------------------------------------- */
/* resetPreviousSubmissionValues / updatePreviousSubmissionValues            */
/* ------------------------------------------------------------------------- */
describe('resetPreviousSubmissionValues / updatePreviousSubmissionValues', () => {
  it('resets values', () => {
    const p = init();
    p.default_classification.value = 'TEMP';
    p.service_spec[0].params[0].value = 'TEMP';

    const r = resetPreviousSubmissionValues(p);
    expect(r.default_classification.value).toBe(r.default_classification.prev);
    expect(r.service_spec[0].params[0].value).toBe(r.service_spec[0].params[0].prev);
  });

  it('updates prev values', () => {
    const p = init();
    p.default_classification.value = 'NEW';
    p.service_spec[0].params[0].value = 'X';

    const r = updatePreviousSubmissionValues(p);
    expect(r.default_classification.prev).toBe('NEW');
    expect(r.service_spec[0].params[0].prev).toBe('X');
  });
});

/* ------------------------------------------------------------------------- */
/* hasDifferentDefaultSubmissionValues                                       */
/* ------------------------------------------------------------------------- */
describe('hasDifferentDefaultSubmissionValues', () => {
  it('detects non-null default differences', () => {
    const p = init();
    p.service_spec[0].params[0].default = 'A';
    p.service_spec[0].params[0].value = 'B';

    expect(hasDifferentDefaultSubmissionValues(p)).toBe(true);
  });
});

/* ------------------------------------------------------------------------- */
/* round-trip consistency tests                                              */
/* ------------------------------------------------------------------------- */
describe('round-trip consistency', () => {
  it('parseSubmissionProfile preserves interface keys', () => {
    const p = init();
    const out = parseSubmissionProfile(MOCK_SETTINGS, p, 'interface');
    INTERFACE_KEYS.forEach(k => {
      expect(out[k]).toEqual(MOCK_SETTINGS[k]);
    });
  });
});

/* ------------------------------------------------------------------------- */
/* resetDefaultSubmissionValues                                              */
/* ------------------------------------------------------------------------- */
describe('resetDefaultSubmissionValues', () => {
  it('resets param to default when default is not null', () => {
    const p = init();
    p.service_spec[0].params[0].default = 'X';
    p.service_spec[0].params[0].value = 'Y';

    const r = resetDefaultSubmissionValues(p);
    expect(r.service_spec[0].params[0].value).toBe('X');
  });

  it('does not modify null defaults', () => {
    const p = init();
    const param = p.service_spec[0].params[1];
    param.default = null;
    param.value = 'changed';

    expect(resetDefaultSubmissionValues(p).service_spec[0].params[1].value).toBe('changed');
  });
});
