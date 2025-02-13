import type { SubmissionProfile, SubmissionProfileParams } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';

type InterfaceKey = keyof Pick<
  UserSettings,
  | 'default_external_sources'
  | 'default_zip_password'
  | 'download_encoding'
  | 'executive_summary'
  | 'expand_min_score'
  | 'preferred_submission_profile'
  | 'submission_view'
>;

const INTERFACE_KEYS: InterfaceKey[] = [
  'default_external_sources',
  'default_zip_password',
  'download_encoding',
  'executive_summary',
  'expand_min_score',
  'preferred_submission_profile',
  'submission_view'
];

type ProfileKey = keyof Pick<
  UserSettings,
  | 'classification'
  | 'deep_scan'
  | 'generate_alert'
  | 'ignore_cache'
  | 'ignore_recursion_prevention'
  | 'ignore_filtering'
  | 'priority'
  | 'ttl'
>;

const PROFILE_KEYS: ProfileKey[] = [
  'classification',
  'deep_scan',
  'generate_alert',
  'ignore_cache',
  'ignore_recursion_prevention',
  'ignore_filtering',
  'priority',
  'ttl'
];

export type ProfileParam<T> = {
  default: T;
  value: T;
  editable: boolean;
};

export type ProfileSettings = {
  [K in keyof Pick<SubmissionProfileParams, ProfileKey>]: ProfileParam<SubmissionProfileParams[K]>;
} & Pick<UserSettings, 'services' | 'service_spec'>;

export type SubmitSettings = Pick<UserSettings, ProfileKey> & {
  description: string;
  default_external_sources: string[];
  default_zip_password: string;
  download_encoding: 'raw' | 'cart' | 'zip';
  executive_summary: boolean;
  expand_min_score: number;
  preferred_submission_profile: string;
  submission_profiles: {
    [profile: string]: ProfileSettings;
  };
  submission_view: 'report' | 'details';
};

const loadProfile = (profile_name: string, settings: UserSettings, profile: SubmissionProfile): ProfileSettings => {
  let out: ProfileSettings = null;

  // Load the submission parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      const defaultValue: unknown = settings.submission_profiles[profile_name][key];
      out = {
        ...out,
        [key]: {
          default: defaultValue === null || defaultValue === undefined ? null : defaultValue,
          value: defaultValue || value,
          editable: !profile ? true : !!profile.editable_params?.submission?.includes(key)
        }
      };
    }
  });

  // Loading the services
  out = { ...out, services: null };
  const selected = profile?.params?.services?.selected;
  const excluded = profile?.params?.services?.excluded;
  out.services = settings.services
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(category => ({
      ...category,
      selected: !profile ? category.selected : selected.includes(category.name) && !excluded.includes(category.name),
      services: category.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(service => ({
          ...service,
          selected: !profile
            ? service.selected
            : (selected.includes(service.category) || selected.includes(service.name)) &&
              !(excluded.includes(service.category) || excluded.includes(service.name))
        }))
    }));

  // Loading the service specs
  out = { ...out, service_spec: null };
  out.service_spec = settings.service_spec
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      ...spec,
      params: spec.params
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(param => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const paramValue = profile?.params?.service_spec?.[spec?.name]?.[param?.name];
          return {
            ...param,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: paramValue === undefined || paramValue === null ? param?.value : paramValue,
            editable: !profile ? true : profile.editable_params?.[spec.name]?.includes(param?.name) ?? false
          };
        })
    }));

  return out;
};

export const loadSubmissionProfiles = (
  settings: UserSettings,
  submission_profiles: { [key: string]: SubmissionProfile }
): SubmitSettings => {
  if (!settings) return null;
  let out = { default_external_sources: [], description: '', submission_profiles: {} } as SubmitSettings;

  // Load settings for the interface section
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out = { ...out, [key]: value };
    }
  });

  // Load submission profile information
  Object.keys(settings?.submission_profiles || {}).forEach(name => {
    out.submission_profiles = {
      ...out.submission_profiles,
      [name]: loadProfile(name, settings, submission_profiles[name])
    };
  });

  return out;
};

export const parseSubmissionProfiles = (submit: SubmitSettings): UserSettings => {
  if (!submit) return null;

  let out: UserSettings = {} as UserSettings;

  // Applying the default submission parameters
  Object.entries(submit).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = value;
    }
  });

  if (submit.submission_profiles?.default) {
    // Applying the default submission parameters
    Object.entries(submit.submission_profiles.default).forEach(([key, value]: [string, unknown]) => {
      const param = value as ProfileParam<unknown>;
      if (PROFILE_KEYS.includes(key as ProfileKey)) {
        out[key] = param.value;
      }
    });

    out = {
      ...out,
      services: submit.submission_profiles.default.services,
      service_spec: submit.submission_profiles.default.service_spec
    };
  }

  if (out?.service_spec) {
    // Remove the editable property
    out.service_spec.forEach((spec, i) => {
      out.service_spec[i].params.forEach((param, j) => {
        delete out.service_spec[i].params[j].editable;
      });
    });
  }

  // Applying the submission profile changes
  if (submit?.submission_profiles) {
    Object.entries(submit.submission_profiles).forEach(([name, profile]: [string, ProfileSettings]) => {
      out = {
        ...out,
        submission_profiles: {
          ...out.submission_profiles,
          [name]: {
            classification: null,
            services: { excluded: [], rescan: [], resubmit: [], selected: [] },
            service_spec: {}
          }
        }
      };

      Object.entries(profile).forEach(([key, value]: [string, unknown]) => {
        const param = value as ProfileParam<unknown>;
        if (PROFILE_KEYS.includes(key as ProfileKey) && param.value !== param.default) {
          out.submission_profiles[name][key] = param.value;
        }
      });

      // Default Service Selection
      const selected: string[] = [];
      profile.services.forEach(category => {
        if (category.selected) {
          selected.push(category.name);
        } else {
          category.services.forEach(service => {
            if (service.selected) {
              selected.push(service.name);
            }
          });
        }
      });
      out.submission_profiles[name].services.selected = selected;

      // Default Service Parameters
      profile.service_spec.forEach((service, i) => {
        let spec: { [name: string]: unknown } = null;
        service.params.forEach((param, j) => {
          if (out?.service_spec && param.value !== out.service_spec[i].params[j].value) {
            spec = { ...spec, [param.name]: param.value };
          }

          if (spec !== null) {
            out.submission_profiles[name].service_spec = {
              ...out.submission_profiles[name].service_spec,
              [service.name]: spec
            };
          }
        });
      });
    });
  }

  return out;
};

export const applySubmissionProfile = (submit: SubmitSettings, profile: string | number): UserSettings => {
  if (!submit) return null;

  const out: UserSettings = {
    description: submit.description || '',
    default_external_sources: submit.default_external_sources || []
  } as UserSettings;

  // Applying the selected submission profile parameters
  Object.entries(submit.submission_profiles[profile]).forEach(([key, value]: [string, unknown]) => {
    const param = value as ProfileParam<unknown>;
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      out[key] = param.value;
    }
  });

  // Applying the selected submission profile service specs
  out.service_spec = structuredClone(submit.submission_profiles[profile].service_spec);
  out.service_spec.forEach((_, i) => {
    out.service_spec[i].params.forEach((__, j) => {
      delete out.service_spec[i].params[j].editable;
    });
  });

  // Applying the selected submission profile service specs
  out.services = structuredClone(submit.submission_profiles[profile].services);

  return out;
};

export const getProfileNames = (settings: UserSettings) => Object.keys(settings?.submission_profiles || {}).sort();
