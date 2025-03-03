import type { Configuration, Metadata } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import {
  loadDefaultProfile,
  loadSubmissionProfile,
  type ProfileSettings
} from 'components/routes/settings/settings.utils';
import { isURL } from 'helpers/utils';
import type { SubmitStore } from './submit.form';

export type SubmitMetadata = Record<string, unknown>;

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

export const getDefaultMetadata = (
  out: SubmitMetadata,
  configuration: Configuration,
  metadata: SubmitMetadata
): SubmitMetadata => ({
  ...out,
  ...(Object.fromEntries(
    Object.entries(configuration?.submission?.metadata?.submit || {}).reduce(
      (prev: [string, unknown][], [key, value]) => {
        if (value.default !== null) prev.push([key, value]);
        return prev;
      },
      []
    )
  ) as Metadata),
  ...metadata
});

export const switchProfile = (
  out: ProfileSettings,
  configuration: Configuration,
  settings: UserSettings,
  name: string
): ProfileSettings =>
  name === 'default'
    ? loadDefaultProfile(out, settings)
    : loadSubmissionProfile(out, settings, configuration.submission.profiles, name);

export const isValidJSON = (value: string): string => {
  try {
    if (!value) return null;
    JSON.parse(value);
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

  if (!values.settings.description.value) {
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
      const value = values.metadata?.config?.[key];
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

  if (isValidJSON(values.metadata.extra)) {
    return false;
  }

  return true;
};
