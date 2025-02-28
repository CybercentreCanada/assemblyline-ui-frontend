import type { Configuration, Metadata } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import {
  loadDefaultProfile,
  loadSubmissionProfile,
  type ProfileSettings
} from 'components/routes/settings/settings.utils';

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
