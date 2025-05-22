import type { Submission, SubmissionProfileParams } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';

export const INTERFACE_KEYS = [
  'default_external_sources',
  'default_zip_password',
  'download_encoding',
  'executive_summary',
  'expand_min_score',
  'malicious',
  'preferred_submission_profile',
  'submission_view'
] as const;

export const PROFILE_KEYS = [
  'classification',
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

export const getProfileNames = (settings: UserSettings) => Object.keys(settings?.submission_profiles || {});

export const initializeSettings = (settings: UserSettings): ProfileSettings => {
  if (!settings) return null;

  const out = {
    description: { prev: '', value: '', default: '', restricted: false },
    malicious: { prev: false, value: false }
  } as ProfileSettings;

  // Applying interface parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = { value: value, prev: value };
    }
  });

  Object.entries(PROFILE_KEYS).forEach(([_, key]) => {
    out[key] = { default: null, value: null, prev: null, restricted: true };
  });

  // Applying the services parameter
  out.services = settings.services
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(category => ({
      ...category,
      default: false,
      prev: category.selected,
      restricted: true,
      services: category.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(service => ({ ...service, default: false, prev: service.selected, restricted: true }))
    }));

  // Applying the service spec parameters
  out.service_spec = settings.service_spec
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      ...spec,
      params: spec.params
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(param => ({ ...param, prev: param.value, restricted: true }))
    }));

  // Applying the initial data
  out.initial_data = { value: { passwords: [] }, prev: { passwords: [] } };

  return out;
};

export const loadDefaultProfile = (out: ProfileSettings, settings: UserSettings, user: CustomUser): ProfileSettings => {
  if (!settings || !settings?.submission_profiles?.default) return out;

  const customize = user.is_admin || user.roles.includes('submission_customize');
  // Applying the profile parameters
  Object.keys(settings.submission_profiles.default).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      out[key].value = settings.submission_profiles.default?.[key];
      out[key].restricted = !customize;
      out[key].default = settings.submission_profiles.default?.[key];
      out[key].prev = out[key].value;
    }
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].selected = settings.submission_profiles?.default?.services?.selected?.includes(cat?.name) || false;
    out.services[i].restricted = !customize;
    out.services[i].default = out.services[i].selected;
    out.services[i].prev = out.services[i].selected;

    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected =
        settings.submission_profiles?.default?.services?.selected?.includes(svr?.category) ||
        settings.submission_profiles?.default?.services?.selected?.includes(svr?.name) ||
        false;

      out.services[i].services[j].restricted = !customize;
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

      out.service_spec[i].params[j].restricted = !customize;
      out.service_spec[i].params[j].default = settingsSpec?.default || out.service_spec[i].params[j].default;
      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  // Applying the initial data
  out.initial_data = { value: { passwords: [] }, prev: { passwords: [] } };
  out.description = { value: null, prev: null, default: null, restricted: false };
  out.malicious = { value: false, prev: false };

  return out;
};

export const loadSubmissionProfile = (
  out: ProfileSettings,
  settings: UserSettings,
  profiles: Submission['profiles'],
  user: CustomUser,
  name: string
): ProfileSettings => {
  if (!settings || !(name in settings.submission_profiles)) return out;

  const customize = user.is_admin || user.roles.includes('submission_customize');

  // Applying interface parameters
  Object.entries(settings).forEach(([key, value]) => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = { value: value, prev: value };
    }
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      out[key].value = settings?.submission_profiles?.[name]?.[key];
      out[key].restricted = !customize && profiles?.[name]?.restricted_params?.submission?.includes(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      out[key].default = profiles?.[name]?.params?.[key] || out[key].value;
      out[key].prev = out[key].value;
    }
  });

  // Applying the services parameter
  const restricted = profiles?.[name].params?.services?.excluded || [];
  const defaults = profiles?.[name].params?.services?.selected || [];
  const selected = settings.submission_profiles?.[name]?.services?.selected || [];
  out.services.forEach((cat, i) => {
    out.services[i].selected = selected.includes(cat?.name);
    out.services[i].restricted = !customize && restricted.includes(cat?.name);
    out.services[i].default = defaults.includes(cat.name) || false;
    out.services[i].prev = out.services[i].selected;

    cat.services.forEach((svr, j) => {
      out.services[i].services[j].selected = selected.includes(svr?.category) || selected.includes(svr?.name);
      out.services[i].services[j].restricted =
        !customize && (restricted.includes(svr?.category) || restricted.includes(svr?.name));
      out.services[i].services[j].default = defaults.includes(svr?.name) || defaults.includes(svr?.category);
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

      out.service_spec[i].params[j].restricted =
        !customize && profiles?.[name].restricted_params?.[svr.name]?.includes(param.name);

      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  // Applying the initial data
  out.initial_data = { value: { passwords: [] }, prev: { passwords: [] } };
  out.description = { value: null, prev: null, default: null, restricted: false };
  out.malicious = { value: false, prev: false };

  return out;
};

export const parseSubmissionProfile = (
  settings: UserSettings,
  profile: ProfileSettings,
  name: string
): UserSettings => {
  if (!settings || !profile) return null;

  const profileName = name === 'interface' ? 'default' : name;
  const out = structuredClone(settings);
  const params = {} as SubmissionProfileParams;

  // Applying interface parameters
  Object.keys(out).forEach(key => {
    if (INTERFACE_KEYS.includes(key as InterfaceKey)) {
      out[key] = (profile[key] as ProfileSettings[ProfileKey]).value;
    }
  });

  // Applying the profile parameters
  Object.keys(profile).forEach(key => {
    const p = profile[key] as ProfileSettings[ProfileKey];
    if (PROFILE_KEYS.includes(key as ProfileKey) && !p.restricted && p.value !== p.default) {
      params[key] = p.value;
    }
  });

  // Applying the services parameter
  params.services = { excluded: [], rescan: [], resubmit: [], selected: [] };
  profile.services.forEach(cat => {
    if (cat.selected) params.services.selected.push(cat.name);
    else {
      cat.services.forEach(svr => {
        if (svr.selected) params.services.selected.push(svr.name);
      });
    }
  });

  // Applying the service spec parameters
  params.service_spec = {};
  profile.service_spec.forEach(svr => {
    svr.params.forEach(param => {
      if (param.value !== param.default && !param.restricted)
        params.service_spec = {
          ...params.service_spec,
          [svr.name]: { ...params.service_spec[svr.name], [param.name]: param.value }
        };
    });
  });

  // Applying the initial data
  out.initial_data = JSON.stringify(profile.initial_data.value, undefined, 2);

  out.submission_profiles = { ...out.submission_profiles, [profileName]: params };
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

  // Applying the initial data
  if (
    out?.initial_data?.value &&
    JSON.stringify(out?.initial_data?.value) !== JSON.stringify(out?.initial_data?.prev)
  ) {
    res = true;
  }

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

  // Applying the initial data
  out.initial_data.value = structuredClone(out.initial_data.prev);

  return out;
};

export const updatePreviousSubmissionValues = (out: ProfileSettings): ProfileSettings => {
  // Applying interface parameters
  Object.keys(out).forEach((key: InterfaceKey) => {
    if (INTERFACE_KEYS.includes(key)) out[key].prev = out[key].value;
  });

  // Applying the profile parameters
  Object.keys(out).forEach((key: ProfileKey) => {
    if (PROFILE_KEYS.includes(key)) out[key].prev = out[key].value;
  });

  // Applying the services parameter
  out.services.forEach((cat, i) => {
    out.services[i].prev = out.services[i].selected;
    cat.services.forEach((svr, j) => {
      out.services[i].services[j].prev = out.services[i].services[j].selected;
    });
  });

  // Applying the service spec parameters
  out.service_spec.forEach((svr, i) => {
    out.service_spec[i].params.forEach((param, j) => {
      out.service_spec[i].params[j].prev = out.service_spec[i].params[j].value;
    });
  });

  // Applying the initial data
  out.initial_data.prev = structuredClone(out.initial_data.value);

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
