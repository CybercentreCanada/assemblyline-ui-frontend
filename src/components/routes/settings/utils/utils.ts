import type { SubmissionProfile, SubmissionProfileParams } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';

type InterfaceKey = keyof Pick<
  UserSettings,
  | 'default_zip_password'
  | 'description'
  | 'download_encoding'
  | 'download_encoding'
  | 'executive_summary'
  | 'expand_min_score'
  | 'malicious'
  | 'preferred_submission_profile'
  | 'priority'
  | 'profile'
  | 'submission_view'
>;

const INTERFACE_KEYS: InterfaceKey[] = [
  'default_zip_password',
  'description',
  'download_encoding',
  'download_encoding',
  'executive_summary',
  'expand_min_score',
  'malicious',
  'preferred_submission_profile',
  'priority',
  'profile',
  'submission_view'
];

type ProfileKey = keyof Pick<
  UserSettings,
  | 'classification'
  | 'deep_scan'
  | 'generate_alert'
  | 'ignore_cache'
  | 'ignore_dynamic_recursion_prevention'
  | 'ignore_filtering'
  | 'ttl'
>;

const PROFILE_KEYS: ProfileKey[] = [
  'classification',
  'deep_scan',
  'generate_alert',
  'ignore_cache',
  'ignore_dynamic_recursion_prevention',
  'ignore_filtering',
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

export type SubmitSettings = Pick<UserSettings, InterfaceKey> & {
  profiles: {
    default: ProfileSettings;
    [profile: string]: ProfileSettings;
  };
};

const loadProfile = (settings: UserSettings, profile: SubmissionProfile): ProfileSettings => {
  let out: ProfileSettings = null;

  // Load the submission parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      const defaultValue: unknown = settings?.[key];
      out = {
        ...out,
        [key]: {
          default: defaultValue === null || defaultValue === undefined ? null : defaultValue,
          value: value,
          editable: !profile ? true : !!profile.editable_params?.submit?.includes(key)
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
          const paramValue = profile?.params?.service_spec?.[spec?.name]?.[param?.name];
          return {
            ...param,
            value: paramValue === undefined || paramValue === null ? param?.value : paramValue,
            editable: !profile ? true : profile.editable_params?.[spec.name]?.includes(param?.name) ?? false
          };
        })
    }));

  return out;
};

export const loadSubmissionProfiles = (settings: UserSettings, user: CustomUser): SubmitSettings => {
  if (!settings) return null;

  let out = { profiles: { default: null } } as SubmitSettings;

  // Load the submission parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out = { ...out, [key]: value };
    }
  });

  if (user.roles.includes('submission_customize') || user.is_admin) {
    out.profiles = { ...out.profiles, default: loadProfile(settings, null) };
  }

  Object.entries(settings?.submission_profiles || {}).forEach(([name, profile]) => {
    out.profiles = { ...out.profiles, [name]: loadProfile(settings, profile) };
  });

  return out;
};

export const parseSubmissionProfiles = (submit: SubmitSettings, user: CustomUser): UserSettings => {
  if (!submit) return null;

  // const out = _.omit(submit, ['profiles']) as UserSettings;

  let out: UserSettings = {} as UserSettings;

  // Applying the default submission parameters
  Object.entries(submit).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = value;
    }
  });

  // Applying the default submission parameters
  Object.entries(submit.profiles.default).forEach(([key, value]: [string, unknown]) => {
    const param = value as ProfileParam<unknown>;
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      out[key] = param.value;
    }
  });

  out = { ...out, services: submit.profiles.default.services, service_spec: submit.profiles.default.service_spec };

  // Remove the editable property
  out.service_spec.forEach((spec, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      delete out.service_spec[i].params[j].editable;
    });
  });

  // Applying the submission profile changes
  Object.entries(submit.profiles)
    .filter(([name]) => name !== 'default')
    .forEach(([name, profile]: [string, ProfileSettings]) => {
      out = {
        ...out,
        submission_profiles: {
          ...out.submission_profiles,
          [name]: {
            classification: null,
            editable_params: {},
            name: name,
            params: { services: { excluded: [], rescan: [], resubmit: [], selected: [] }, service_spec: {} }
          }
        }
      };

      // Submission options
      Object.entries(profile).forEach(([key, value]: [string, unknown]) => {
        const param = value as ProfileParam<unknown>;
        const defaultParam = submit?.profiles?.default?.[key] as ProfileParam<unknown>;
        if (PROFILE_KEYS.includes(key as ProfileKey) && param.value !== defaultParam.value) {
          out.submission_profiles[name].params[key] = param.value;
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
      out.submission_profiles[name].params.services.selected = selected;

      // Default Service Parameters
      profile.service_spec.forEach((service, i) => {
        let spec: { [name: string]: unknown } = null;
        service.params.forEach((param, j) => {
          if (param.value !== out.service_spec[i].params[j].value) {
            spec = { ...spec, [param.name]: param.value };
          }

          if (spec !== null) {
            out.submission_profiles[name].params.service_spec = {
              ...out.submission_profiles[name].params.service_spec,
              [service.name]: spec
            };
          }
        });
      });
    });

  return out;
};
