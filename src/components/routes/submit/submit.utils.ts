import useALContext from 'components/hooks/useALContext';
import type { Configuration } from 'components/models/base/config';
import type { ServiceSpecification } from 'components/models/base/service';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';
import type { InterfaceKey, ProfileKey, ProfileSettings } from 'components/routes/settings/settings.utils';
import {
  INTERFACE_KEYS,
  loadDefaultProfile,
  loadSubmissionProfile,
  PROFILE_KEYS
} from 'components/routes/settings/settings.utils';
import type { AutoURLServiceIndices, SubmitStore } from 'components/routes/submit/submit.form';
import { useForm } from 'components/routes/submit/submit.form';
import { isURL } from 'helpers/utils';
import { useCallback, useRef } from 'react';

/**
 * @param settings - User settings.
 * @returns Preferred profile name or null.
 */
export const getPreferredSubmissionProfile = (settings: UserSettings): string | null => {
  if (!settings) return null;

  const profiles = settings.submission_profiles;
  const pref = settings.preferred_submission_profile;

  if (pref in profiles) return pref;

  const keys = Object.keys(profiles);
  return keys.length ? keys[0] : null;
};

/**
 * @param settings - User settings.
 * @param configuration - Global configuration.
 * @returns Object containing deduplicated sorted external sources.
 */
export const getDefaultExternalSources = (
  settings: UserSettings,
  configuration: Configuration
): ProfileSettings['default_external_sources'] => {
  const base = settings?.default_external_sources ?? [];
  const result = new Set(base);

  for (const fileSource of Object.values(configuration.submission.file_sources)) {
    for (const src of fileSource.auto_selected) {
      result.add(src);
    }
  }

  const sources = Array.from(result).sort();
  return { prev: sources, value: sources };
};

/**
 * @param out - Target profile settings.
 * @param configuration - Global configuration.
 * @param settings - User settings.
 * @param user - Current user.
 * @param name - Profile name to load.
 */
export const switchProfile = (
  out: ProfileSettings,
  configuration: Configuration,
  settings: UserSettings,
  user: CustomUser,
  name: string
): ProfileSettings =>
  name === 'default'
    ? loadDefaultProfile(out, settings, user)
    : loadSubmissionProfile(out, settings, configuration.submission.profiles, user, name);

/**
 * @param value - JSON string.
 * @returns Whether JSON is valid.
 */
export const isValidJSON = (value: string): boolean => {
  if (!value) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param value - JSON string.
 * @param configuration - Global configuration.
 * @returns Error string or null.
 */
export const isValidMetadata = (value: string, configuration: Configuration): string | null => {
  if (!value) return null;

  try {
    const data = JSON.parse(value) as Record<string, unknown>;

    for (const key of Object.keys(configuration.submission.metadata.submit)) {
      if (key in data) {
        return `Error: Cannot use the reserved key "${key}" as it must be defined using the system's configuration`;
      }
    }

    return null;
  } catch (e) {
    return String(e);
  }
};

/**
 * @param values - Submit form values.
 * @param configuration - Global configuration.
 * @returns Whether submission is valid.
 */
export const isSubmissionValid = (values: SubmitStore, configuration: Configuration): boolean => {
  const tab = values.state.tab;

  if (tab === 'file') {
    if (!values.file) return false;
  } else if (tab === 'hash') {
    if (!values.hash.type) return false;
  }

  const priority = values.settings.priority.value;
  if (priority !== 500 && priority !== 1000 && priority !== 1500) return false;

  const ttl = values.settings.ttl.value;
  const maxDTL = configuration.submission.max_dtl;
  const max = maxDTL !== 0 ? maxDTL : 365;
  const min = maxDTL !== 0 ? 1 : 0;

  if (ttl < min || ttl > max) return false;

  const metadata = values.metadata?.data;
  if (!metadata) return true;

  for (const [key, rules] of Object.entries(configuration.submission.metadata.submit)) {
    const val = metadata[key];

    if (rules.required && !val) return false;

    const type = rules.validator_type;
    if (type === 'uri') {
      if (!isURL(String(val ?? ''))) return false;
    } else if (type === 'regex') {
      const reg = rules.validator_params.validation_regex;
      if (!String(val ?? '').match(reg)) return false;
    } else if (type === 'integer') {
      const { min, max } = rules.validator_params;
      const numeric = Number(val);
      if (numeric < min || numeric > max) return false;
    }
  }

  return true;
};

/**
 * @param file - File to hash.
 * @returns Promise resolving to SHA-256 hex string.
 */
export const calculateFileHash = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async e => {
      try {
        const buffer = e.target.result as ArrayBuffer;
        const hash = await crypto.subtle.digest('SHA-256', buffer);
        const bytes = new Uint8Array(hash);

        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          hex += bytes[i].toString(16).padStart(2, '0');
        }

        resolve(hex);
      } catch (err) {
        reject(`Hashing failed: ${err}`);
      }
    };

    reader.onerror = () => reject('File reading failed');

    reader.readAsArrayBuffer(file);
  });

/**
 * @param type - Hash type.
 * @param value - Hash value.
 */
export const getHashQuery = (type: string, value: string): string =>
  type === 'file' ? `sha256:"${value}"` : `${type}:"${value}"`;

/**
 * @param settings - Profile settings.
 * @param configuration - Global configuration.
 * @returns Whether external services are selected.
 */
export const isUsingExternalServices = (settings: ProfileSettings, configuration: Configuration): boolean => {
  const auto = configuration.ui.url_submission_auto_service_selection;

  for (const category of settings.services) {
    for (const svc of category.services) {
      if (svc.selected && auto.includes(svc.name)) return true;
    }
  }

  return false;
};

/**
 * @param profile - Full profile settings.
 * @returns A serialized UserSettings object.
 */
export const parseSubmitProfile = (profile: ProfileSettings): UserSettings | null => {
  if (!profile) return null;

  const out = {} as UserSettings;

  for (const key in profile) {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = profile[key].value;
    }
  }

  for (const key in profile) {
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      const p = profile[key];
      out[key] = p.restricted ? p.default : p.value;
    }
  }

  out.services = profile.services.map(cat => ({
    name: cat.name,
    selected: cat.selected,
    services: cat.services.map(s => ({
      category: s.category,
      description: s.description,
      is_external: s.is_external,
      name: s.name,
      selected: s.selected
    }))
  }));

  out.service_spec = profile.service_spec.map(spec => ({
    name: spec.name,
    params: spec.params.map(p => ({
      type: p.type,
      hide: p.hide,
      name: p.name,
      value: p.value,
      default: p.default,
      ...(p.list && { list: p.list })
    }))
  })) as ServiceSpecification[];

  out.description = profile.description.value;
  out.malicious = profile.malicious.value;
  out.preferred_submission_profile = profile.preferred_submission_profile.value;

  out.initial_data = JSON.stringify(profile.initial_data.value, undefined, 2);

  return out;
};

/**
 * Automatically selects or deselects a predefined list of "auto URL services"
 * whenever:
 *   - the active submission tab is "hash",
 *   - the hash type is "url",
 *   - and the selected profile changes.
 *
 * It keeps track of what it auto-selected so it can cleanly revert those
 * selections when conditions stop matching.
 */
export const useAutoURLServicesSelection = () => {
  const { configuration } = useALContext();
  const form = useForm();

  const autoNames = configuration.ui.url_submission_auto_service_selection;

  const prevTuple = useRef<readonly [string | null, boolean]>([null, false]);

  const computeHasURLservices = useCallback(
    (state: SubmitStore) => {
      if (state.state.tab !== 'hash') return false;
      if (state.hash.type !== 'url') return false;

      return state.settings.services.some(cat => {
        if (!state.state.customize && cat.restricted) return false;

        return cat.services.some(svc => {
          if (!state.state.customize && svc.restricted) return false;
          return autoNames.includes(svc.name);
        });
      });
    },
    [autoNames]
  );

  const buildTuple = useCallback(
    (state: SubmitStore) => [state.state.profile, computeHasURLservices(state)] as const,
    [computeHasURLservices]
  );

  const addSelection = useCallback(() => {
    const added: AutoURLServiceIndices = [];

    form.setFieldValue('settings.services', categories =>
      categories.map((cat, ci) => {
        const services = cat.services.map((svc, si) => {
          if (autoNames.includes(svc.name)) {
            added.push([ci, si]);
            return { ...svc, selected: true };
          }
          return svc;
        });

        return {
          ...cat,
          services,
          selected: services.every(s => s.selected)
        };
      })
    );

    form.setFieldValue('autoURLServiceSelection.prev', prev => {
      const next = prev ? [...prev] : [];
      for (const a of added) {
        if (!next.some(([ci, si]) => ci === a[0] && si === a[1])) {
          next.push(a);
        }
      }
      return next;
    });
  }, [form, autoNames]);

  const removeSelection = useCallback(() => {
    const urlServices = form.getFieldValue('autoURLServiceSelection.prev') ?? [];
    if (!urlServices.length) return;

    form.setFieldValue('settings.services', categories =>
      categories.map((cat, ci) => {
        const services = cat.services.map((svc, si) => {
          const matched = urlServices.some(([x, y]) => x === ci && y === si);
          return matched ? { ...svc, selected: svc.default } : svc;
        });

        return {
          ...cat,
          services,
          selected: services.every(s => s.selected)
        };
      })
    );

    form.setFieldValue('autoURLServiceSelection.prev', []);
  }, [form]);

  return useCallback(() => {
    const state = form.store.state.values;
    const currTuple = buildTuple(state);

    const prev = prevTuple.current;
    const prevHasURL = prev[1];
    const currHasURL = currTuple[1];

    if (prev[0] === currTuple[0] && prevHasURL === currHasURL) {
      return;
    }

    if (currHasURL) {
      console.log('addSelection');
      addSelection();
    } else if (prevHasURL && !currHasURL) {
      console.log('removeSelection');
      removeSelection();
    }

    prevTuple.current = currTuple;
  }, [form.store.state.values, buildTuple, addSelection, removeSelection]);
};
