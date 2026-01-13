/* eslint-disable @typescript-eslint/prefer-for-of */
import type { Submission, SubmissionProfileParams } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';
import _ from 'lodash';

/**
 * Keys that belong to the "interface" part of user settings.
 */
export const INTERFACE_KEYS = [
  'default_classification',
  'default_external_sources',
  'default_zip_password',
  'download_encoding',
  'executive_summary',
  'expand_min_score',
  'malicious',
  'preferred_submission_profile',
  'submission_view'
] as const;

/**
 * Profile-related keys that can be overridden by submission profiles.
 */
export const PROFILE_KEYS = [
  'deep_scan',
  'description',
  'generate_alert',
  'ignore_cache',
  'ignore_filtering',
  'ignore_recursion_prevention',
  'priority',
  'ttl'
] as const;

export type InterfaceKey = keyof Pick<UserSettings, (typeof INTERFACE_KEYS)[number]>;
export type ProfileKey = keyof Pick<UserSettings, (typeof PROFILE_KEYS)[number]>;

export type ProfileParam<T> = {
  default: T;
  prev: T;
  value: T;
  restricted: boolean;
};

export type ProfileSettings = {
  [K in keyof Pick<UserSettings, InterfaceKey>]: { value: UserSettings[K]; prev: UserSettings[K] };
} & {
  [K in keyof Pick<UserSettings, ProfileKey>]: ProfileParam<UserSettings[K]> | ProfileParam<null>;
} & {
  services: ({
    [K in keyof Omit<UserSettings['services'][number], 'services'>]: UserSettings['services'][number][K];
  } & {
    default: boolean;
    prev: boolean;
    restricted: boolean;
    services?: ({
      [P in keyof UserSettings['services'][number]['services'][number]]: UserSettings['services'][number]['services'][number][P];
    } & {
      default: boolean;
      prev: boolean;
      restricted: boolean;
    })[];
  })[];
} & {
  service_spec: {
    name: UserSettings['service_spec'][number]['name'];
    params: ({
      [K in keyof UserSettings['service_spec'][number]['params'][number]]: UserSettings['service_spec'][number]['params'][number][K];
    } & {
      prev: UserSettings['service_spec'][number]['params'][number]['value'];
      restricted: boolean;
    })[];
  }[];
} & {
  initial_data: { prev: Record<string, unknown>; value: Record<string, unknown> };
};

/**
 * Returns the first non-null and non-undefined value from the provided list.
 *
 * @template T
 * @param {...(T | null | undefined)[]} values
 *   A sequence of values to evaluate in order.
 *
 * @returns {T | null}
 *   The first defined value, or `null` if all values are null/undefined.
 */
export function getValidValue<const T extends readonly unknown[]>(
  ...values: T
): Exclude<T[number], null | undefined> | null {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value as Exclude<T[number], null | undefined>;
    }
  }
  return null;
}

/**
 * Extracts the list of profile names from a UserSettings object.
 *
 * @param {UserSettings} settings
 *   The full user settings object, possibly containing submission profiles.
 *
 * @returns {string[]}
 *   An array of submission profile names (empty if none exist).
 */
export const getProfileNames = (settings: UserSettings) =>
  Object.keys(settings?.submission_profiles || {}).sort((a, b) => a.localeCompare(b));

/**
 * Builds a fully normalized `ProfileSettings` structure based on raw UserSettings.
 *
 * This function:
 * - Produces a complete profile/settings model combining interface keys,
 *   profile parameters, services, service specifications, and initial data.
 * - Safely clones and sorts nested structures so the incoming `settings`
 *   object is never mutated.
 * - Applies default values for fields that are not provided.
 *
 * @param {UserSettings | null} settings
 *   Raw settings from the backend. If null, the function returns null.
 *
 * @returns {ProfileSettings | null}
 *   A new ProfileSettings object containing all derived fields,
 *   or null when input is null.
 */
export const initializeSettings = (settings: UserSettings | null): ProfileSettings | null => {
  if (!settings) return null;

  const out: ProfileSettings = {
    description: { prev: '', value: '', default: '', restricted: false },
    malicious: { prev: false, value: false },
    services: [],
    service_spec: [],
    initial_data: { value: { passwords: [] }, prev: { passwords: [] } }
  } as unknown as ProfileSettings;

  // Copy interface keys
  for (const key of INTERFACE_KEYS) {
    (out as unknown)[key] = { value: settings[key], prev: settings[key] };
  }

  // Initialize profile keys
  for (const key of PROFILE_KEYS) {
    (out as unknown)[key] = { default: null, value: null, prev: null, restricted: true };
  }

  // Services: clone, sort, and enrich
  out.services = (Array.isArray(settings.services) ? [...settings.services] : [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(category => ({
      ...category,
      default: false,
      prev: Boolean(category.selected),
      restricted: true,
      services: (Array.isArray(category.services) ? [...category.services] : [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(service => ({
          ...service,
          default: false,
          prev: Boolean(service.selected),
          restricted: true
        }))
    }));

  // Service spec: clone, sort, and enrich
  out.service_spec = (Array.isArray(settings.service_spec) ? [...settings.service_spec] : [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      ...spec,
      params: (Array.isArray(spec.params) ? [...spec.params] : [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(param => ({
          ...param,
          prev: param.value,
          restricted: true
        }))
    }));

  return out;
};

/**
 * Applies the "default" submission profile onto an existing ProfileSettings model.
 *
 * This function mutates the provided `out` object and:
 * - Loads profile-level keys from the default profile (classification, deep_scan, etc.).
 * - Determines which fields are restricted based on user roles and permissions.
 * - Applies default service selections and nested service settings.
 * - Hydrates service specification parameters following precedence:
 *     1. explicit value in default profile
 *     2. value from service_spec definition
 *     3. existing value already present in `out`
 * - Resets initial_data, description, and malicious fields to baseline values.
 *
 * @param {ProfileSettings} out
 *   The target ProfileSettings object to mutate.
 * @param {UserSettings | null} settings
 *   The full user settings data, including submission profiles.
 * @param {CustomUser} user
 *   Authenticated user with role and permission data used to determine restrictions.
 *
 * @returns {ProfileSettings}
 *   The same `out` object after being updated.
 */
export const loadDefaultProfile = (
  out: ProfileSettings,
  settings: UserSettings | null,
  user: CustomUser
): ProfileSettings => {
  if (!settings?.submission_profiles?.default) return out;

  const defaultProfile = settings.submission_profiles.default;
  const canCustomize = user.is_admin || user.roles.includes('submission_customize');

  for (const key of PROFILE_KEYS) {
    if (key in defaultProfile) {
      const target = out[key];
      const val = defaultProfile[key];

      target.value = val;
      target.prev = val;
      target.default = null;
      target.restricted = !canCustomize;
    }
  }

  for (let i = 0; i < out.services.length; i++) {
    const cat = out.services[i];
    const catSelected = !!defaultProfile.services?.selected?.includes(cat.name);

    cat.selected = catSelected;
    cat.default = catSelected;
    cat.prev = catSelected;
    cat.restricted = !canCustomize;

    for (let j = 0; j < cat.services.length; j++) {
      const svr = cat.services[j];
      const selected =
        defaultProfile.services?.selected?.includes(svr.category) ||
        defaultProfile.services?.selected?.includes(svr.name) ||
        false;

      svr.selected = selected;
      svr.default = selected;
      svr.prev = selected;
      svr.restricted = !canCustomize;
    }
  }

  for (let i = 0; i < out.service_spec.length; i++) {
    const svr = out.service_spec[i];
    const profileSpecParams = defaultProfile.service_spec?.[svr.name] ?? {};

    const settingsSpec = settings.service_spec?.find(s => s.name === svr.name);

    for (let j = 0; j < svr.params.length; j++) {
      const param = svr.params[j];
      const profileValue = profileSpecParams[param.name] as string | number | boolean;

      const settingsParam = settingsSpec?.params?.find(p => p.name === param.name);

      const finalValue = profileValue ?? settingsParam?.value ?? param.value;

      param.value = finalValue;
      param.prev = finalValue;
      param.default = settingsParam?.default ?? param.default;
      param.restricted = !canCustomize;
    }
  }

  out.initial_data.value = { passwords: [] };
  out.initial_data.prev = { passwords: [] };

  out.description.value = null;
  out.description.prev = null;
  out.description.default = null;
  out.description.restricted = false;

  out.malicious.value = false;
  out.malicious.prev = false;

  return out;
};

/**
 * Loads a named submission profile (non-default) into an existing ProfileSettings model.
 *
 * This mutates the provided `out` object and:
 * - Rehydrates interface keys using values from global UserSettings.
 * - Applies profile-specific parameters (classification, description, ttl, etc.).
 * - Marks fields as restricted when configured as non-editable for this profile.
 * - Applies selected/default/restricted states to services and nested services.
 * - Populates service_spec parameters with correct precedence:
 *     1. explicit value from the selected submission profile
 *     2. value from the global service_spec definition
 *     3. retained value already in `out`
 * - Updates prev fields so subsequent diff checks work correctly.
 *
 * @param {ProfileSettings} out
 *   The target ProfileSettings object to mutate.
 * @param {UserSettings | null} settings
 *   The global user settings including submission_profiles.
 * @param {Submission['profiles']} profiles
 *   The full profile metadata model used to obtain restrictions/defaults.
 * @param {CustomUser} user
 *   Authenticated user used to test whether restricted fields can be edited.
 * @param {string} name
 *   The name of the submission profile to load.
 *
 * @returns {ProfileSettings}
 *   The modified `out` object after loading the profile data.
 */
export const loadSubmissionProfile = (
  out: ProfileSettings,
  settings: UserSettings | null,
  profiles: Submission['profiles'],
  user: CustomUser,
  name: string
): ProfileSettings => {
  if (!settings || !settings.submission_profiles?.[name]) return out;

  const customize = user.is_admin || user.roles.includes('submission_customize');
  const profileDef = settings.submission_profiles[name];
  const profileMeta = profiles?.[name];

  for (const k of INTERFACE_KEYS) {
    const val = settings[k as keyof UserSettings];
    (out as any)[k].value = val;
    (out as any)[k].prev = val;
  }

  for (const key of PROFILE_KEYS) {
    const val = profileDef[key as keyof typeof profileDef];
    const defaultVal = profileMeta?.params?.[key as keyof typeof profileMeta.params];
    const restricted = !customize && profileMeta?.restricted_params?.submission?.includes(key);

    const target = out[key];

    (target as any).value = val;
    (target as any).prev = val;
    (target as any).default = getValidValue(defaultVal);
    (target as any).restricted = restricted;
  }

  const excluded = profileMeta?.params?.services?.excluded || [];
  const defaults = profileMeta?.params?.services?.selected || [];
  const selected = profileDef.services?.selected || [];

  for (let i = 0; i < out.services.length; i++) {
    const cat = out.services[i];
    const name = cat.name;

    const sel = selected.includes(name);
    const restr = !customize && excluded.includes(name);
    const def = defaults.includes(name);

    cat.selected = sel;
    cat.restricted = restr;
    cat.default = def;
    cat.prev = sel;

    for (let j = 0; j < cat.services.length; j++) {
      const svr = cat.services[j];
      const n = svr.name;
      const c = svr.category;

      const s = selected.includes(n) || selected.includes(c);

      const r = !customize && (excluded.includes(n) || excluded.includes(c));

      const d = defaults.includes(n) || defaults.includes(c);

      svr.selected = s;
      svr.restricted = r;
      svr.default = d;
      svr.prev = s;
    }
  }

  for (let i = 0; i < out.service_spec.length; i++) {
    const svr = out.service_spec[i];
    const settingsSpec = settings.service_spec?.find(s => s.name === svr.name);

    for (let j = 0; j < svr.params.length; j++) {
      const param = svr.params[j];

      const profileValue = profileDef.service_spec?.[svr.name]?.[param.name];

      const settingsParam = settingsSpec?.params?.find(p => p.name === param.name);

      const profileDefault = profileMeta?.params?.service_spec?.[svr.name]?.[param.name];

      const isRestricted = !customize && profileMeta?.restricted_params?.[svr.name]?.includes(param.name);

      const newValue = getValidValue(profileValue, settingsParam?.value, param.value);

      param.value = newValue;
      param.prev = newValue;

      param.default = getValidValue(profileDefault, settingsParam?.default, param.default);

      param.restricted = isRestricted;
    }
  }

  out.initial_data.value = { passwords: [] };
  out.initial_data.prev = { passwords: [] };

  out.description.value = null;
  out.description.prev = null;
  out.description.default = null;
  out.description.restricted = false;

  out.malicious.value = false;
  out.malicious.prev = false;

  return out;
};

/**
 * Produces a compact `UserSettings` object containing only the selected
 * submission profile's values. Used when serializing settings back to backend.
 *
 * This function:
 * - Copies interface keys directly from ProfileSettings.
 * - Includes only profile parameters that:
 *      1. are not restricted, and
 *      2. differ from their `default` value.
 * - Builds a minimal `services` structure (selected/excluded/etc.).
 * - Produces a compact `service_spec` block containing only overridden values.
 * - Stores initial_data as a serialized JSON string.
 *
 * @param {UserSettings | null} settings
 *   The original user settings object to clone from.
 * @param {ProfileSettings | null} profile
 *   The in-memory working profile model.
 * @param {string} name
 *   The profile name ("interface" is mapped to "default").
 *
 * @returns {UserSettings | null}
 *   A UserSettings object containing only the selected submission profile data,
 *   or null when inputs are invalid.
 */
export const parseSubmissionProfile = (
  settings: UserSettings | null,
  profile: ProfileSettings | null,
  name: string
): UserSettings | null => {
  if (!settings || !profile) return null;

  const profileName = name === 'interface' ? 'default' : name;

  // Only copy interface keys instead of cloning entire settings
  const out: Partial<UserSettings> = {} as UserSettings;
  for (const key of INTERFACE_KEYS) {
    (out as unknown)[key] = profile[key].value;
  }

  // Build minimal profile params with predictable structure
  const params: SubmissionProfileParams = {
    services: {
      selected: [],
      excluded: [],
      rescan: [],
      resubmit: []
    },
    service_spec: {}
  } as SubmissionProfileParams;

  for (const key of PROFILE_KEYS) {
    const p = profile[key] as { value: unknown; default: unknown; restricted?: boolean } | undefined;
    if (p && !p.restricted && p.value !== p.default) {
      params[key] = p.value;
    }
  }

  // Services: preallocate arrays
  const selectedServices: string[] = [];
  const excludedServices: string[] = [];
  const rescanServices: string[] = [];
  const resubmitServices: string[] = [];

  for (const cat of profile.services) {
    if (cat.selected) {
      selectedServices.push(cat.name);
    } else {
      for (const svr of cat.services) {
        if (svr.selected) selectedServices.push(svr.name);
      }
    }
  }

  params.services = {
    selected: selectedServices,
    excluded: excludedServices,
    rescan: rescanServices,
    resubmit: resubmitServices
  };

  // Service spec: only store overridden, unrestricted params
  const serviceSpecOut: Record<string, Record<string, string | number | boolean>> = {};

  for (const svr of profile.service_spec) {
    let target: Record<string, string | number | boolean> | undefined;
    for (const param of svr.params) {
      if (param.value !== param.default && !param.restricted) {
        if (!target) target = {};
        target[param.name] = param.value;
      }
    }
    if (target) serviceSpecOut[svr.name] = target;
  }

  params.service_spec = serviceSpecOut;

  out.initial_data = JSON.stringify(profile.initial_data.value);
  out.submission_profiles = { ...settings.submission_profiles, [profileName]: params };

  return out as UserSettings;
};

/**
 * Determines whether any field in a ProfileSettings object has changed
 * relative to its stored `prev` value.
 *
 * This includes:
 * - Interface keys
 * - Profile keys
 * - Service selections and nested service selections
 * - Service specification parameters
 * - initial_data deep structure
 *
 * @param {ProfileSettings} out
 *   The settings object being checked for modifications.
 *
 * @returns {boolean}
 *   True if a difference is detected, false otherwise.
 */
export const hasDifferentPreviousSubmissionValues = (out: ProfileSettings): boolean => {
  // Interface keys comparison
  for (const key of INTERFACE_KEYS) {
    const cur = out[key];
    if (!cur) continue;
    if (Array.isArray(cur.value) && Array.isArray(cur.prev)) {
      if (!_.isEqual([...cur.value].sort(), [...cur.prev].sort())) return true;
    } else {
      if (cur.value !== cur.prev) return true;
    }
  }

  // Profile keys comparison
  for (const key of PROFILE_KEYS) {
    const p = out[key];
    if (p && p.value !== p.prev) return true;
  }

  // Services / nested services
  for (let i = 0; i < out.services.length; i++) {
    if (out.services[i].selected !== out.services[i].prev) return true;
    for (let j = 0; j < (out.services[i].services?.length || 0); j++) {
      if (out.services[i].services[j].selected !== out.services[i].services[j].prev) return true;
    }
  }

  // Service spec params
  for (let i = 0; i < out.service_spec.length; i++) {
    for (let j = 0; j < out.service_spec[i].params.length; j++) {
      if (out.service_spec[i].params[j].value !== out.service_spec[i].params[j].prev) return true;
    }
  }

  // initial_data deep compare using structural equality
  if (out?.initial_data?.value && !_.isEqual(out.initial_data.value, out.initial_data.prev)) {
    return true;
  }

  return false;
};

/**
 * Restores all fields in the ProfileSettings object to their previous (`prev`)
 * values. This resets the working state back to the last saved state.
 *
 * Mutates the provided object, including:
 * - Interface keys
 * - Profile parameter values
 * - Nested service and sub-service selections
 * - Service specification parameters
 * - initial_data
 *
 * @param {ProfileSettings} out
 *   The settings object to be reset.
 *
 * @returns {ProfileSettings}
 *   The same `out` object after being restored to previous values.
 */
export const resetPreviousSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  for (const key of INTERFACE_KEYS) {
    if (out[key]) out[key].value = out[key].prev;
  }

  for (const key of PROFILE_KEYS) {
    if (out[key]) out[key].value = out[key].prev;
  }

  out.services.forEach((cat, i) => {
    out.services[i].selected = out.services[i].prev;
    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected = out.services[i].services[j].prev;
    });
  });

  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      out.service_spec[i].params[j].value = out.service_spec[i].params[j].prev;
    });
  });

  out.initial_data.value = structuredClone(out.initial_data.prev);

  return out;
};

/**
 * Synchronizes all `prev` fields with their current values.
 *
 * This is typically used after successfully saving a profile so that
 * future change-detection can correctly identify new modifications.
 *
 * Mutates the provided `out` object in place.
 *
 * @param {ProfileSettings} out
 *   The settings object whose `prev` fields should be updated.
 *
 * @returns {ProfileSettings}
 *   The same `out` object after updating all `prev` fields.
 */

export const updatePreviousSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  for (const key of INTERFACE_KEYS) {
    if (out[key]) out[key].prev = out[key].value;
  }

  for (const key of PROFILE_KEYS) {
    if (out[key]) out[key].prev = out[key].value;
  }

  out.services.forEach((cat, i) => {
    out.services[i].prev = out.services[i].selected;
    cat.services.forEach((svr, j) => {
      out.services[i].services[j].prev = out.services[i].services[j].selected;
    });
  });

  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  out.initial_data.prev = structuredClone(out.initial_data.value);

  return out;
};

/**
 * Checks whether any profile parameter, service selection, or service
 * spec parameter differs from its declared default value (non-null defaults only).
 *
 * This provides a way to determine whether the user has deviated from
 * the baseline configuration.
 *
 * @param {ProfileSettings} out
 *   The settings object to examine.
 *
 * @returns {boolean}
 *   True when at least one field differs from its default value.
 */
export const hasDifferentDefaultSubmissionValues = (out: ProfileSettings): boolean => {
  let res: boolean = false;

  for (const key of PROFILE_KEYS) {
    const p = out[key];
    // Only flag when default is explicitly set (non-null) and differs
    if (p && p.default !== null && p.value !== p.default) {
      res = true;
    }
  }

  out.services.forEach((cat, i) => {
    if (out.services[i].default !== null && out.services[i].selected !== out.services[i].default) {
      res = true;
    }
    cat.services.forEach((svr, j) => {
      if (
        out.services[i].services[j].default !== null &&
        out.services[i].services[j].selected !== out.services[i].services[j].default
      ) {
        res = true;
      }
    });
  });

  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      if (
        out.service_spec[i].params[j].default !== null &&
        out.service_spec[i].params[j].value !== out.service_spec[i].params[j].default
      ) {
        res = true;
      }
    });
  });

  return res;
};

/**
 * Resets all fields that have non-null defaults back to those default values.
 *
 * This includes:
 * - Profile parameter values
 * - Selected/default states for services and nested services
 * - Service specification parameters
 *
 * Fields with `default === null` are left unchanged.
 *
 * @param {ProfileSettings} out
 *   The settings object to modify.
 *
 * @returns {ProfileSettings}
 *   The same object with values restored to their defaults.
 */
export const resetDefaultSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  for (const key of PROFILE_KEYS) {
    if (out[key] && out[key].default !== null) out[key].value = out[key].default;
  }

  out.services.forEach((cat, i) => {
    if (out.services[i].default !== null) {
      out.services[i].selected = out.services[i].default;
    }
    cat.services.forEach((svr, j) => {
      if (out.services[i].services[j].default !== null) {
        out.services[i].services[j].selected = out.services[i].services[j].default;
      }
    });
  });

  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      if (out.service_spec[i].params[j].default !== null) {
        out.service_spec[i].params[j].value = out.service_spec[i].params[j].default;
      }
    });
  });

  return out;
};
