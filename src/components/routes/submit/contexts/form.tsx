import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/mock/settings';
import generateUUID from 'helpers/uuid';

export type SubmitStore = {
  confirmation: { open: boolean; type: 'urlHash' | 'file' };
  file: File & { relativePath: string; fileName: string; path: string };
  input: { type: HashPatternMap; value: string; hasError: boolean };
  metadata: Metadata;
  settings: UserSettings;
  submissionMetadata: Metadata;
  submissionProfile: string;
  upload: { disable: boolean; progress: number };
  uuid: string;
};

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: {
    file: null,
    input: { type: undefined, value: '', hasError: false },
    metadata: {},
    settings: {
      classification: '',
      deep_scan: false,
      default_external_sources: [],
      default_zip_password: '',
      description: '',
      download_encoding: 'cart',
      executive_summary: false,
      expand_min_score: 0,
      generate_alert: false,
      ignore_cache: false,
      ignore_dynamic_recursion_prevention: false,
      ignore_filtering: false,
      malicious: false,
      priority: 0,
      services: [],
      service_spec: [],
      submission_view: 'report',
      ttl: 0,
      ...DEFAULT_SETTINGS
    },
    submissionMetadata: {},
    submissionProfile: null,
    uuid: generateUUID(),
    validate: false,
    validateCB: null,
    upload: { disable: false, progress: 0 },
    confirmation: { open: false, type: null }
  }
});
