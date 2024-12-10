import type { SubmissionProfile, SubmissionProfileParams } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';
import _ from 'lodash';

export type ProfileParam<T> = {
  default: T;
  value: T;
  editable: boolean;
};

export type ProfileSettings = {
  [K in keyof Omit<UserSettings, 'service_spec' | 'services'>]: ProfileParam<UserSettings[K]>;
} & {
  service_spec: UserSettings['service_spec'];
  services: UserSettings['services'];
};

export type SubmitSettings = Omit<UserSettings, 'services' | 'service_spec'> & {
  profiles: { [key: string]: ProfileSettings };
};

const loadProfile = (settings: UserSettings, profile: SubmissionProfile) => {
  let values: ProfileSettings = null;

  // Loading the services
  values = { ...values, services: null };
  const selected = profile?.params?.services?.selected;
  const excluded = profile?.params?.services?.excluded;
  values.services = settings.services
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
  values = { ...values, service_spec: null };
  values.service_spec = settings.service_spec
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

  // Load the rest of the parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (!['services', 'service_spec'].includes(key)) {
      const defaultValue = settings?.[key];
      values = {
        ...values,
        [key]: {
          default: defaultValue === null || defaultValue === undefined ? null : defaultValue,
          value: value,
          editable: !profile ? true : !!profile.editable_params?.submit?.includes(key)
        }
      };
    }
  });

  return values;
};

export const decompressSubmissionProfiles = (settings: UserSettings, user: CustomUser): SubmitSettings => {
  if (!settings) return null;

  const out: SubmitSettings = { ...settings, profiles: {} };

  if (user.roles.includes('submission_customize') || user.is_admin) {
    out.profiles = { ...out.profiles, default: loadProfile(settings, null) };
  }

  Object.entries(settings?.submission_profiles).forEach(([name, profile]) => {
    out.profiles = { ...out.profiles, [name]: loadProfile(settings, profile) };
  });

  return out;
};

export const compressSubmissionProfiles = (submit: SubmitSettings, user: CustomUser): UserSettings => {
  if (!submit) return null;

  const out = _.omit(submit, ['profiles']) as UserSettings;

  // Applying the submission profile changes
  Object.entries(submit.profiles)
    .filter(([name]) => name !== 'default')
    .forEach(([name, profile]) => {
      // Submission options
      Object.entries(profile).forEach(([key, value]) => {
        if (
          [
            'classification',
            'ttl',
            'deep_scan',
            'ignore_dynamic_recursion_prevention',
            'ignore_filtering',
            'generate_alert',
            'ignore_cache'
          ].includes(key) &&
          submit.profiles[name][key].value !== submit.profiles.default[key].value
        ) {
          out.submission_profiles[name].params[key] = submit.profiles[name][key].value;
        }
      });

      // Default Service Selection
      const selected = [];
      profile.services.forEach((category, i) => {
        if (category.selected) {
          selected.push(category.name);
        } else {
          category.services.forEach((service, j) => {
            if (service.selected) {
              selected.push(service.name);
            }
          });
        }
      });
      out.submission_profiles[name].params.services.selected = selected;

      // Default Service Parameters
      let serviceSpec = {} as SubmissionProfileParams['service_spec'];
      profile.service_spec.forEach((service, i) => {
        service.params.forEach((param, j) => {
          if (
            submit.profiles[name].service_spec[i].params[j].value !==
            submit.profiles.default.service_spec[i].params[j].value
          ) {
            serviceSpec = {
              ...serviceSpec,
              [service.name]: { ...serviceSpec?.[service.name], [param.name]: param.value }
            };
          }
        });
      });
      out.submission_profiles[name].params.service_spec = serviceSpec;
    });

  // Applying the default param changes

  // Submission options
  Object.entries(submit.profiles.default).forEach(([key, value]) => {
    if (
      [
        'classification',
        'ttl',
        'deep_scan',
        'ignore_dynamic_recursion_prevention',
        'ignore_filtering',
        'generate_alert',
        'ignore_cache'
      ].includes(key)
    ) {
      out[key] = submit.profiles.default[key].value;
    }
  });

  // Default Service Selection
  out.services.forEach((category, i) => {
    out.services[i].selected = submit.profiles.default.services[i].selected;
    category.services.forEach((service, j) => {
      out.services[i].services[j].selected = submit.profiles.default.services[i].services[j].selected;
    });
  });

  // Default Service Parameters
  out.service_spec.forEach((service, i) => {
    service.params.forEach((param, j) => {
      out.service_spec[i].params[j].value = submit.profiles.default.service_spec[i].params[j].value;
    });
  });

  return out;
};
