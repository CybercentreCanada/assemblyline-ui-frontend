import type { Submission, SubmissionProfile } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';

//  (keyof UserSettings)[]

const INTERFACE_KEYS = [
  'default_external_sources',
  'default_zip_password',
  'download_encoding',
  'executive_summary',
  'expand_min_score',
  'preferred_submission_profile',
  'submission_view'
] as const;

const PROFILE_KEYS = [
  'classification',
  'deep_scan',
  'generate_alert',
  'ignore_cache',
  'ignore_recursion_prevention',
  'ignore_filtering',
  'priority',
  'ttl'
] as const;

type InterfaceKey = keyof Pick<UserSettings, (typeof INTERFACE_KEYS)[number]>;
type ProfileKey = keyof Pick<UserSettings, (typeof PROFILE_KEYS)[number]>;

export type ProfileParam<T> = {
  default: T;
  prev: T;
  value: T;
  editable: boolean;
};

// export type ProfileSettings = {
//   [K in keyof Pick<SubmissionProfileParams, ProfileKey>]: ProfileParam<SubmissionProfileParams[K]>;
// } & Pick<UserSettings, 'services' | 'service_spec'>;

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

export type ProfileSettings = {
  [K in keyof Pick<UserSettings, InterfaceKey>]: { value: UserSettings[K]; prev: UserSettings[K] };
} & {
  [K in keyof Pick<UserSettings, ProfileKey>]: ProfileParam<UserSettings[K]>;
} & {
  services: ({
    [K in keyof Omit<UserSettings['services'][number], 'services'>]: UserSettings['services'][number][K];
  } & {
    default: boolean;
    prev: boolean;
    editable: boolean;
    services?: ({
      [P in keyof UserSettings['services'][number]['services'][number]]: UserSettings['services'][number]['services'][number][P];
    } & {
      default: boolean;
      prev: boolean;
      editable: boolean;
    })[];
  })[];
} & {
  service_spec: {
    name: UserSettings['service_spec'][number]['name'];
    params: ({
      [K in keyof UserSettings['service_spec'][number]['params'][number]]: UserSettings['service_spec'][number]['params'][number][K];
    } & {
      prev: UserSettings['service_spec'][number]['params'][number]['value'];
      editable: boolean;
    })[];
  }[];
};

//   service_spec: UserSettings['service_spec'];

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
  // out.services = settings.services
  //   .sort((a, b) => a.name.localeCompare(b.name))
  //   .map(category => ({
  //     ...category,
  //     selected: !profile ? category.selected : selected.includes(category.name) && !excluded.includes(category.name),
  //     services: category.services
  //       .sort((a, b) => a.name.localeCompare(b.name))
  //       .map(service => ({
  //         ...service,
  //         selected: !profile
  //           ? service.selected
  //           : (selected.includes(service.category) || selected.includes(service.name)) &&
  //             !(excluded.includes(service.category) || excluded.includes(service.name))
  //       }))
  //   }));

  // Loading the service specs
  out = { ...out, service_spec: null };
  out.service_spec = settings.service_spec
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      ...spec,
      params: spec.params
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(param => {
          // Check if there's a value set by the user for the profile, otherwise default to what's set in the profile configuration, if any.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const profileUserParam = settings.submission_profiles[profile_name].service_spec?.[spec.name]?.[param.name];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const profileDefaultParam = profile?.params?.service_spec?.[spec.name]?.[param.name];
          return {
            ...param,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            default:
              profileUserParam === undefined || profileUserParam === null
                ? profileDefaultParam || param?.default
                : profileUserParam,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value:
              profileUserParam === undefined || profileUserParam === null
                ? profileDefaultParam || param?.value
                : profileUserParam,
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
      [name]: loadProfile(name, settings, submission_profiles?.[name])
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
      services: submit.submission_profiles.default.services
      // service_spec: submit.submission_profiles.default.service_spec
    };
  }

  if (out?.service_spec) {
    // Remove the editable property
    out.service_spec.forEach((spec, i) => {
      out.service_spec[i].params.forEach((param, j) => {
        // delete out.service_spec[i].params[j].editable;
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
          // out.submission_profiles?.[name][key] = param.value;
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
      // out.submission_profiles?.[name].services.selected = selected;

      // Default Service Parameters
      profile.service_spec.forEach((service, i) => {
        let spec: { [name: string]: unknown } = null;
        service.params.forEach((param, j) => {
          if (param.value !== param.default) {
            spec = { ...spec, [param.name]: param.value };
          }

          if (spec !== null) {
            // out.submission_profiles?.[name].service_spec = {
            //   ...out.submission_profiles?.[name].service_spec,
            //   [service.name]: spec
            // };
          }
        });
      });
    });
  }
  return out;
};

export const getProfileNames = (settings: UserSettings) => Object.keys(settings?.submission_profiles || {}).sort();

export const initializeSettings = (settings: UserSettings): ProfileSettings => {
  if (!settings) return null;

  const out = {} as ProfileSettings;

  // Applying interface parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = { value: value, prev: value };
    }
  });

  // Applying the profile parameters
  Object.entries(settings).forEach(([key, value]: [string, unknown]) => {
    if (PROFILE_KEYS.includes(key as ProfileKey)) {
      out[key] = { default: value, value: value, prev: value, editable: false };
    }
  });

  // Applying the services parameter
  out.services = settings.services
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(category => ({
      ...category,
      default: false,
      prev: category.selected,
      editable: false,
      services: category.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(service => ({ ...service, default: false, prev: service.selected, editable: false }))
    }));

  // Applying the service spec parameters
  out.service_spec = settings.service_spec
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      ...spec,
      params: spec.params
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(param => ({ ...param, prev: param.value, editable: false }))
    }));

  return out;
};

export const loadDefaultProfile = (out: ProfileSettings, settings: UserSettings): ProfileSettings => {
  if (!settings || !settings?.submission_profiles?.default) return out;

  // Applying interface parameters
  Object.entries(out).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = { value: value, prev: value };
    }
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) {
      out[key].value = settings?.submission_profiles?.default?.[key] || settings[key];
      out[key].editable = true;
      out[key].default = settings[key];
      out[key].prev = out[key].value;
    }
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].selected = settings.submission_profiles?.default?.services?.selected?.includes(cat?.name) || false;
    out.services[i].editable = true;
    out.services[i].default = out.services[i].selected;
    out.services[i].prev = out.services[i].selected;

    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected =
        settings.submission_profiles?.default?.services?.selected?.includes(svr?.category) ||
        settings.submission_profiles?.default?.services?.selected?.includes(svr?.name) ||
        false;

      out.services[i].services[j].editable = true;
      out.services[i].services[j].default = out.services[i].services[j].selected;
      out.services[i].services[j].prev = out.services[i].services[j].selected;
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      const settingsSpec = settings?.service_spec
        ?.find(s => s.name === svr.name)
        ?.params?.find(p => p.name === param.name);

      out.service_spec[i].params[j].value =
        (settings?.submission_profiles?.default?.service_spec?.[svr.name]?.[param.name] as string | number | boolean) ||
        settingsSpec?.value ||
        out.service_spec[i].params[j].value;

      out.service_spec[i].params[j].editable = true;
      out.service_spec[i].params[j].default = settingsSpec?.default || out.service_spec[i].params[j].default;
      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  return out;
};

export const loadSubmissionProfile = (
  out: ProfileSettings,
  settings: UserSettings,
  profiles: Submission['profiles'],
  name: string
): ProfileSettings => {
  if (!settings || !(name in settings.submission_profiles)) return out;

  // Applying interface parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = { value: value, prev: value };
    }
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) {
      out[key].value = settings?.submission_profiles?.[name]?.[key] || settings[key];
      out[key].editable = profiles?.[name]?.editable_params?.submission?.includes(key) || false;
      out[key].default = profiles?.[name]?.params?.[key] || settings[key];
      out[key].prev = out[key].value;
    }
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].selected = settings.submission_profiles?.[name]?.services?.selected?.includes(cat?.name) || false;
    out.services[i].editable = profiles?.[name].editable_params?.submission?.includes('services') || false;
    out.services[i].default = profiles?.[name].params?.services?.selected?.includes(cat.name) || false;
    out.services[i].prev = out.services[i].selected;

    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected =
        settings.submission_profiles?.[name]?.services?.selected?.includes(svr?.category) ||
        settings.submission_profiles?.[name]?.services?.selected?.includes(svr?.name) ||
        false;

      out.services[i].services[j].editable =
        profiles?.[name].editable_params?.submission?.includes('services') || false;

      out.services[i].services[j].default =
        profiles?.[name].params?.services?.selected?.includes(svr?.name) ||
        profiles?.[name].params?.services?.selected?.includes(svr?.category) ||
        false;

      out.services[i].services[j].prev = out.services[i].services[j].selected;
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      const settingsSpec = settings?.service_spec
        ?.find(s => s.name === svr.name)
        ?.params?.find(p => p.name === param.name);

      out.service_spec[i].params[j].value =
        (settings?.submission_profiles?.[name]?.service_spec?.[svr.name]?.[param.name] as string | number | boolean) ||
        settingsSpec?.value ||
        out.service_spec[i].params[j].value;

      out.service_spec[i].params[j].default =
        (profiles?.[name]?.params?.service_spec?.[svr.name]?.[param.name] as string | number | boolean) ||
        settingsSpec?.default ||
        out.service_spec[i].params[j].default;

      out.service_spec[i].params[j].editable =
        profiles?.[name].editable_params?.[svr.name]?.includes(param.name) || false;

      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  return out;
};

export const hasDifferentPreviousSubmissionValues = (out: ProfileSettings): boolean => {
  let res: boolean = false;

  // Applying interface parameters
  Object.keys(out).forEach((key: InterfaceKey) => {
    if (INTERFACE_KEYS.includes(key) && out[key].value !== out[key].prev) {
      res = true;
    }
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key) && out[key].value !== out[key].prev) {
      res = true;
    }
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    if (out.services[i].selected !== out.services[i].prev) {
      res = true;
    }

    cat.services.forEach((svr, j) => {
      if (out.services[i].services[j].selected !== out.services[i].services[j].prev) {
        res = true;
      }
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      if (out.service_spec[i].params[j].value !== out.service_spec[i].params[j].prev) {
        res = true;
      }
    });
  });

  return res;
};

export const resetPreviousSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  // Applying interface parameters
  Object.keys(out).forEach((key: InterfaceKey) => {
    if (INTERFACE_KEYS.includes(key)) out[key].value = out[key].prev;
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) out[key].value = out[key].prev;
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].selected = out.services[i].prev;
    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected = out.services[i].services[j].prev;
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      out.service_spec[i].params[j].value = out.service_spec[i].params[j].prev;
    });
  });

  return out;
};

export const hasDifferentDefaultSubmissionValues = (out: ProfileSettings): boolean => {
  let res: boolean = false;

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key) && out[key].value !== out[key].default) {
      res = true;
    }
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    if (out.services[i].selected !== out.services[i].default) {
      res = true;
    }

    cat.services.forEach((svr, j) => {
      if (out.services[i].services[j].selected !== out.services[i].services[j].default) {
        res = true;
      }
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      if (out.service_spec[i].params[j].value !== out.service_spec[i].params[j].default) {
        res = true;
      }
    });
  });

  return res;
};

export const resetDefaultSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) out[key].value = out[key].default;
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].selected = out.services[i].default;
    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected = out.services[i].services[j].default;
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      out.service_spec[i].params[j].value = out.service_spec[i].params[j].default;
    });
  });

  return out;
};
