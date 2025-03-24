import type { Configuration } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser } from 'components/models/ui/user';
import {
  loadDefaultProfile,
  loadSubmissionProfile,
  type ProfileSettings
} from 'components/routes/settings/settings.utils';
import { isURL } from 'helpers/utils';
import type { SubmitStore } from './submit.form';

export const getPreferredSubmissionProfile = (settings: UserSettings): string =>
  !settings
    ? null
    : Object.keys(settings.submission_profiles).includes(settings.preferred_submission_profile)
    ? settings.preferred_submission_profile
    : Object.keys(settings.submission_profiles)[0];

export const getDefaultExternalSources = (
  settings: UserSettings,
  configuration: Configuration
): ProfileSettings['default_external_sources'] => {
  let sources = Object.entries(configuration.submission.file_sources).reduce(
    (prev, [, fileSource]) => [...prev, ...fileSource.auto_selected],
    settings?.default_external_sources || []
  );
  sources = [...new Set(sources)].sort();
  return { prev: sources, value: sources };
};

// export const getDefaultMetadata = (data: object, configuration: Configuration): SubmitMetadata => {
//   const configKeys = Object.keys(configuration?.submission?.metadata?.submit || {});

//   const out = Object.entries(data).reduce(
//     (prev, [key, value]) => {
//       if (configKeys.includes(key)) prev.config.push([key, value]);
//       else prev.extra.push([key, value]);

//       return prev;
//     },
//     { config: [], extra: [] } as { config: [string, unknown][]; extra: [string, unknown][] }
//   );

//   return { config: Object.fromEntries(out.config), extra: JSON.stringify(Object.fromEntries(out.extra)) };
// };

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

export const isValidJSON = (value: string): boolean => {
  try {
    if (!value) return false;
    JSON.parse(value) as object;
    return true;
  } catch (e) {
    return false;
  }
};

export const isValidMetadata = (value: string, configuration: Configuration): string => {
  try {
    if (!value) return null;
    const data = JSON.parse(value) as object;

    Object.entries(configuration.submission.metadata.submit).forEach(([k]) => {
      if (k in data) {
        throw new Error(`Cannot use the reserved key "${k}" as it must be defined using the system's configuration`);
      }
    });

    return null;
  } catch (e) {
    return `${e}`;
  }
};
export const isSubmissionValid = (values: SubmitStore, configuration: Configuration) => {
  if (values.state.tab === 'file' && !values.file) {
    return false;
  }

  if (values.state.tab === 'hash' && !values.hash.type) {
    return false;
  }

  if (![500, 1000, 1500].includes(values.settings.priority.value)) {
    return false;
  }

  if (
    values.settings.ttl.value < (configuration.submission.max_dtl !== 0 ? 1 : 0) ||
    values.settings.ttl.value > (configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365)
  ) {
    return false;
  }

  if (
    Object.entries(configuration.submission.metadata.submit).some(([key, metadata]) => {
      const value = values.metadata?.data?.[key];
      if (metadata.required && !value) {
        return true;
      } else if (metadata.validator_type === 'uri' && !isURL((value || '') as string)) {
        return true;
      } else if (
        metadata.validator_type === 'regex' &&
        !((value || '') as string).match(new RegExp(metadata.validator_params.validation_regex as string))
      ) {
        return true;
      } else if (
        metadata.validator_type === 'integer' &&
        (value < metadata?.validator_params?.min || value > metadata?.validator_params?.max)
      ) {
        return true;
      } else {
        return false;
      }
    })
  ) {
    return false;
  }

  return true;
};

export const calculateFileHash = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async e => {
      const data = e.target.result as ArrayBuffer;
      try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(`Hashing failed: ${error}`);
      }
    };
    reader.onerror = () => {
      reject('File reading failed');
    };
    reader.readAsArrayBuffer(file);
  });

export const getHashQuery = (type: string, value: string) =>
  type === 'file' ? `sha256:"${value}"` : `${type}:"${value}"`;

export const isUsingExternalServices = (settings: ProfileSettings, configuration: Configuration): boolean =>
  settings.services.some(category =>
    category.services.some(
      service => configuration.ui.url_submission_auto_service_selection.includes(service.name) && service.selected
    )
  );
